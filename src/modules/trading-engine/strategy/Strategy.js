import _ from "lodash";
import broker from "../../exchange/index.js";
import getInstrumentInfo from "../../exchange/instrument.js";
import { OrderManager } from "../order/OrderManager.js";
import { PositionManager } from "../position/PositionManager.js";
import { RiskManager } from "../risk/RiskManager.js";
import { BaseStrategy } from "./BaseStrategy.js";

function float2int(value) {
  return value | 0;
}

function removeExtraZeroInFloat(float) {
  return Number(float.toFixed(8));
}

function roundLikeSize(value, size = 0.00001) {
  size = Number(size);
  return removeExtraZeroInFloat(value - removeExtraZeroInFloat(value % size));
}

/**
 * Strategy class that extends BaseStrategy and implements the strategy pattern
 * This class is maintained for backward compatibility
 */
class Strategy extends BaseStrategy {
  constructor(
    stockName,
    timeFrame,
    strategyName,
    persistTradesFn,
    config = Strategy.getDefaultConfig(),
    state = {}
  ) {
    super(stockName, timeFrame, strategyName, persistTradesFn, config, state);

    // Initialize properties for backward compatibility
    this.id = state.id;
    this.capital = parseInt(config.capital);
    this.riskPercentage = parseFloat(config.riskPercentage);
    this.precise = parseInt(config.precise) || 0;
    this.risk = this.capital * (this.riskPercentage / 100);

    // Initialize broker
    this.broker = new broker.Trade(this.stockName, this.logger);

    // Initialize managers with state if available
    const riskManagerState = state.riskManager || {};
    this._riskManager = new RiskManager(stockName, this.logger, config, riskManagerState);

    const positionManagerState = state.positionManager || {};
    this._positionManager = new PositionManager(this.id, stockName, this.logger, this.broker, positionManagerState);

    const orderManagerState = state.orderManager || {};
    this._orderManager = new OrderManager(stockName, this.logger, this._positionManager, this._riskManager, this.stock, orderManagerState);

    // For backward compatibility
    if (state.currentPosition && !positionManagerState.currentPosition) {
      this._positionManager.setCurrentPosition(state.currentPosition);
    }

    if (state.symbolInfo && !positionManagerState.symbolInfo) {
      this._positionManager.setSymbolInfo(state.symbolInfo);
    }
  }

  /**
   * Convert the strategy to JSON for persistence
   * @returns {Object} JSON representation of the strategy
   */
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
      // capital: 100000,
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
    this.logger.info("-------- Got A Quote, Resuming Strategy ---------");

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
    this.logger.info("-------- Strategy Started ---------");

    try {
      this.symbolInfo = await getInstrumentInfo(this.stockName, this.logger);
      this._positionManager.setSymbolInfo(this.symbolInfo);
      this.logger.debug("Symbol info set in position manager", this.symbolInfo);
    } catch (error) {
      this.logger.error("Failed to get instrument info", error);
    }
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
