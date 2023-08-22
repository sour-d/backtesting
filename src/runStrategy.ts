import fs from "fs";
import { transformStockData } from "./restructureData";
import { StockFeedSimulator } from "./StockFeedSimulator";
import { Trades } from "./Trades";
import { FortyTwentyStrategy } from "./strategy/FortyTwentyStrategy";
import { MovingAverageStrategy } from "./strategy/MovingAverageStrategy";
import { TwoBreakingCandle } from "./strategy/TwoBreakingCandle";
import { Strategy } from "./Strategy";

const STRATEGIES: any = {
  FortyTwentyStrategy,
  MovingAverageStrategy,
  TwoBreakingCandle,
};

const persistTrades = (stockName: string) => (data: string) => {
  fs.writeFileSync(`result/${stockName}.csv`, data, "utf-8");
};

const runStrategy = (stockName: string, strategyName: string) => {
  const stockData = transformStockData(stockName);

  const startingDay = 40;
  const stock = new StockFeedSimulator(stockData, startingDay);
  const capital = 100000;
  const riskFactor = 0.05;

  const strategy = new STRATEGIES[strategyName](
    stock,
    persistTrades(stockName)
  );
  const outcomes: Trades = strategy.execute();
  return {
    averageExpectancy: outcomes.averageExpectancy(),
    averageReturn: outcomes.averageReturn(),
  };
};

export default runStrategy;
