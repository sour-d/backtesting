import { Strategy } from "./Strategy.js";

class FortyTwentyStrategy extends Strategy {
  config;

  constructor(
    stockName,
    persistTradesFn,
    config = this.getDefaultConfig(),
    isLive = false
  ) {
    super(stockName, persistTradesFn, config, isLive);
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
    return today.High > highestDay.High;
  }

  squareOff() {
    const today = this.stock.now();
    const { Low: stopLoss } = this.stock.lowOfLast(this.config.sellWindow);
    if (today.Low <= stopLoss) {
      this.exitPosition(stopLoss);
    }
  }

  sell() {}

  buy() {
    const { buyWindow, sellWindow } = this.config;
    const today = this.stock.now();
    const lastFortyDayHigh = this.stock.highOfLast(buyWindow);

    if (this.isHighBroken(today, lastFortyDayHigh)) {
      const { High: buyPrice } = this.stock.highOfLast(buyWindow);
      const { Low: initialStopLoss } = this.stock.lowOfLast(sellWindow);
      const riskForOneStock = buyPrice - initialStopLoss;

      this.takePosition(riskForOneStock, buyPrice);
    }
  }
}

export default FortyTwentyStrategy;
