import { Strategy } from "./Strategy.js";

class FortyTwentyStrategy extends Strategy {
  config;

  constructor(
    stockName,
    timeFrame,
    persistTradesFn,
    config = this.getDefaultConfig(),
    isLive = false
  ) {
    super(stockName, timeFrame, persistTradesFn, config, isLive);
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
    return today.high > highestDay;
  }

  squareOff() {
    const today = this.stock.now();
    const stopLoss = today.indicators.twoDayLow;
    console.log("checking if need to square off");
    if (today.low <= stopLoss) {
      console.log("-------- Square off signal detected ---------");
      this.exitPosition(stopLoss);
    }
  }

  sell() {}

  buy() {
    const today = this.stock.now();
    const windowHigh = today.indicators.nineDayHigh;

    console.log("checking if need to buy");
    if (this.isHighBroken(today, windowHigh)) {
      console.log("-------- Buy signal detected ---------");
      const buyPrice = today.indicators.nineDayHigh;
      const initialStopLoss = today.indicators.twoDayLow;
      const riskForOneStock = buyPrice - initialStopLoss;

      this.takePosition(riskForOneStock, buyPrice);
    }
  }
}

export default FortyTwentyStrategy;
