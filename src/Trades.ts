import Papa from "papaparse";
import { ITradeOutcome } from "./ITradeOutcome";
import { Quote } from "./StockFeedSimulator";
import dayjs, { Dayjs } from "dayjs";
import { TechnicalQuote } from "./restructureData";

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
    sellingDay: TechnicalQuote,
    buyingDay: TechnicalQuote,
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
    buyingDay: TechnicalQuote,
    sellingDay: TechnicalQuote,
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
    const tradesCSV = this.tradeResults.map((trade) => ({
      "Buying Date": dayjs(trade.buyingDay.Date).format("YYYY-MM-DD"),
      "Buying Price": trade.buyingDay.High,
      "Selling Date": dayjs(trade.sellingDay.Date).format("YYYY-MM-DD"),
      "Selling Price": trade.sellingDay.Low,
      "Total Stocks": trade.totalStocks,
    }));

    return Papa.unparse(tradesCSV);
  }
}
