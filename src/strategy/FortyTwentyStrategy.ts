import { Quote, StockFeedSimulator } from "../StockFeedSimulator";
import { Strategy } from "../Strategy";
import { ITradeOutcome } from "../ITradeOutcome";

class FortyTwentyStrategy extends Strategy {
  constructor(
    stock: StockFeedSimulator,
    capital: number,
    riskPercentage: number,
    persistTradesFn: Function
  ) {
    super(stock, capital, riskPercentage, persistTradesFn);
  }

  protected override checkForStopLossHit(): Quote {
    while (this.stock.move()) {
      const today = this.stock.now();
      const lastTwentyDayLow = this.stock.lowOfLast(20);
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
    const initialStopLoss = this.stock.lowOfLast(20).Low;
    const sellingDay = this.checkForStopLossHit();

    const riskForOneStock = buyingDay.High - initialStopLoss;
    const totalStocks = this.getTotalStocks(riskForOneStock, buyingDay.High);

    // store result
    this.updateTrades(buyingDay, sellingDay, initialStopLoss, totalStocks);
  }

  public override execute(): ITradeOutcome[] {
    const tradeOutcomes: ITradeOutcome[] = [];
    while (this.stock.move()) {
      const today = this.stock.now();
      const lastFortyDayHigh = this.stock.highOfLast(40);

      if (this.isHighBroken(today, lastFortyDayHigh)) this.trade();
    }
    this.persistTradesFn(JSON.stringify(this.trades));
    return tradeOutcomes;
  }
}

export { FortyTwentyStrategy };
