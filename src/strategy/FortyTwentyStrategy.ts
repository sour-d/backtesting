import { StockFeedSimulator } from "../StockFeedSimulator";
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

  protected override checkForStopLossHit(): any {
    while (this.stock.hasData()) {
      const today: any = this.stock.nextDay();
      const lastTwentyDayLow: any = this.stock.lowOfLast(20);
      if (today.Low <= lastTwentyDayLow.Low) {
        return today;
      }
    }
    return this.stock.today();
  }

  private isHighBroken(today: any, highestDay: any): boolean {
    return today.High > highestDay.High;
  }

  protected override trade(): void {
    const buyingDay: any = this.stock.today();
    const initialStopLoss: any = this.stock.lowOfLast(20);
    const riskForOneStock: number = buyingDay.High - initialStopLoss.Low;
    const totalStocks: number = this.getTotalStocks(
      riskForOneStock,
      buyingDay.High
    );

    const sellingDay: any = this.checkForStopLossHit();
    const oneStockProfitOrLoss: number = sellingDay.Low - buyingDay.High;
    const totalProfitOrLoss: number = oneStockProfitOrLoss * totalStocks;
    const riskMultiple: number = totalProfitOrLoss / this.getRisk();

    // store result
    this.updateTrades(buyingDay, sellingDay, initialStopLoss, totalStocks);
  }

  public override execute(): ITradeOutcome[] {
    const tradeOutcomes: ITradeOutcome[] = [];
    while (this.stock.hasData()) {
      const today: any = this.stock.nextDay();
      const lastFortyDayHigh: any = this.stock.highOfLast(40);

      if (this.isHighBroken(today, lastFortyDayHigh)) this.trade();
    }
    this.persistTradesFn(JSON.stringify(this.trades));
    return tradeOutcomes;
  }
}

export { FortyTwentyStrategy };
