import { StockSimulator } from "../Stock";
import { Strategy } from "../Strategy";
import { TradeData } from "../TradeData";
import { ITradeOutcome } from "../ITradeOutcome";

class FortyTwentyStrategy extends Strategy {
  trades: TradeData[] = [];

  constructor(
    stock: StockSimulator,
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

  protected override trade(): ITradeOutcome {
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
    const noOfMillis: number =
      sellingDay.Date.getTime() - buyingDay.Date.getTime();
    const noOfYrs: number = noOfMillis / (1000 * 60 * 60 * 24 * 365);
    const returnPercentage: number =
      (totalProfitOrLoss * 100) / (this.capital * noOfYrs);

    // store data
    this.updateTrades(
      buyingDay,
      initialStopLoss,
      riskForOneStock,
      totalStocks,
      sellingDay,
      oneStockProfitOrLoss,
      totalProfitOrLoss,
      riskMultiple,
      returnPercentage
    );
    return { riskMultiple, returnPercentage } as ITradeOutcome;
  }

  public override execute(): ITradeOutcome[] {
    const tradeOutcomes: ITradeOutcome[] = [];
    while (this.stock.hasData()) {
      const today: any = this.stock.nextDay();
      const lastFortyDayHigh: any = this.stock.highOfLast(40);

      if (this.isHighBroken(today, lastFortyDayHigh)) {
        tradeOutcomes.push(this.trade());
      }
    }
    this.persistTradesFn(JSON.stringify(this.trades));
    return tradeOutcomes;
  }
}

export { FortyTwentyStrategy };
