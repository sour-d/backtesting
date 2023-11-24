import { ExistingQuoteManager, LiveQuoteManager } from "../QuoteManager";
import { Strategy } from "../Strategy";
import { TechnicalQuote } from "../restructureData";
import { getProps } from "../utils";

interface Config {
  capital: number;
  riskPercentage: number;
}
const twoBreakingCandleConfig: Config = {
  capital: 100000,
  riskPercentage: 5,
};

class TwoBreakingCandleNew extends Strategy {
  config: Config;

  constructor(
    stock: ExistingQuoteManager | LiveQuoteManager,
    persistTradesFn: Function,
    config: Config = twoBreakingCandleConfig
  ) {
    super(stock, persistTradesFn, config.capital, config.riskPercentage, true);
    this.config = config;
  }

  private isGreenCandle(quote: TechnicalQuote): boolean {
    return quote["CandleBody"] > 0;
  }

  override sell(): void {
    const { Low: stopLoss } = this.stock.lowOfLast(3);
    const today = this.stock.now();
    if (today.Low <= stopLoss) {
      this.exitPosition(stopLoss);
    }
  }

  override buy(): void {
    const secondPrev = this.stock.prev(2);
    const prev = this.stock.prev();

    if (this.isGreenCandle(secondPrev) && this.isGreenCandle(prev)) {
      const { Open: buyingPrice } = this.stock.now();
      const { Low: initialStopLoss } = this.stock.lowOfLast(3);
      const riskForOneStock = buyingPrice - initialStopLoss;

      if (riskForOneStock > 0) {
        this.takePosition(riskForOneStock, buyingPrice);
        this.sell(); // should sell if price goes down today only.
      }
    }
  }
}

export default {
  _class: TwoBreakingCandleNew,
  _config: getProps(twoBreakingCandleConfig),
};
