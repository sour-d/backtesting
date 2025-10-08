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
    config = Strategy.getDefaultConfig(),
    state = {}
  ) {
    super(stockName, timeFrame, state);

    this.capital = parseInt(config.capital);
    this.riskPercentage = parseFloat(config.riskPercentage);
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

  async placeOrder(risk, price, tpPrice, side = "Buy", isLimitOrder = false) {
    return this._orderManager.placeOrder(risk, price, tpPrice, side, isLimitOrder);
  }

  async updateStopLoss(stopLoss) {
    return this._positionManager.updateStopLoss(stopLoss);
  }

  async checkPositionStatus(sideJob = false) {
    return this._positionManager.checkPositionStatus(sideJob);
  }

  async forceExit(side) {
    return this._positionManager.forceExit(side);
  }

  async trade() {
    this.logger.info("Resuming Strategy onQuote");

    this.currentPosition = this._positionManager.getCurrentPosition();
    this.currentPosition && (await this.checkPositionStatus());

    if (this.currentPosition) {
      this.logger.info("Square off condition Check");
    }
    if (this.currentPosition?.side === "Buy") {
      await this.longSquareOff();
      return;
    }
    if (this.currentPosition?.side === "Sell") {
      await this.shortSquareOff();
      return;
    }


    this.logger.info("Buy and sell Condition check");
    if (await this.buy()) return;
    if (await this.sell()) return;
  }

  execute() {
    this.logger.info("Strategy Started Execution");

    this.intervalId = setInterval(() => {
      this.checkPositionStatus(true);
    }, 30 * 60 * 1000);
  }

  stop() {
    this.logger.info("Strategy Stopped");
    this.stock.stop();
    clearInterval(this.intervalId);
  }

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
