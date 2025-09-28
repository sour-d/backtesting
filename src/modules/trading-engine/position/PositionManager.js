import { updateOrderStatus } from "../../database/orders.js";
import broker from "../../exchange/index.js";

function roundLikeSize(value, size = 0.00001) {
  size = Number(size);
  return removeExtraZeroInFloat(value - removeExtraZeroInFloat(value % size));
}

function removeExtraZeroInFloat(float) {
  return Number(float.toFixed(8));
}

class PositionManager {
  constructor(logger, symbol, state = {}) {
    this.logger = logger;
    this.symbol = symbol;
    this.currentPosition = state.currentPosition || null;
    this.broker = new broker.Trade(this.symbol, this.logger);
  }

  toJSON() {
    return {
      currentPosition: this.currentPosition,
    };
  }

  getCurrentPosition() {
    return this.currentPosition;
  }

  setCurrentPosition(position) {
    this.currentPosition = position;
  }

  clearPosition() {
    this.currentPosition = null;
  }

  updatePositionStatus(status) {
    if (!this.currentPosition) return;
    this.currentPosition.status = status;
    updateOrderStatus(this.currentPosition.orderId, status);
  }

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

  async updateStopLoss(stopLoss) {
    if (!this.currentPosition) return;

    const symbolInfo = await this.symbol?.getInfo();
    stopLoss = roundLikeSize(stopLoss, symbolInfo?.priceFilter?.tickSize);

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