import { TechnicalQuote } from "./restructureData";

export interface ITradeOutcome {
  buyingDay: TechnicalQuote;
  totalStocks: number;
  sellingDay: TechnicalQuote;
  oneStockProfitOrLoss: number;
  totalProfitOrLoss: number;
  riskMultiple: number;
  returnPercentage: number;
  sellingPrice: number;
}
