import { Quote } from "./StockFeedSimulator";

export interface ITradeOutcome {
  buyingDay: Quote;
  initialStopLoss: number;
  riskForOneStock: number;
  totalStocks: number;
  sellingDay: Quote;
  oneStockProfitOrLoss: number;
  totalProfitOrLoss: number;
  riskMultiple: number;
  returnPercentage: number;
}
