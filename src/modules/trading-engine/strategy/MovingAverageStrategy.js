import { Strategy } from "./Strategy.js";

/**
 * MovingAverageStrategy implements a trading strategy based on moving averages
 */
class MovingAverageStrategy extends Strategy {
  config;

  constructor(
    stockName,
    timeFrame,
    config = this.getDefaultConfig(),
    state
  ) {
    super(
      stockName,
      timeFrame,
      config,
      state
    );
    this.config = config;
    this.strategyName = "MovingAverageStrategy";
  }

  static getDefaultConfig() {
    return {
      capital: 100,
      riskPercentage: 5,
      limitPriceGap: 0.0003,
      precise: 0
    };
  }

  async buy() {
    const today = this.stock.now();
    const yesterday = this.stock.prev();
    this.logger.info("Buy Condition check", { today, yesterday });
    if (!today || !yesterday) return;

    if (
      today.close > today.ma20high &&
      today.body > 0 &&
      yesterday.body > 0 &&
      today.superTrendDirection === "Buy"
    ) {
      let buyingPrice = today.close;
      buyingPrice = buyingPrice - parseFloat(this.config.limitPriceGap) * buyingPrice;
      const initialStopLoss = buyingPrice * 0.96;
      if (initialStopLoss >= buyingPrice) return;

      this.logger.info("Buy condition matched", {
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

    if (!today || !yesterday) return;
    const ma20high_yesterday = yesterday.ma20high;
    this.logger.info("Long Square off check", { today, ma20high_yesterday });
    if (ma20high_yesterday > today.low && today.body < 0) {
      await this.updateStopLoss(ma20high_yesterday);
    }
  }

  async sell() {
    const today = this.stock.now();
    const yesterday = this.stock.prev();

    this.logger.info("Sell Condition Check", { today, yesterday });
    if (!today || !yesterday) return;

    if (
      today.close < today.ma20low &&
      today.body < 0 &&
      yesterday.body < 0 &&
      today.superTrendDirection === "Sell"
    ) {
      let sellingPrice = today.close;
      sellingPrice = sellingPrice + parseFloat(this.config.limitPriceGap) * sellingPrice;
      const initialStopLoss = sellingPrice * 1.04;
      const riskForOneStock = initialStopLoss - sellingPrice;
      if (initialStopLoss <= sellingPrice) return;

      this.logger.info("Sell condition matched", {
        sellingPrice,
        initialStopLoss,
      });
      await this.placeOrder(riskForOneStock, sellingPrice, 0, "Sell", true);
      return true;
    }
  }

  async shortSquareOff() {
    const today = this.stock.now();
    const yesterday = this.stock.prev();

    if (!today || !yesterday) return;
    const ma20low_yesterday = yesterday.ma20low;
    this.logger.info("Short Square off check", { today, ma20low_yesterday });
    if (today.high > ma20low_yesterday && today.body > 0) {
      await this.updateStopLoss(ma20low_yesterday);
    }
  }
}

export default MovingAverageStrategy;
