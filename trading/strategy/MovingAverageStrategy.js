import { Strategy } from "./Strategy.js";

class MovingAverageStrategy extends Strategy {
  config;

  constructor(stockName, persistTradesFn, config = this.getDefaultConfig()) {
    super(stockName, persistTradesFn, config);
    this.config = config;
  }

  static getDefaultConfig() {
    return {
      upperLimit: 20,
      lowerLimit: 10,
      stopLossWindow: 10,
      capital: 100000,
      riskPercentage: 5,
    };
  }

  buy() {
    const yesterday = this.stock.prev();
    const { upperLimit, lowerLimit } = this.config;

    const upperLimitMA = this.stock.simpleMovingAverage(upperLimit);
    const lowerLimitMA = this.stock.simpleMovingAverage(lowerLimit);
    if (lowerLimitMA >= upperLimitMA && yesterday.Close > lowerLimitMA) {
      const { Open: buyingPrice } = this.stock.now();
      const { Low: initialStopLoss } = this.stock.lowOfLast(
        this.config.stopLossWindow
      );
      const riskForOneStock = buyingPrice - initialStopLoss;
      if (initialStopLoss >= buyingPrice) return;

      this.takePosition(riskForOneStock, buyingPrice);
    }
  }

  sell() {}

  squareOff() {
    const { lowerLimit } = this.config;
    const today = this.stock.now();
    const lowerMA = this.stock.simpleMovingAverage(lowerLimit);
    if (lowerMA >= today.Low) {
      this.exitPosition(lowerMA);
    }
  }
}

export default MovingAverageStrategy;
