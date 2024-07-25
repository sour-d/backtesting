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

    this.logger("buy condition", { today, yesterday });

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
    const yesterday = this.stock.prev();

    if (
      today.ma20high > today.close &&
      today.ma20high > today.open &&
      today.body < 0
    ) {
      await this.forceExit("Sell");
      return this.sell();
    }

    if (
      yesterday.ma20high > yesterday.close &&
      today.ma20high > today.close &&
      today.body < 0
    ) {
      await this.forceExit("Sell");
      return this.sell();
    }

    if (today.superTrendDirection === "Sell") {
      await this.forceExit("Sell");
      return this.sell();
    }
  }

  async sell() {
    const today = this.stock.now();
    const yesterday = this.stock.prev();

    this.logger("sell condition", { today, yesterday });

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
    const yesterday = this.stock.prev();

    if (
      today.close > today.ma20low &&
      today.open > today.ma20low &&
      today.body > 0
    ) {
      await this.forceExit("Buy");
      return this.buy();
    }

    if (
      yesterday.close > yesterday.ma20low &&
      today.close > today.ma20low &&
      today.body > 0
    ) {
      await this.forceExit("Buy");
      return this.buy();
    }

    if (today.superTrendDirection === "Buy") {
      await this.forceExit("Buy");
      return this.buy();
    }
  }
}

export default MovingAverageStrategy;
