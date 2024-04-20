import { TechnicalQuote } from "../parser/restructureData";

export interface ITradeOutcome {
  buyingDay: TechnicalQuote;
  buyingPrice: number;
  totalStocks: number;
  sellingDay: TechnicalQuote;
  oneStockProfitOrLoss: number;
  totalProfitOrLoss: number;
  risk: number;
  riskMultiple: number;
  sellingPrice: number;
}
