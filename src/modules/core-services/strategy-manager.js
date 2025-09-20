import { createStrategy, getAllStrategies, getSpecificStrategy, updateStrategyState } from "../database/strategies.js";
import { logFileName } from "../utils/index.js";
import StrategyFactory from "./strategy-factory.js";
import logger from "../logger/index.js";

const isProd = process.env.ENV === "prod";
const STRATEGY_UPDATE_INTERVAL = process.env.STRATEGY_UPDATE_INTERVAL || 5000;

/**
 * LiveStrategyManager class for managing strategy lifecycle
 * Handles creation, loading, and cleanup of strategies
 */
class LiveStrategyManager {
  /**
   * Constructor
   */
  constructor() {
    this.runningStrategies = {};
    this.log = logger({ component: 'LiveStrategyManager' });
  }

  /**
   * Retry a database operation with exponential backoff
   * @param {Function} operation - The database operation to retry
   * @param {number} maxRetries - Maximum number of retry attempts
   * @param {number} initialDelay - Initial delay in milliseconds
   * @returns {Promise<any>} Result of the operation
   * @private
   */
  async _retryDbOperation(operation, maxRetries = 3, initialDelay = 300) {
    let lastError;
    let delay = initialDelay;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        if (attempt === maxRetries) break;

        // Log retry attempt
        this.log.warn(`Database operation failed, retrying (${attempt + 1}/${maxRetries}): ${error.message}`);

        // Wait with exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
      }
    }

    throw lastError;
  }

  /**
   * Load all strategies from the database
   * @returns {Promise<void>}
   */
  async loadStrategies() {
    if (!isProd) return;

    this.log.info('Loading strategies from database...');

    try {
      // Use retry mechanism for database operation
      const allStrategies = await this._retryDbOperation(
        () => getAllStrategies(),
        3,
        300
      );

      this.log.info(`Found ${allStrategies.length} strategies in database`);

      let loadedCount = 0;
      let failedCount = 0;

      for (const dbStrategy of allStrategies) {
        const { id, strategyName, stockName, timeFrame, config, state } = dbStrategy;
        this.log.info(`Loading strategy: ${strategyName} for ${stockName} (${timeFrame})`);

        try {
          // Create a dummy persist function for loaded strategies
          const persistTradesFn = () => { };

          // Use the factory to create the strategy with validation
          const strategy = StrategyFactory.createStrategy(
            strategyName,
            stockName,
            timeFrame,
            persistTradesFn,
            config,
            { ...state, id }
          );

          // Add the strategy to running strategies
          this.addStrategy(strategy, false);
          this.log.info(`Successfully loaded strategy: ${strategyName} for ${stockName} (${timeFrame})`);
          loadedCount++;
        } catch (error) {
          this.log.error(`Failed to load strategy ${strategyName} for ${stockName}: ${error.message}`);
          failedCount++;
        }
      }

      this.log.info(`Strategy loading complete. Loaded: ${loadedCount}, Failed: ${failedCount}`);
      return { loadedCount, failedCount };
    } catch (error) {
      this.log.error(`Failed to load strategies from database: ${error.message}`);
      return { loadedCount: 0, failedCount: 0, error: error.message };
    }
  }

  /**
   * Add a strategy to the running strategies
   * @param {Object} strategy - Strategy instance
   * @param {boolean} isNew - Whether this is a new strategy or loaded from DB
   * @returns {Promise<void>}
   */
  async addStrategy(strategy, isNew = true) {
    const { stockName, timeFrame, strategyName, config } = strategy;
    const strategyKey = logFileName(stockName, timeFrame, strategyName);
    const log = logger({ component: 'LiveStrategyManager', strategyName, stockName, timeFrame });

    try {
      // Check if strategy already exists
      if (this.runningStrategies[strategyKey]) {
        log.warn(`Strategy already exists with key: ${strategyKey}. Replacing it.`);
        this.stopStrategy({ stockName, timeFrame, strategyName });
      }

      // For new strategies, persist to database in production
      if (isNew && isProd) {
        log.info(`Creating new strategy in database: ${strategyName} for ${stockName}`);
        try {
          // Save the complete strategy state including all manager states
          // Use retry mechanism for database operation
          const dbStrategy = await this._retryDbOperation(
            () => createStrategy({
              strategyName,
              stockName,
              timeFrame,
              config,
              state: strategy.toJSON(),
            }),
            3,
            300
          );
          strategy.id = dbStrategy.id;
          log.info(`Strategy created with ID: ${dbStrategy.id}`);
        } catch (error) {
          log.error(`Failed to persist strategy to database: ${error.message}`);
          throw new Error(`Failed to persist strategy: ${error.message}`);
        }
      } else if (!isNew) {
        log.info(`Adding existing strategy from database: ${strategyName} for ${stockName}`);
      }

      // Add to running strategies
      this.runningStrategies[strategyKey] = strategy;
      log.info(`Strategy added to running strategies with key: ${strategyKey}`);

      // Set up periodic state updates in production
      if (isProd && strategy.id) {
        log.info(`Setting up periodic state updates for strategy: ${strategyKey}`);

        // Create an interval for state updates
        const updateInterval = setInterval(async () => {
          try {
            // Save the complete strategy state including all manager states
            const state = strategy.toJSON();
            // Use retry mechanism for database updates
            await this._retryDbOperation(
              () => updateStrategyState(strategy.id, state),
              3,
              300
            );
          } catch (error) {
            log.error(`Failed to update strategy state after retries: ${error.message}`);
          }
        }, STRATEGY_UPDATE_INTERVAL);

        // Store the interval ID for potential cleanup
        strategy._updateInterval = updateInterval;
      }

      return strategy;
    } catch (error) {
      log.error(`Failed to add strategy: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get a strategy by its parameters
   * @param {Object} params - Strategy parameters
   * @param {string} params.stockName - Stock symbol
   * @param {string} params.timeFrame - Time frame
   * @param {string} params.strategyName - Strategy name
   * @param {boolean} params.attemptRecovery - Whether to attempt recovery if strategy not found
   * @returns {Promise<Object|null>} Strategy instance or null if not found
   */
  async getStrategy({ stockName, timeFrame, strategyName, attemptRecovery = false }) {
    const strategyKey = logFileName(stockName, timeFrame, strategyName);
    const log = logger({ component: 'LiveStrategyManager', strategyName, stockName, timeFrame });

    try {
      const strategy = this.runningStrategies[strategyKey];
      if (strategy) {
        log.info(`Retrieved strategy: ${strategyName} for ${stockName} (${timeFrame})`);
        return strategy;
      } else {
        log.warn(`Strategy not found: ${strategyName} for ${stockName} (${timeFrame})`);

        // Attempt recovery if requested
        if (attemptRecovery) {
          log.info(`Attempting to recover strategy: ${strategyName} for ${stockName}`);
          return await this._recoverStrategy({ stockName, timeFrame, strategyName });
        }

        return null;
      }
    } catch (error) {
      log.error(`Error retrieving strategy: ${error.message}`);
      return null;
    }
  }

  /**
   * Attempt to recover a strategy from database
   * @param {Object} params - Strategy parameters
   * @param {string} params.stockName - Stock symbol
   * @param {string} params.timeFrame - Time frame
   * @param {string} params.strategyName - Strategy name
   * @returns {Promise<Object|null>} Recovered strategy or null
   * @private
   */
  async _recoverStrategy({ stockName, timeFrame, strategyName }) {
    const log = logger({ component: 'LiveStrategyManager', strategyName, stockName, timeFrame });

    try {
      // Try to find strategy in database
      const dbStrategy = await this._retryDbOperation(
        () => getSpecificStrategy(strategyName, stockName, timeFrame),
        2,
        300
      );

      if (!dbStrategy) {
        log.warn(`Cannot recover - strategy not found in database: ${strategyName} for ${stockName}`);
        return null;
      }

      log.info(`Found strategy in database, attempting recovery: ${strategyName} for ${stockName}`);

      // Create new strategy instance with saved state
      const { id, config, state } = dbStrategy;
      const persistTradesFn = () => { };
      const recoveredStrategy = StrategyFactory.createStrategy(
        strategyName,
        stockName,
        timeFrame,
        persistTradesFn,
        config,
        { ...state, id }
      );
      
      await this.addStrategy(recoveredStrategy, false);

      if (recoveredStrategy) {
        log.info(`Successfully recovered strategy: ${strategyName} for ${stockName}`);
        return recoveredStrategy;
      } else {
        log.error(`Failed to recover strategy: ${strategyName} for ${stockName}`);
        return null;
      }
    } catch (error) {
      log.error(`Error during strategy recovery: ${error.message}`);
      return null;
    }
  }
  /**
   * Stop a running strategy and clean up resources
   * @param {Object} params - Strategy parameters
   * @param {string} params.stockName - Stock symbol
   * @param {string} params.timeFrame - Time frame
   * @param {string} params.strategyName - Strategy name
   * @returns {boolean} Success status
   */
  async stopStrategy({ stockName, timeFrame, strategyName }) {
    const strategyKey = logFileName(stockName, timeFrame, strategyName);
    const log = logger({ component: 'LiveStrategyManager', strategyName, stockName, timeFrame });

    try {
      const strategy = this.runningStrategies[strategyKey];
      if (!strategy) {
        log.warn(`Cannot stop strategy - not found: ${strategyName} for ${stockName}`);
        return false;
      }

      // Clear update interval if exists
      if (strategy._updateInterval) {
        clearInterval(strategy._updateInterval);
        log.info(`Cleared update interval for strategy: ${strategyKey}`);
      }

      // Persist final state
      if (isProd && strategy.id) {
        try {
          const state = strategy.toJSON();
          await this._retryDbOperation(
            () => updateStrategyState(strategy.id, state),
            3,
            300
          );
          log.info(`Persisted final state for strategy: ${strategyKey}`);
        } catch (error) {
          log.error(`Failed to persist final strategy state after retries: ${error.message}`);
        }
      }

      // Stop any running processes in the strategy
      if (typeof strategy.stop === 'function') {
        strategy.stop();
        log.info(`Stopped strategy processes: ${strategyKey}`);
      }

      // Remove from running strategies
      delete this.runningStrategies[strategyKey];
      log.info(`Removed strategy from running strategies: ${strategyKey}`);

      return true;
    } catch (error) {
      log.error(`Error stopping strategy: ${error.message}`);
      return false;
    }
  }

  /**
   * Stop all running strategies and clean up resources
   * @returns {number} Number of strategies stopped
   */
  async stopAllStrategies() {
    this.log.info('Stopping all running strategies...');
    let stoppedCount = 0;

    try {
      const strategyKeys = Object.keys(this.runningStrategies);

      for (const key of strategyKeys) {
        const strategy = this.runningStrategies[key];
        const { stockName, timeFrame, strategyName } = strategy;
        await this.stopStrategy({ stockName, timeFrame, strategyName });
        stoppedCount++;
      }

      this.log.info(`Stopped ${stoppedCount} strategies`);
      return stoppedCount;
    } catch (error) {
      this.log.error(`Error stopping all strategies: ${error.message}`);
      return stoppedCount;
    }
  }
}

export default LiveStrategyManager;