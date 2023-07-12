import { TechnicalQuote } from "./restructureData";

export interface ITradeOutcome {
  buyingDay: TechnicalQuote;
  initialStopLoss: number;
  riskForOneStock: number;
  totalStocks: number;
  sellingDay: TechnicalQuote;
  oneStockProfitOrLoss: number;
  totalProfitOrLoss: number;
  riskMultiple: number;
  returnPercentage: number;
}
