import { Day } from "./Stock";

export interface ITradeOutcome {
  buyingDay: Day;
  initialStopLoss: Day;
  riskForOneStock: number;
  totalStocks: number;
  sellingDay: Day;
  oneStockProfitOrLoss: number;
  totalProfitOrLoss: number;
  riskMultiple: number;
  returnPercentage: number;
}
