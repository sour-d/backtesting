import { Strategy } from "./Strategy.js";

class TwoBreakingCandleNew extends Strategy {
  config;

  constructor(stockName, persistTradesFn, config = this.getDefaultConfig()) {
    super(stockName, persistTradesFn, config);
    this.config = config;
  }

  static getDefaultConfig() {
    return {
      capital: 100000,
      riskPercentage: 5,
    };
  }

  isGreenCandle(quote) {
    return quote["CandleBody"] > 0;
  }

  squareOff() {
    const { Low: stopLoss } = this.stock.lowOfLast(3);
    const today = this.stock.now();
    if (today.Low <= stopLoss) {
      this.exitPosition(stopLoss, this.currentTradeInfo.position);
    }
  }

  sell() {
    return false;
  }

  buy() {
    const prev = this.stock.prev();
    const today = this.stock.now();

    if (this.isGreenCandle(prev) && this.isGreenCandle(today)) {
      const { Close: buyingPrice } = today;
      const { Low: initialStopLoss } = this.stock.lowOfLast(3);
      const riskForOneStock = buyingPrice - initialStopLoss;

      if (riskForOneStock > 0) {
        this.takePosition(riskForOneStock, buyingPrice, "buy");
        return true;
      }
    }
    return false;
  }
}

export default TwoBreakingCandleNew;
