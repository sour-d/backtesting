import dayjs from "dayjs";
import { Strategy } from "./Strategy.js";

class MovingAverageStrategyUpgraded extends Strategy {
  config;

  constructor(
    stockName,
    timeFrame,
    persistTradesFn,
    config = this.getDefaultConfig()
  ) {
    super(
      stockName,
      timeFrame,
      "MovingAverageStrategy",
      persistTradesFn,
      config
    );
    this.config = config;
  }

  static getDefaultConfig() {
    return {
      capital: 100,
      riskPercentage: 5,
      limitPriceGap: 0.0003,
      takeProfitFactor: 1.2,
    };
  }

  async buy() {
    const today = this.stock.now();
    const yesterday = this.stock.prev();

    this.logger("buy condition", { today, yesterday });

    if (
      yesterday.close < yesterday.ma20close &&
      today.close > today.ma20close &&
      today.body > 0
    ) {
      let { close: buyingPrice } = today;
      const initialStopLoss = Math.min(today.low, yesterday.low);
      buyingPrice = buyingPrice - this.config.limitPriceGap * buyingPrice;
      if (initialStopLoss >= buyingPrice) return;

      this.logger("------ Buy condition matched -------", {
        buyingPrice,
        initialStopLoss,
      });
      const riskForOneStock = buyingPrice - initialStopLoss;
      const target = buyingPrice + riskForOneStock * this.config.takeProfitFactor;
      await this.placeOrder(riskForOneStock, buyingPrice, target, "Buy", true);
      return true;
    }
  }

  async longSquareOff() {
    const today = this.stock.now();

    if (
      today.close < this.currentPosition.stopLoss
    ) {
      await this.forceExit("Sell");
      return this.sell();
    }
  }

  async sell() {
    const today = this.stock.now();
    const yesterday = this.stock.prev();

    this.logger("sell condition", { today, yesterday });

    if (
      yesterday.close > yesterday.ma20close &&
      today.close < today.ma20close &&
      today.body < 0
    ) {
      let { close: sellingPrice } = today;
      const initialStopLoss = Math.max(today.high, yesterday.high);
      sellingPrice = sellingPrice + this.config.limitPriceGap * sellingPrice;
      if (initialStopLoss <= sellingPrice) return;

      this.logger("------ Sell condition matched -------", {
        sellingPrice,
        initialStopLoss,
      });
      const riskForOneStock = initialStopLoss - sellingPrice;
      const target = sellingPrice - riskForOneStock * this.config.takeProfitFactor;
      await this.placeOrder(riskForOneStock, sellingPrice, target, "Sell", true);
      return true;
    }
  }

  async shortSquareOff() {
    const today = this.stock.now();

    if (
      today.close > this.currentPosition.stopLoss
    ) {
      await this.forceExit("Buy");
      return this.buy();
    }
  }
}

export default MovingAverageStrategyUpgraded;
