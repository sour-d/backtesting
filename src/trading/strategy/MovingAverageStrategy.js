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
    super(stockName, timeFrame, persistTradesFn, config);
    this.config = config;
  }

  static getDefaultConfig() {
    return {
      capital: 100,
      riskPercentage: 1,
      takeProfitPercentage: 0.005,
    };
  }

  buy() {
    const { takeProfitPercentage } = this.config;
    const today = this.stock.now();
    const yesterday = this.stock.prev();

    if (
      today.close > today.ma20high &&
      yesterday.close > yesterday.ma20high &&
      today.close > today.ma60close
    ) {
      const { close: buyingPrice } = today;
      const { low: initialStopLoss } = yesterday;
      if (initialStopLoss >= buyingPrice) return;

      const riskForOneStock = buyingPrice - initialStopLoss;
      const tpPrice = buyingPrice + buyingPrice * takeProfitPercentage;
      this.placeTpMarketOrder(riskForOneStock, buyingPrice, tpPrice, "Buy");
    }
  }

  sell() {}

  squareOff() {
    if (!this.currentPosition) return;
    const today = this.stock.now();

    const holdingDays = dayjs(today.dateUnix).diff(
      dayjs(this.currentPosition.transactionDate.dateUnix),
      "day"
    );
    if (holdingDays > 10) {
      return this.forceExit("Sell");
    }
  }
}

export default MovingAverageStrategy;
