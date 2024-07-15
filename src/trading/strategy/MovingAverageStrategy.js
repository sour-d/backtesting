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

  buy() {
    const { takeProfitPercentage } = this.config;
    const today = this.stock.now();
    const yesterday = this.stock.prev();
    const towDaysBeforeYesterday = this.stock.prev(2);

    if (
      today.close > today.ma60close &&
      today.close > today.ma20high &&
      yesterday.close > yesterday.ma20high &&
      towDaysBeforeYesterday.close > towDaysBeforeYesterday.ma20high
    ) {
      const { close: buyingPrice } = today;
      const { low: initialStopLoss } = yesterday;
      if (initialStopLoss >= buyingPrice) return;

      logger(this.stockName, "buy", { buyingPrice, initialStopLoss });
      const riskForOneStock = buyingPrice - initialStopLoss;
      const tpPrice = buyingPrice + buyingPrice * takeProfitPercentage;
      this.placeTpMarketOrder(riskForOneStock, buyingPrice, tpPrice, "Buy");
      return true;
    }
  }

  sell() {
    const { takeProfitPercentage } = this.config;
    const today = this.stock.now();
    const yesterday = this.stock.prev();
    const dayBeforeYesterday = this.stock.prev(2);
    if (
      today.close < today.ma60close &&
      today.close < today.ma20low &&
      yesterday.close < yesterday.ma20low &&
      dayBeforeYesterday.close < dayBeforeYesterday.ma20low
    ) {
      const { open: sellingPrice } = this.stock.now();
      const { high: initialStopLoss } = dayBeforeYesterday;
      if (initialStopLoss <= sellingPrice) return;

      logger(this.stockName, "sell", { sellingPrice, initialStopLoss });
      const riskForOneStock = initialStopLoss - sellingPrice;
      const tpPrice = sellingPrice - sellingPrice * takeProfitPercentage;
      this.placeTpMarketOrder(riskForOneStock, sellingPrice, tpPrice, "Sell");
      return true;
    }
  }

  shortSquareOff() {
    if (!this.currentPosition) return;
    const today = this.stock.now();

    const holdingDays = dayjs(today.dateUnix).diff(
      dayjs(this.currentPosition.transactionDate.dateUnix),
      "day"
    );
    if (holdingDays > 5) {
      return this.forceExit("Buy");
    }
  }

  longSquareOff() {
    if (!this.currentPosition) return;
    const today = this.stock.now();

    const holdingDays = dayjs(today.dateUnix).diff(
      dayjs(this.currentPosition.transactionDate.dateUnix),
      "day"
    );
    if (holdingDays > 5) {
      return this.forceExit("Sell");
    }
  }
}

export default MovingAverageStrategy;
