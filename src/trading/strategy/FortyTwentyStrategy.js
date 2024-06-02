import { to } from "mathjs";
import { Strategy } from "./Strategy.js";
import { trade } from "../../broker";

const slOrTpChanged = (lastPlacedOrder, triggerPrice, stopLoss) => {
  if (!lastPlacedOrder) return false;
  return (
    lastPlacedOrder.triggerPrice !== triggerPrice ||
    lastPlacedOrder.stopLoss !== stopLoss
  );
};

class FortyTwentyStrategy extends Strategy {
  config;

  constructor(
    stockName,
    timeFrame,
    persistTradesFn,
    config = this.getDefaultConfig(),
    isLive = false
  ) {
    super(stockName, timeFrame, persistTradesFn, config, isLive);
    this.config = config;
  }

  static getDefaultConfig() {
    return {
      buyWindow: 60,
      sellWindow: 20,
      capital: 100,
      riskPercentage: 0.1,
    };
  }

  isHighBroken(today, highestDay) {
    return today.high > highestDay;
  }

  async squareOff() {
    const today = this.stock.now();
    const stopLoss = today.indicators.twoDayLow;

    const isPositionClosed = await trade
      .openPositions()
      .then((res) => res?.size === 0);

    if (today.low <= stopLoss && isPositionClosed) {
      console.log("-------- Square off signal detected ---------");
      this.lastPlacedOrder = null;
      return;
    }

    if (this.lastPlacedOrder.stopLoss === stopLoss) return;

    console.log("modifying stop loss", {
      oldStopLoss: this.lastPlacedOrder.stopLoss,
      newStopLoss: stopLoss,
    });
    trade.modifyPosition(stopLoss).then((res) => {
      if (!res) return;
      console.log("modified stop loss, retMsg", res.retMsg, res.result.orderId);
      this.lastPlacedOrder.stopLoss = stopLoss;
    });
  }

  sell() {}

  async isLastOrderFilled() {
    console.log(
      "checking if last order is filled",
      this.lastPlacedOrder?.orderId
    );
    if (!this.lastPlacedOrder) return;
    if (this.lastPlacedOrder.status === "Filled") return true;

    return trade.activeOrders().then((res) => {
      const tradeInfo = res.find(
        (tradeInfo) => tradeInfo.orderId === this.lastPlacedOrder.orderId
      );
      console.log(
        "fetched active orders data",
        tradeInfo?.orderId,
        tradeInfo?.orderStatus
      );
      if (!tradeInfo?.orderId) {
        console.log("----------- Position opened -----------");
        this.lastPlacedOrder.status = "Filled";
        return true;
      }
    });
  }

  async buy() {
    if (await this.isLastOrderFilled()) return;

    const today = this.stock.now();
    const triggerPrice = today.indicators.nineDayHigh;
    const stopLoss = today.indicators.twoDayLow;
    const riskForOneStock = triggerPrice - stopLoss;

    const stockCanBeBought = this.stocksCanBeBought(
      riskForOneStock,
      triggerPrice
    );

    console.log("checking if need to cancel existing order");
    if (slOrTpChanged(this.lastPlacedOrder, triggerPrice, stopLoss)) {
      console.log("canceling order", this.lastPlacedOrder.orderId);
      await trade.cancelOrder(this.lastPlacedOrder.orderId).then((res) => {
        console.log("order canceled, retMsg: ", res.retMsg);
        if (!res) return;
        this.lastPlacedOrder = null;
      });
    }

    if (this.lastPlacedOrder) return;

    console.log("placing order", { stockCanBeBought, triggerPrice, stopLoss });
    await trade
      .placeOrder(stockCanBeBought, triggerPrice, stopLoss, "Buy")
      .then((res) => {
        if (!res || res.retMsg !== "OK") return;

        console.log("order placed", res.retMsg, res.result.orderId);
        this.lastPlacedOrder = {
          stockCanBeBought,
          triggerPrice,
          stopLoss,
          status: "Pending",
          orderId: res.result.orderId,
        };
      });
  }
}

export default FortyTwentyStrategy;
