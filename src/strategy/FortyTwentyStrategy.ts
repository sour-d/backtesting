import { Quote, StockFeedSimulator } from "../StockFeedSimulator";
import { Strategy } from "../Strategy";
import { Trades } from "../Trades";
import { TechnicalQuote } from "../restructureData";


interface Config {
  buyWindow: number;
  sellWindow: number;
  stopLossWindow: number;
  capital: number;
  riskPercentage: number;
}
export const fortyTwentyStrategyConfig: Config = {
  buyWindow: 40,
  sellWindow: 20,
  stopLossWindow: 20,
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
    super(stock, config.capital, config.riskPercentage, persistTradesFn);
    this.config = config;
  }

  protected override checkForStopLossHit(): TechnicalQuote {
    while (this.stock.move()) {
      const today = this.stock.now();
      const lastTwentyDayLow = this.stock.lowOfLast(this.config.stopLossWindow);
      if (today.Low <= lastTwentyDayLow.Low) {
        return today;
      }
    }
    return this.stock.now();
  }

  private isHighBroken(today: Quote, highestDay: Quote): boolean {
    return today.High > highestDay.High;
  }

  protected override trade(): void {
    const buyingDay = this.stock.now();
    const { Low: initialStopLoss } = this.stock.lowOfLast(
      this.config.sellWindow
    );
    const sellingDay = this.checkForStopLossHit();

    const riskForOneStock = buyingDay.High - initialStopLoss;
    const totalStocks = this.getTotalStocks(riskForOneStock, buyingDay.High);

    // store result
    this.updateTrades(buyingDay, sellingDay, initialStopLoss, totalStocks);
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

export { FortyTwentyStrategy };
