import { ExistingQuoteStorage } from "../quote/ExistingQuoteStorage";
import { LiveQuoteStorage } from "../quote/LiveQuoteStorage";
import { Strategy } from "./Strategy";
import { getProps } from "../utils";

interface Config {
  upperLimit: number;
  lowerLimit: number;
  stopLossWindow: number;
  capital: number;
  riskPercentage: number;
}

const movingAverageStrategyConfig: Config = {
  upperLimit: 20,
  lowerLimit: 10,
  stopLossWindow: 10,
  capital: 100000,
  riskPercentage: 5,
};

class MovingAverageStrategy extends Strategy {
  config: Config;

  constructor(
    stock: ExistingQuoteStorage | LiveQuoteStorage,
    persistTradesFn: Function,
    config: Config = movingAverageStrategyConfig
  ) {
    super(stock, persistTradesFn, config.capital, config.riskPercentage);
    this.config = config;
  }

  protected override buy(): void {
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

  protected override sell(): void {
    const { lowerLimit } = this.config;
    const today = this.stock.now();
    const lowerMA = this.stock.simpleMovingAverage(lowerLimit);
    if (lowerMA >= today.Low) {
      this.exitPosition(lowerMA);
    }
  }
}

export default {
  _class: MovingAverageStrategy,
  _config: getProps(movingAverageStrategyConfig),
};
