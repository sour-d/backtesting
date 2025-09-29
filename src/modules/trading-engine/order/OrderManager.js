import { createTrade } from "../../database/trades.js";
import broker from "../../exchange/index.js";
import { createOrder as storeOrderDetails, updateOrderStatus } from "../../database/orders.js";
import { error } from "console";

function roundLikeSize(value, size = 0.00001) {
  size = Number(size);
  return removeExtraZeroInFloat(value - removeExtraZeroInFloat(value % size));
}

function removeExtraZeroInFloat(float) {
  return Number(float.toFixed(8));
}

class OrderManager {
  constructor(logger, positionManager, riskManager, symbol, state = {}) {
    this.logger = logger;
    this.symbol = symbol;
    this.broker = new broker.Trade(this.symbol.name, this.logger);
    this.positionManager = positionManager;
    this.riskManager = riskManager;
  }

  toJSON() {
    return {};
  }

  async placeOrder(risk, price, tpPrice, side = "Buy", isLimitOrder = false) {
    if (await this.isLastOrderFilled()) return;

    const symbolInfo = await this.symbol?.getInfo();
    price = roundLikeSize(price, symbolInfo?.priceFilter?.tickSize);
    tpPrice = roundLikeSize(tpPrice, symbolInfo?.priceFilter?.tickSize);

    const currentPosition = this.positionManager.getCurrentPosition();
    if (currentPosition) {
      const { price: pastPrice, risk: pastRisk } = currentPosition;
      if (pastPrice === price && pastRisk === risk) return;
      this.cancelLastOrder();
      this.positionManager.clearPosition();
    }

    let stopLoss = side === "Buy" ? price - risk : price + risk;
    stopLoss = roundLikeSize(stopLoss, symbolInfo?.priceFilter?.tickSize);

    let quantity = this.riskManager.stocksCanBeBought(risk, price);
    quantity = roundLikeSize(quantity, symbolInfo?.lotSizeFilter?.qtyStep);

    const limitPrice = isLimitOrder ? price : 0;
    return await this.broker
      .placeOrder(quantity, limitPrice, tpPrice, stopLoss, side)
      .then((res) => {
        if (!res || res.retMsg !== "OK") {
          this.logger.error("Placing Order failed", { response: res });
          return false;
        };

        const orderDetails = {
          orderId: res.result.orderId,
          strategyId: this.symbol.getStrategyId(),
          price,
          timestamp: new Date(),
          quantity: quantity,
          risk,
          orderType: isLimitOrder ? "Limit" : "Market",
          side,
          status: "Pending",
        };
        this.logger.info("Placing Order successful", orderDetails);

        this.positionManager.setCurrentPosition(orderDetails);
        storeOrderDetails(orderDetails);
        // this.riskManager.setCapital(this.riskManager.getCapital() - quantity * price);
        return true;
      });
  }

  async isLastOrderFilled() {
    const currentPosition = this.positionManager.getCurrentPosition();
    if (!currentPosition) return false;

    const { orderId, status } = currentPosition;
    if (status === "Filled") return true;

    this.logger.info("Last order status check", { orderId });
    return await this.broker.activeOrders().then(async (res) => {
      const currentOrderInfo = res.find(
        (orderInfo) => orderInfo.orderId === orderId
      );
      if (!currentOrderInfo?.orderId) {
        this.positionManager.updatePositionStatus("Filled");
        this.logger.info("Last Order Filled", { orderId });
        const { price, quantity } = currentPosition;
        await updateOrderStatus(orderId, "Filled");
        return true;
      }
      this.logger.info("Last Order still in orderbook", { orderId });
    });
  }

  cancelLastOrder() {
    this.logger.error("Cancelling last order but method not implemented");
  }
}

export { OrderManager };