import Papa from "papaparse";
import { ITradeOutcome } from "./ITradeOutcome";
import dayjs from "dayjs";
import { TechnicalQuote } from "./restructureData";

export class Trades {
  private capital: number;
  private risk: number;
  private stock: string;
  private tradeResults: ITradeOutcome[];
  private flushedTill: number;

  constructor(capital: number, risk: number, stock: string) {
    this.tradeResults = [];
    this.capital = capital;
    this.risk = risk;
    this.stock = stock;
    this.flushedTill = 0;
  }

  public totalTrades(): number {
    return this.tradeResults.length;
  }

  private totalExpectancy(): number {
    return this.tradeResults.reduce(
      (totalRiskMultiple, { riskMultiple }) => totalRiskMultiple + riskMultiple,
      0
    );
  }

  public averageExpectancy(): number {
    return this.totalExpectancy() / this.totalTrades();
  }

  public addTradeResult(
    buyingDay: TechnicalQuote,
    buyingPrice: number,
    sellingDay: TechnicalQuote,
    sellingPrice: number,
    totalStocks: number,
    risk: number
  ): void {
    const oneStockProfitOrLoss: number = sellingPrice - buyingPrice;
    const totalProfitOrLoss: number = oneStockProfitOrLoss * totalStocks;
    const riskMultiple: number = totalProfitOrLoss
      ? totalProfitOrLoss / risk
      : 0;

    const outcome: ITradeOutcome = {
      buyingDay,
      buyingPrice,
      sellingDay,
      sellingPrice,
      totalStocks,
      risk,
      riskMultiple,
      oneStockProfitOrLoss,
      totalProfitOrLoss,
    };

    this.tradeResults.push(outcome);
  }

  public getReport() {
    return {
      stock: this.stock,
      capital: this.capital,
      riskTaken: this.risk + "%",
      averageExpectancy: this.averageExpectancy(),
      totalTrades: this.totalTrades(),
    };
  }

  public toCSV(): string {
    const tradesCSV = this.tradeResults.map((trade) => ({
      "Buying Date": dayjs(trade.buyingDay.Date).format("YYYY-MM-DD"),
      "Buying Price": trade.buyingPrice,
      "Selling Date": dayjs(trade.sellingDay.Date).format("YYYY-MM-DD"),
      "Selling Price": trade.sellingPrice,
      "Total Stocks": trade.totalStocks,
      Risk: trade.risk,
    }));

    return Papa.unparse(tradesCSV);
  }

  public flush(): string {
    this.flushedTill = this.tradeResults.length;
    const trades = this.tradeResults.slice(this.flushedTill);

    const tradesCSV = this.tradeResults.map((trade) => ({
      "Buying Date": dayjs(trade.buyingDay.Date).format("YYYY-MM-DD"),
      "Buying Price": trade.buyingPrice,
      "Selling Date": dayjs(trade.sellingDay.Date).format("YYYY-MM-DD"),
      "Selling Price": trade.sellingPrice,
      "Total Stocks": trade.totalStocks,
      Risk: trade.risk,
    }));

    return Papa.unparse(tradesCSV, { header: false });
  }
}
