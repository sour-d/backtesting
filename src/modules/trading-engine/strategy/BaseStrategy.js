import { Trades } from "../outcome/Trades.js";
import { LiveQuoteStorage } from "../quoteStorage/LiveQuoteStorage.js";
import logger from "../../logger/index.js";
import getInstrumentInfo from "../../exchange/instrument.js";

/**
 * BaseStrategy abstract class that defines the core functionality and interface
 * for all trading strategies.
 */
class BaseStrategy {
  stock;
  trades;
  stockName;
  logger;
  strategyName;
  id;
  timeFrame;

  /**
   * Constructor for the BaseStrategy class
   * @param {string} stockName - The name of the stock to trade
   * @param {string} timeFrame - The time frame for the strategy
   * @param {string} strategyName - The name of the strategy
   * @param {Object} config - Configuration for the strategy
   * @param {Object} state - Current state of the strategy
   */
  constructor(
    stockName,
    timeFrame,
    strategyName,
    config = {},
    state = {}
  ) {
    this.id = state.id;
    this.stockName = stockName;
    this.strategyName = strategyName;
    this.timeFrame = timeFrame;

    this.trades = state.trades ? Trades.fromJSON(state.trades) : new Trades(this);
    
    // Create a structured logger with component and strategy information
    this.logger = logger({
      component: 'Strategy',
      stockName: this.stockName,
      timeFrame: this.timeFrame,
      strategyName: this.strategyName
    });
    
    this.stock = new LiveQuoteStorage(
      () => this.trade(),
      200,
      stockName,
      timeFrame,
      stockName,
      this.logger
    );
  }

  /**
   * Convert the strategy to JSON for persistence
   * @returns {Object} JSON representation of the strategy
   */
  toJSON() {
    return {
      id: this.id,
      stockName: this.stockName,
      strategyName: this.strategyName,
      timeFrame: this.timeFrame,
      trades: this.trades.toJSON(),
    };
  }

  /**
   * Get the default configuration for the strategy
   * @returns {Object} Default configuration
   */
  static getDefaultConfig() {
    return {};
  }

  /**
   * Buy implementation - must be overridden by subclasses
   * @returns {Promise<boolean>} True if a buy order was placed, false otherwise
   */
  async buy() {
    throw new Error("Method not implemented.");
  }

  /**
   * Sell implementation - must be overridden by subclasses
   * @returns {Promise<boolean>} True if a sell order was placed, false otherwise
   */
  async sell() {
    throw new Error("Method not implemented.");
  }

  /**
   * Long square off implementation - must be overridden by subclasses
   * @returns {Promise<void>}
   */
  async longSquareOff() {
    throw new Error("Method not implemented.");
  }

  /**
   * Short square off implementation - must be overridden by subclasses
   * @returns {Promise<void>}
   */
  async shortSquareOff() {
    throw new Error("Method not implemented.");
  }

  /**
   * Trade method that orchestrates the strategy execution
   * This method is called when a new quote is received
   * @returns {Promise<void>}
   */
  async trade() {
    this.logger.info("Candle Received", { time: this.stock.now() });

    // Check if we have an open position
    const positionManager = this.getPositionManager();
    const currentPosition = positionManager.getCurrentPosition();
    
    if (currentPosition) {
      await positionManager.checkPosition();

      if (currentPosition.side === "Buy") {
        await this.longSquareOff();
        return;
      }
      if (currentPosition.side === "Sell") {
        await this.shortSquareOff();
        return;
      }
    }

    // Try to enter a new position
    if (await this.buy()) return;
    if (await this.sell()) return;
  }

  /**
   * Execute the strategy
   * @returns {Promise<void>}
   */
  async execute() {
    this.logger.info("Strategy Started Execution");
    
    // const symbolInfo = await getInstrumentInfo(this.stockName);
  }

  /**
   * Get the position manager instance
   * @returns {PositionManager} The position manager
   */
  getPositionManager() {
    throw new Error("Method not implemented.");
  }

  /**
   * Get the order manager instance
   * @returns {OrderManager} The order manager
   */
  getOrderManager() {
    throw new Error("Method not implemented.");
  }

  /**
   * Get the risk manager instance
   * @returns {RiskManager} The risk manager
   */
  getRiskManager() {
    throw new Error("Method not implemented.");
  }

  stop() {
    this.logger.info("-------- Strategy Stopped ---------");
    this.stock.stop();
  }
}

export { BaseStrategy };