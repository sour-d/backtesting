import { createTrade } from "../../database/trades.js";
import broker from "../../exchange/index.js";
import { createOrder as storeOrderDetails } from "../../database/orders.js";
import { error } from "console";

function roundLikeSize(value, size = 0.00001) {
  size = Number(size);
  return removeExtraZeroInFloat(value - removeExtraZeroInFloat(value % size));
}

function removeExtraZeroInFloat(float) {
  return Number(float.toFixed(8));
}

class OrderManager {
  constructor(logger, positionManager, riskManager, state = {}) {
    this.logger = logger;
    this.broker = new broker.Trade(this.stockName, this.logger);
    this.positionManager = positionManager;
    this.riskManager = riskManager;
  }

  toJSON() {
    return {};
  }

  async placeOrder(risk, price, tpPrice, side = "Buy", isLimitOrder = false) {
    if (await this.isLastOrderFilled()) return;
    await this.riskManager.updateCapital();

    const symbolInfo = this.positionManager.getSymbolInfo();
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
    this.logger.info("Placing Order", {
      quantity,
      limitPrice,
      tpPrice,
      stopLoss,
      side,
      isLimitOrder,
    });
    return await this.broker
      .placeOrder(quantity, limitPrice, tpPrice, stopLoss, side)
      .then((res) => {
        if (!res || res.retMsg !== "OK") {
          this.logger.error("Placing Order failed", { response: res });
          return false;
        };

        const orderDetails = {
          orderId: res.result.orderId,
          strategyId: this.positionManager.getStrategyId(),
          price,
          timestamp: new Date().getTime(),
          quantity: quantity,
          risk,
          stoploss: stopLoss,
          takeprofit: tpPrice,
          orderType: isLimitOrder ? "Limit" : "Market",
          side,
          status: "Pending",
        };
        this.logger.info("Placing Order successful", orderDetails);

        this.positionManager.setCurrentPosition(orderDetails);
        storeOrderDetails(orderDetails);

        this.riskManager.updateCapital();
        return true;
      });
  }

  async isLastOrderFilled() {
    const currentPosition = this.positionManager.getCurrentPosition();
    if (!currentPosition) return false;

    const { orderId, status } = currentPosition;
    if (status === "Filled") return true;

    this.logger.info("Checking last order status", { orderId });
    return await this.broker.activeOrders().then(async (res) => {
      const currentOrderInfo = res.find(
        (orderInfo) => orderInfo.orderId === orderId
      );
      if (!currentOrderInfo?.orderId) {
        this.positionManager.updatePositionStatus("Filled");
        this.logger.info("Last Order Filled", { orderId });

        // Create a trade record
        const trade = {
          orderId: currentPosition.orderId,
          strategyId: currentPosition.strategyId,
          price: currentPosition.price,
          timestamp: new Date(),
          qty: currentPosition.quantity,
          side: currentPosition.side,
        };
        await createTrade(trade);

        return true;
      }
      this.logger.info("Last Order Not Filled Yet", { orderId });
    });
  }

  cancelLastOrder() {
    this.logger.error("Cancelling last order but method not implemented");
  }
}

export { OrderManager };