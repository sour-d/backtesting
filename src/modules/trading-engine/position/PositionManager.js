import { updateOrderStatus } from "../../database/orders.js";

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
   * @param {Function} logger - Logger function
   * @param {Object} broker - Broker instance
   * @param {Object} state - Optional state to restore from persistence
   */
  constructor(logger, broker, strategyId, state = {}) {
    this.logger = logger;
    this.broker = broker;
    this.strategyId = strategyId;
    this.currentPosition = state.currentPosition || null;
  }

  getStrategyId() {
    return this.strategyId;
  }

  /**
   * Convert the position manager to JSON for persistence
   * @returns {Object} JSON representation of the position manager
   */
  toJSON() {
    return {
      currentPosition: this.currentPosition,
    };
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
          'Position already exited', { ...this.currentPosition, exitPrice: stopLoss }
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

    this.logger.info("Force Exiting Position", this.currentPosition);
    return await this.broker.exitPosition(side).then((res) => {
      if (!res) {
        this.logger.error("Failed to exit position", this.currentPosition);
        return;
      }

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

    this.logger.info("Updating Stop Loss", {
      currentPosition: this.currentPosition,
      newStopLoss: stopLoss,
    });
    return await this.broker.modifyPosition(stopLoss).then((res) => {
      if (!res) {
        this.logger.error("Failed to update stop loss", this.currentPosition);
        return;
      }
      this.currentPosition.stopLoss = stopLoss;
    });
  }
}

export { PositionManager };