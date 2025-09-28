import _ from "lodash";
import broker from "../../exchange/index.js";
import { OrderManager } from "../order/OrderManager.js";
import { PositionManager } from "../position/PositionManager.js";
import { RiskManager } from "../risk/RiskManager.js";
import { BaseStrategy } from "./BaseStrategy.js";
import Symbol from "./Symbol.js";

/**
 * Strategy class that extends BaseStrategy and implements the strategy pattern
 * This class is maintained for backward compatibility
 */
class Strategy extends BaseStrategy {
  constructor(
    stockName,
    timeFrame,
    strategyName,
    config = Strategy.getDefaultConfig(),
    state = {}
  ) {
    super(stockName, timeFrame, strategyName, config, state);

    // Initialize properties for backward compatibility
    // Note: this.id is already set in BaseStrategy constructor with UUID
    this.capital = parseInt(config.capital);
    this.riskPercentage = parseFloat(config.riskPercentage);
    this.precise = parseInt(config.precise) || 0;
    this.risk = this.capital * (this.riskPercentage / 100); // need to fix

    // symbol info
    this.symbol = new Symbol(this.stockName, this.id);

    // Initialize broker
    this.broker = new broker.Trade(this.stockName, this.logger);

    // Initialize managers with state if available
    const riskManagerState = state.riskManager || {};
    this._riskManager = new RiskManager(this.logger, config, riskManagerState);

    const positionManagerState = state.positionManager || {};
    this._positionManager = new PositionManager(this.logger, this.symbol, positionManagerState);

    const orderManagerState = state.orderManager || {};
    this._orderManager = new OrderManager(this.logger, this._positionManager, this._riskManager, this.symbol, orderManagerState);

    // For backward compatibility
    if (state.currentPosition && !positionManagerState.currentPosition) {
      this._positionManager.setCurrentPosition(state.currentPosition);
    }
  }

  toJSON() {
    return {
      ...super.toJSON(),
      orderManager: this._orderManager.toJSON(),
      positionManager: this._positionManager.toJSON(),
      riskManager: this._riskManager.toJSON()
    };
  }

  static getDefaultConfig() {
    return {
      riskPercentage: 5,
    };
  }

  // Delegate to RiskManager
  updateCapital() {
    return this._riskManager.updateCapital();
  }

  // Delegate to RiskManager
  stocksCanBeBought(riskForOneStock, buyingPrice) {
    return this._riskManager.stocksCanBeBought(riskForOneStock, buyingPrice);
  }

  // Abstract methods that must be implemented by subclasses
  async buy() {
    throw new Error("Method not implemented.");
  }

  async sell() {
    throw new Error("Method not implemented.");
  }

  async longSquareOff() {
    throw new Error("Method not implemented.");
  }

  async shortSquareOff() {
    throw new Error("Method not implemented.");
  }

  // Delegate to OrderManager
  async isLastOrderFilled() {
    return this._orderManager.isLastOrderFilled();
  }

  // Delegate to OrderManager
  cancelLastOrder() {
    return this._orderManager.cancelLastOrder();
  }

  // Delegate to OrderManager
  async placeOrder(risk, price, tpPrice, side = "Buy", isLimitOrder = false) {
    return this._orderManager.placeOrder(risk, price, tpPrice, side, isLimitOrder);
  }

  // Delegate to PositionManager
  async updateStopLoss(stopLoss) {
    return this._positionManager.updateStopLoss(stopLoss);
  }

  // Delegate to PositionManager
  async checkPosition() {
    return this._positionManager.checkPosition();
  }

  // Delegate to PositionManager
  async forceExit(side) {
    return this._positionManager.forceExit(side);
  }

  // Implementation of BaseStrategy methods
  async trade() {
    this.logger.info("Resuming Strategy onQuote");

    this.updateCapital();
    this.currentPosition = this._positionManager.getCurrentPosition();
    this.currentPosition && (await this.checkPosition());

    if (this.currentPosition?.side === "Buy") {
      await this.longSquareOff();
      return;
    }
    if (this.currentPosition?.side === "Sell") {
      await this.shortSquareOff();
      return;
    }

    if (await this.buy()) return;
    if (await this.sell()) return;
  }

  async execute() {
    this.logger.info("Strategy Started Execution");
  }

  // Implementation of BaseStrategy methods for manager access
  getPositionManager() {
    return this._positionManager;
  }

  getOrderManager() {
    return this._orderManager;
  }

  getRiskManager() {
    return this._riskManager;
  }
}

export { Strategy };
