import fs from "fs";
import { transformStockData } from "./restructureData";
import { StockFeedSimulator } from "./StockFeedSimulator";
import { Trades } from "./Trades";
import FortyTwentyStrategy from "./strategy/FortyTwentyStrategy";
import MovingAverageStrategy from "./strategy/MovingAverageStrategy";
import TwoBreakingCandle from "./strategy/TwoBreakingCandle";

export const STRATEGIES: any = {
  FortyTwentyStrategy,
  MovingAverageStrategy,
  TwoBreakingCandle,
};

const persistTrades = (stockName: string) => (outcomes: Trades) => {
  fs.writeFileSync(
    `result/result.json`,
    JSON.stringify({ report: outcomes.getReport(), trades: outcomes.toCSV() }),
    "utf-8"
  );
  fs.writeFileSync(`result/result.csv`, outcomes.toCSV(), "utf-8");
};

const strategyRunner = (stockName: string, config: any) => {
  const stockData = transformStockData(stockName);

  const startingDay = 40;
  const stock = new StockFeedSimulator(stockData, startingDay, stockName);
  const strategyClass = STRATEGIES[config.strategy]._class;

  const strategy = new strategyClass(stock, persistTrades(stockName), config);
  const outcomes: Trades = strategy.execute();

  return outcomes;
};

export default strategyRunner;
