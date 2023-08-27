import { StockFeedSimulator } from "../StockFeedSimulator";
import { Strategy } from "../Strategy";
import { Trades } from "../Trades";
import { TechnicalQuote } from "../restructureData";
import { getProps } from "../utils";

interface Config {
  capital: number;
  riskPercentage: number;
}
const twoBreakingCandleConfig: Config = {
  capital: 100000,
  riskPercentage: 0.5,
};

class TwoBreakingCandle extends Strategy {
  config: Config;

  constructor(
    stock: StockFeedSimulator,
    persistTradesFn: Function,
    config: Config = twoBreakingCandleConfig
  ) {
    super(stock, persistTradesFn, config.capital, config.riskPercentage);
    this.config = config;
  }

  protected override checkForStopLossHit(): {
    sellingDay: TechnicalQuote | null;
    sellingPrice: number | null;
  } {
    let yesterday = this.stock.now();
    while (this.stock.move()) {
      const today = this.stock.now();
      if (today.Low <= yesterday.Low) {
        return { sellingDay: today, sellingPrice: today.Low };
      }
    }
    return { sellingDay: null, sellingPrice: null };
  }

  protected override trade(): void {
    const breakingDay = this.stock.now();
    this.stock.move();
    const buyingDay = this.stock.now();
    const initialStopLoss = breakingDay.Low;
    const riskForOneStock = buyingDay.High - initialStopLoss;

    if (riskForOneStock <= 0) {
      return;
    }

    const { sellingDay, sellingPrice } = this.checkForStopLossHit();
    if (!(sellingDay && sellingPrice)) {
      return;
    }
    const totalStocks = this.getTotalStocks(riskForOneStock, buyingDay.High);

    // store result
    this.updateTrades(buyingDay, 0, sellingDay, sellingPrice, totalStocks);
  }

  private isGreenCandle(quote: TechnicalQuote): boolean {
    return quote["CandleBody"] > 0;
  }

  public override execute(): Trades {
    let yesterday = this.stock.now();
    while (this.stock.move()) {
      const today = this.stock.now();

      if (this.isGreenCandle(yesterday) && this.isGreenCandle(today))
        this.trade();
      yesterday = today;
    }
    this.persistTradesFn(this.trades);
    return this.trades;
  }
}

export default {
  _class: TwoBreakingCandle,
  _config: getProps(twoBreakingCandleConfig),
};
