import { ITradeOutcome } from "./ITradeOutcome";
import { Day } from "./StockFeedSimulator";

export class TradeOutcomes {
  private tradeResults: ITradeOutcome[] = [];

  public totalProfitLoss(): number {
    return this.tradeResults.reduce(
      (result, { totalProfitOrLoss }) => result + totalProfitOrLoss,
      0
    );
  }

  public averageExpectancy(): number {
    return this.totalProfitLoss() / this.tradeResults.length;
  }

  public averageReturn(): number {
    const totalReturn = this.tradeResults.reduce(
      (result, { returnPercentage }) => result + returnPercentage,
      0
    );

    return totalReturn / this.tradeResults.length;
  }

  public addTradeResult(
    buyingDay: Day,
    sellingDay: Day,
    initialStopLoss: Day,
    totalStocks: number,
    risk: number,
    capital: number
  ): void {
    const riskForOneStock: number = buyingDay.High - initialStopLoss.Low;
    const oneStockProfitOrLoss: number = sellingDay.Low - buyingDay.High;
    const totalProfitOrLoss: number = oneStockProfitOrLoss * totalStocks;
    const riskMultiple: number = totalProfitOrLoss / risk;
    const returnPercentage: number = this.returnPercentage(
      sellingDay,
      buyingDay,
      totalProfitOrLoss,
      capital
    );

    this.tradeResults.push({
      buyingDay,
      sellingDay,
      initialStopLoss,
      totalStocks,
      returnPercentage,
      riskMultiple,
      riskForOneStock,
      oneStockProfitOrLoss,
      totalProfitOrLoss,
    });
  }

  private returnPercentage(
    sellingDay: Day,
    buyingDay: Day,
    totalProfitOrLoss: number,
    capital: number
  ) {
    const noOfMillis: number =
      sellingDay.Date.getTime() - buyingDay.Date.getTime();
    const noOfYrs: number = noOfMillis / (1000 * 60 * 60 * 24 * 365);
    const returnPercentage: number =
      (totalProfitOrLoss * 100) / (capital * noOfYrs);
    return returnPercentage;
  }
}
