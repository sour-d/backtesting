import { ExistingQuoteStorage } from "../quote/ExistingQuoteStorage";
import { Quote } from "../quote/IQuote";
import { LiveQuoteStorage } from "../quote/LiveQuoteStorage";
import { Strategy } from "./Strategy";
import { getProps } from "../utils";

interface Config {
  buyWindow: number;
  sellWindow: number;
  capital: number;
  riskPercentage: number;
}
const fortyTwentyStrategyConfig: Config = {
  buyWindow: 40,
  sellWindow: 20,
  capital: 100000,
  riskPercentage: 5,
};

class FortyTwentyStrategy extends Strategy {
  config: Config;

  constructor(
    stock: ExistingQuoteStorage | LiveQuoteStorage,
    persistTradesFn: Function,
    config: Config = fortyTwentyStrategyConfig
  ) {
    super(stock, persistTradesFn, config.capital, config.riskPercentage);
    this.config = config;
  }

  private isHighBroken(today: Quote, highestDay: Quote): boolean {
    return today.High > highestDay.High;
  }

  protected override sell(): void {
    const today = this.stock.now();
    const { Low: stopLoss } = this.stock.lowOfLast(this.config.sellWindow);
    if (today.Low <= stopLoss) {
      this.exitPosition(stopLoss);
    }
  }

  protected override buy(): void {
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

export default {
  _class: FortyTwentyStrategy,
  _config: getProps(fortyTwentyStrategyConfig),
};
