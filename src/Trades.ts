import { ITradeOutcome } from "./ITradeOutcome";
import { Quote } from "./StockFeedSimulator";

export class Trades {
  private tradeResults: ITradeOutcome[];

  constructor() {
    this.tradeResults = [];
  }

  public totalTrades(): number {
    return this.tradeResults.length;
  }

  private totalExpectancy(): number {
    return this.tradeResults.reduce(
      (result, { riskMultiple }) => result + riskMultiple,
      0
    );
  }

  public averageExpectancy(): number {
    return this.totalExpectancy() / this.totalTrades();
  }

  private totalReturnPercentage(): number {
    return this.tradeResults.reduce(
      (result, { returnPercentage }) => result + returnPercentage,
      0
    );
  }

  public averageReturn(): number {
    return this.totalReturnPercentage() / this.totalTrades();
  }

  private returnPercentage(
    sellingDay: Quote,
    buyingDay: Quote,
    totalProfitOrLoss: number,
    capital: number
  ) {
    const buyingDate = new Date(buyingDay.Date);
    const sellingDate = new Date(sellingDay.Date);
    const noOfMilliseconds = sellingDate.getTime() - buyingDate.getTime();
    const noOfYrs: number = noOfMilliseconds / (1000 * 60 * 60 * 24 * 365);
    const returnPercentage = (totalProfitOrLoss * 100) / (capital * noOfYrs);
    return returnPercentage;
  }

  public addTradeResult(
    buyingDay: Quote,
    sellingDay: Quote,
    initialStopLoss: number,
    totalStocks: number,
    risk: number,
    capital: number
  ): void {
    const riskForOneStock: number = buyingDay.High - initialStopLoss;
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

  public toCSV(): string {
    const headers = [
      "Buying Date",
      "Buying Price",
      "Selling Date",
      "Selling Price",
      "Total Stocks",
    ];
    const tradesCSV = this.tradeResults.map((trade) => {
      const row = [
        new Date(trade.buyingDay.Date).toLocaleDateString(),
        trade.buyingDay.High,
        new Date(trade.sellingDay.Date).toLocaleDateString(),
        trade.sellingDay.Low,
        trade.totalStocks,
      ];
      return row.join(",");
    });

    return headers.join(",") + "\n" + tradesCSV.join("\n");
  }
}
