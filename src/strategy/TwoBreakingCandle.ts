import { StockFeedSimulator } from "../StockFeedSimulator";
import { _Strategy } from "../Strategy";
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

class TwoBreakingCandleNew extends _Strategy {
  config: Config;

  constructor(
    stock: StockFeedSimulator,
    persistTradesFn: Function,
    config: Config = twoBreakingCandleConfig
  ) {
    super(stock, persistTradesFn, config.capital, config.riskPercentage);
    this.config = config;
  }

  private isGreenCandle(quote: TechnicalQuote): boolean {
    return quote["CandleBody"] > 0;
  }

  override sell(): void {
    let yesterday = this.stock.prev();
    const today = this.stock.now();
    if (today.Low <= yesterday.Low) {
      this.exitPosition(yesterday.Low);
    }
  }

  override buy(): void {
    const secondPrev = this.stock.prev(2);
    const prev = this.stock.prev();

    if (this.isGreenCandle(secondPrev) && this.isGreenCandle(prev)) {
      const { Open: buyingPrice } = this.stock.now();
      const { Low: initialStopLoss } = prev;
      const riskForOneStock = buyingPrice - initialStopLoss;
      const totalStocks = this.stocksCanBeBought(riskForOneStock, buyingPrice);
      const riskTaken = totalStocks * riskForOneStock;

      if (riskForOneStock <= 0 || totalStocks <= 0) {
        return;
      }
      this.takePosition(riskForOneStock, buyingPrice);
    }
  }
}

export default {
  _class: TwoBreakingCandleNew,
  _config: getProps(twoBreakingCandleConfig),
};
