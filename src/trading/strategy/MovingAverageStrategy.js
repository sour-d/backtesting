import dayjs from "dayjs";
import { Strategy } from "./Strategy.js";

class MovingAverageStrategy extends Strategy {
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
      // capital: 100,
      riskPercentage: 5,
      limitPriceGap: 0.0003,
    };
  }

  async buy() {
    const today = this.stock.now();
    const yesterday = this.stock.prev();

    if (
      today.close > today.ma20high &&
      today.body > 0 &&
      yesterday.body > 0 &&
      today.superTrendDirection === "Buy"
    ) {
      let { close: buyingPrice } = today;
      const { ma20low: initialStopLoss } = today;
      buyingPrice = buyingPrice - this.config.limitPriceGap * buyingPrice;
      if (initialStopLoss >= buyingPrice) return;

      this.logger("------ Buy condition matched -------", {
        buyingPrice,
        initialStopLoss,
      });
      const riskForOneStock = buyingPrice - initialStopLoss;
      await this.placeOrder(riskForOneStock, buyingPrice, 0, "Buy", true);
      return true;
    }
  }

  async longSquareOff() {
    const today = this.stock.now();

    if (today.superTrendDirection === "Sell") {
      this.forceExit("Sell", today.close);
      return this.sell();
    }

    const { ma20low: newSL } = today;
    await this.updateStopLoss(newSL);
  }

  async sell() {
    const today = this.stock.now();
    const yesterday = this.stock.prev();
    if (
      today.close < today.ma20low &&
      today.body < 0 &&
      yesterday.body < 0 &&
      today.superTrendDirection === "Sell"
    ) {
      let { close: sellingPrice } = this.stock.now();
      const { ma20high: initialStopLoss } = today;
      sellingPrice = sellingPrice + this.config.limitPriceGap * sellingPrice;
      if (initialStopLoss <= sellingPrice) return;

      this.logger("------ Sell condition matched -------", {
        sellingPrice,
        initialStopLoss,
      });
      const riskForOneStock = initialStopLoss - sellingPrice;
      await this.placeOrder(riskForOneStock, sellingPrice, 0, "Sell", true);
      return true;
    }
  }

  async shortSquareOff() {
    const today = this.stock.now();

    if (today.superTrendDirection === "Buy") {
      await this.forceExit("Buy", today.close);
      return this.buy();
    }

    const { ma20high: newSL } = today;
    await this.updateStopLoss(newSL);
  }
}

export default MovingAverageStrategy;
