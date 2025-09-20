/**
 * StrategyFactory.js
 * Factory class for creating strategy instances with proper validation and error handling
 */

import strategies from "../trading-engine/strategy/index.js";
import logger from "../logger/index.js";

/**
 * Factory class for creating strategy instances
 */
class StrategyFactory {
  /**
   * Create a new strategy instance
   * 
   * @param {string} strategyName - Name of the strategy class
   * @param {string} stockName - Stock symbol
   * @param {string} timeFrame - Time frame for the strategy
   * @param {Function} persistTradesFn - Function to persist trades
   * @param {Object} config - Strategy configuration
   * @param {Object} state - Strategy state for restoration
   * @returns {Object} Strategy instance
   * @throws {Error} If strategy class not found or validation fails
   */
  static createStrategy(strategyName, stockName, timeFrame, persistTradesFn, config = {}, state = {}) {
    // Find the strategy class
    const Strategy = strategies.find(strategy => strategy.name === strategyName);

    if (!Strategy) {
      throw new Error(`Strategy class not found: ${strategyName}`);
    }

    // Validate required parameters
    this.validateParameters(strategyName, stockName, timeFrame);

    // Validate and merge configuration with defaults
    const validatedConfig = this.validateConfig(Strategy, config);

    try {
      // Create the strategy instance
      return new Strategy(
        stockName,
        timeFrame,
        persistTradesFn,
        validatedConfig,
        state
      );
    } catch (error) {
      const log = logger({ strategyName, stockName, timeFrame });
      log.error(`Failed to create strategy: ${error.message}`);
      throw new Error(`Failed to create strategy ${strategyName}: ${error.message}`);
    }
  }

  /**
   * Validate required strategy parameters
   * 
   * @param {string} strategyName - Name of the strategy
   * @param {string} stockName - Stock symbol
   * @param {string} timeFrame - Time frame
   * @throws {Error} If validation fails
   */
  static validateParameters(strategyName, stockName, timeFrame) {
    if (!strategyName) {
      throw new Error('Strategy name is required');
    }

    if (!stockName) {
      throw new Error('Stock name is required');
    }

    if (!timeFrame) {
      throw new Error('Time frame is required');
    }
  }

  /**
   * Validate and merge configuration with defaults
   * 
   * @param {Class} Strategy - Strategy class
   * @param {Object} config - User provided configuration
   * @returns {Object} Validated configuration
   */
  static validateConfig(Strategy, config = {}) {
    // Get default configuration from the strategy
    const defaultConfig = Strategy.getDefaultConfig ? Strategy.getDefaultConfig() : {};

    // Merge with provided config
    const mergedConfig = { ...defaultConfig, ...config };

    // Validate required configuration fields
    if (!mergedConfig.capital) {
      throw new Error('Capital is required in strategy configuration');
    }

    if (!mergedConfig.riskPercentage) {
      throw new Error('Risk percentage is required in strategy configuration');
    }

    return mergedConfig;
  }
}

export default StrategyFactory;