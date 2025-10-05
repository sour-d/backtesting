import { createOrder, updateOrderStatus } from "../../database/orders.js";
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
    this.broker = new broker.Trade(this.symbol.name, this.logger);
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

  async checkPositionStatus(slient = false) { // move to order manager
    if (!this.currentPosition) return;

    !slient && this.logger.info("Checking active Position", this.currentPosition);
    return await this.broker.openPositions().then((res) => {
      if (res.size === 0) {
        const orderDetails = {
          orderId: this.currentPosition.orderId,
          strategyId: this.symbol.getStrategyId(),
          price: this.currentPosition.stopLoss,
          timestamp: new Date(),
          quantity: this.currentPosition.quantity,
          risk: this.currentPosition.risk,
          orderType: "Market",
          side: this.currentPosition.side === "Buy" ? "Sell" : "Buy",
          status: "Filled",
        };
        this.logger.info('Position already exited', orderDetails);
        createOrder(orderDetails);
        // this.riskManager.setCapital(this.riskManager.getCapital() + price * quantity);
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

  async updateStopLoss(stoploss) {
    if (!this.currentPosition) return;

    const symbolInfo = await this.symbol?.getInfo();
    stoploss = roundLikeSize(stoploss, symbolInfo?.priceFilter?.tickSize);

    if (this.currentPosition.stopLoss === stoploss) return;

    this.logger.info("Updating Stop Loss", {
      currentPosition: this.currentPosition,
      newStopLoss: stoploss,
    });
    return await this.broker.modifyPosition(stoploss).then((res) => {
      if (!res) {
        // this.logger.error("Updating stop loss Failed", this.currentPosition);
        return;
      }
      this.logger.info("Updating Stop Loss successful", res);
      this.currentPosition.stoploss = stoploss;
    });
  }
}

export { PositionManager };