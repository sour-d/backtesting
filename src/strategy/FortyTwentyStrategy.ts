import { Quote, StockFeedSimulator } from "../StockFeedSimulator";
import { Strategy } from "../Strategy";
import { Trades } from "../Trades";
import { TechnicalQuote } from "../restructureData";
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
  riskPercentage: 0.5,
};

class FortyTwentyStrategy extends Strategy {
  config: Config;

  constructor(
    stock: StockFeedSimulator,
    persistTradesFn: Function,
    config: Config = fortyTwentyStrategyConfig
  ) {
    super(stock, persistTradesFn, config.capital, config.riskPercentage);
    this.config = config;
    console.log(this.config);
  }

  protected override checkForStopLossHit(): {
    sellingDay: TechnicalQuote | null;
    sellingPrice: number | null;
  } {
    while (this.stock.move()) {
      const today = this.stock.now();
      const { Low: stopLoss } = this.stock.lowOfLast(this.config.sellWindow);
      if (today.Low <= stopLoss) {
        return { sellingDay: today, sellingPrice: stopLoss };
      }
    }
    return { sellingDay: null, sellingPrice: null };
  }

  private isHighBroken(today: Quote, highestDay: Quote): boolean {
    return today.High > highestDay.High;
  }

  protected override trade(): void {
    const buyingDay = this.stock.now();
    const { Low: initialStopLoss } = this.stock.lowOfLast(
      this.config.sellWindow
    );
    const { sellingDay, sellingPrice } = this.checkForStopLossHit();
    if (!(sellingDay && sellingPrice)) {
      return;
    }

    const riskForOneStock = buyingDay.High - initialStopLoss;
    const totalStocks = this.getTotalStocks(riskForOneStock, buyingDay.High);

    // store result
    this.updateTrades(buyingDay, sellingDay, sellingPrice, totalStocks);
  }

  public override execute(): Trades {
    while (this.stock.move()) {
      const today = this.stock.now();
      const lastFortyDayHigh = this.stock.highOfLast(this.config.buyWindow);

      if (this.isHighBroken(today, lastFortyDayHigh)) this.trade();
    }
    this.persistTradesFn(this.trades.toCSV());
    return this.trades;
  }
}

export default {
  _class: FortyTwentyStrategy,
  _config: getProps(fortyTwentyStrategyConfig),
};
