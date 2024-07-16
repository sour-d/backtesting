import dayjs from "dayjs";
import { Strategy } from "./Strategy.js";
import logger from "../../server/logger.js";

class MovingAverageStrategy extends Strategy {
  config;

  constructor(
    stockName,
    timeFrame,
    persistTradesFn,
    config = this.getDefaultConfig()
  ) {
    super(stockName, timeFrame, persistTradesFn, config);
    this.config = config;
  }

  static getDefaultConfig() {
    return {
      capital: 100,
      riskPercentage: 5,
      takeProfitPercentage: 0.005,
    };
  }

  async buy() {
    const { takeProfitPercentage } = this.config;
    const today = this.stock.now();
    const yesterday = this.stock.prev();

    if (
      today.close > today.ma60close &&
      today.close > today.ma20high &&
      today.body > 0 &&
      yesterday.body > 0
    ) {
      const { close: buyingPrice } = today;
      const { ma20low: initialStopLoss } = today;
      if (initialStopLoss >= buyingPrice) return;

      logger(this.stockName, "------ Buy condition matched -------", {
        buyingPrice,
        initialStopLoss,
      });
      const riskForOneStock = buyingPrice - initialStopLoss;
      const tpPrice = buyingPrice + buyingPrice * takeProfitPercentage;
      await this.placeTpMarketOrder(
        riskForOneStock,
        buyingPrice,
        tpPrice,
        "Buy"
      );
      return true;
    }
  }

  async sell() {
    const { takeProfitPercentage } = this.config;
    const today = this.stock.now();
    const yesterday = this.stock.prev();
    if (
      today.close < today.ma60close &&
      today.close < today.ma20low &&
      today.body < 0 &&
      yesterday.body < 0
    ) {
      const { open: sellingPrice } = this.stock.now();
      const { ma20high: initialStopLoss } = today;
      if (initialStopLoss <= sellingPrice) return;

      logger(this.stockName, "------ Sell condition matched -------", {
        sellingPrice,
        initialStopLoss,
      });
      const riskForOneStock = initialStopLoss - sellingPrice;
      const tpPrice = sellingPrice - sellingPrice * takeProfitPercentage;
      await this.placeTpMarketOrder(
        riskForOneStock,
        sellingPrice,
        tpPrice,
        "Sell"
      );
      return true;
    }
  }

  async shortSquareOff() {
    const today = this.stock.now();
    const { ma20high: newSL } = today;

    return await this.addTrailingStopLoss(newSL);
  }

  async longSquareOff() {
    const today = this.stock.now();

    const { ma20low: newSL } = today;
    return await this.addTrailingStopLoss(newSL);
  }
}

export default MovingAverageStrategy;
