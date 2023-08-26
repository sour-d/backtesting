import { TechnicalQuote } from "./restructureData";

export interface ITradeOutcome {
  buyingDay: TechnicalQuote;
  buyingPrice: number;
  totalStocks: number;
  sellingDay: TechnicalQuote;
  oneStockProfitOrLoss: number;
  totalProfitOrLoss: number;
  riskMultiple: number;
  sellingPrice: number;
}
