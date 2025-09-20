import { updateOrderStatus } from "../../db/orders.js";

/**
 * Helper function to round a value to a specific size
 * @param {number} value - The value to round
 * @param {number} size - The size to round to
 * @returns {number} The rounded value
 */
function roundLikeSize(value, size = 0.00001) {
  size = Number(size);
  return removeExtraZeroInFloat(value - removeExtraZeroInFloat(value % size));
}

/**
 * Helper function to remove extra zeros in a float
 * @param {number} float - The float to remove extra zeros from
 * @returns {number} The float without extra zeros
 */
function removeExtraZeroInFloat(float) {
  return Number(float.toFixed(8));
}

/**
 * PositionManager class to handle position tracking and updates
 */
class PositionManager {
  /**
   * Constructor for the PositionManager class
   * @param {string} strategyId - The ID of the strategy
   * @param {string} stockName - The name of the stock
   * @param {Function} logger - Logger function
   * @param {Object} broker - Broker instance
   * @param {Object} state - Optional state to restore from persistence
   */
  constructor(strategyId, stockName, logger, broker, state = {}) {
    this.strategyId = strategyId;
    this.stockName = stockName;
    this.logger = logger;
    this.broker = broker;
    this.currentPosition = state.currentPosition || null;
    this.symbolInfo = state.symbolInfo || null;
  }
  
  /**
   * Convert the position manager to JSON for persistence
   * @returns {Object} JSON representation of the position manager
   */
  toJSON() {
    return {
      strategyId: this.strategyId,
      stockName: this.stockName,
      currentPosition: this.currentPosition,
      symbolInfo: this.symbolInfo
    };
  }

  /**
   * Get the strategy ID
   * @returns {string} The strategy ID
   */
  getStrategyId() {
    return this.strategyId;
  }

  /**
   * Set the symbol information
   * @param {Object} symbolInfo - Information about the symbol
   */
  setSymbolInfo(symbolInfo) {
    this.symbolInfo = symbolInfo;
  }

  /**
   * Get the symbol information
   * @returns {Object} The symbol information
   */
  getSymbolInfo() {
    return this.symbolInfo;
  }

  /**
   * Get the current position
   * @returns {Object|null} The current position or null if no position
   */
  getCurrentPosition() {
    return this.currentPosition;
  }

  /**
   * Set the current position
   * @param {Object} position - The position to set
   */
  setCurrentPosition(position) {
    this.currentPosition = position;
  }

  /**
   * Clear the current position
   */
  clearPosition() {
    this.currentPosition = null;
  }

  /**
   * Update the position status
   * @param {string} status - The new status
   */
  updatePositionStatus(status) {
    if (!this.currentPosition) return;
    this.currentPosition.status = status;
    updateOrderStatus(this.currentPosition.orderId, status);
  }

  /**
   * Check if there is an open position
   * @returns {Promise<void>}
   */
  async checkPosition() {
    if (!this.currentPosition) return;

    return await this.broker.openPositions().then((res) => {
      if (res.size === 0) {
        const { stopLoss } = this.currentPosition;
        this.logger.info(
          `-------- Position already exited with Stop Loss ${stopLoss} ---------`
        );

        this.clearPosition();
        return;
      }
    });
  }

  /**
   * Force exit a position
   * @param {string} side - The side to exit (Buy or Sell)
   * @returns {Promise<void>}
   */
  async forceExit(side) {
    if (!this.currentPosition) return;

    this.logger.info("inside Force Exit");
    return await this.broker.exitPosition(side).then((res) => {
      if (!res) return;

      this.clearPosition();
    });
  }

  /**
   * Update the stop loss for the current position
   * @param {number} stopLoss - The new stop loss
   * @returns {Promise<void>}
   */
  async updateStopLoss(stopLoss) {
    if (!this.currentPosition) return;

    stopLoss = roundLikeSize(stopLoss, this.symbolInfo?.priceFilter?.tickSize);

    if (this.currentPosition.stopLoss === stopLoss) return;

    return await this.broker.modifyPosition(stopLoss).then((res) => {
      if (!res) return;
      this.currentPosition.stopLoss = stopLoss;
    });
  }
}

export { PositionManager };