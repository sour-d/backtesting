import fs from "fs";
import { transformStockData } from "./restructureData";
import { ExistingQuoteManager, LiveQuoteManager } from "./QuoteManager";
import { Trades } from "./Trades";
import FortyTwentyStrategy from "./strategy/FortyTwentyStrategy";
import MovingAverageStrategy from "./strategy/MovingAverageStrategy";
import TwoBreakingCandle from "./strategy/TwoBreakingCandle";
import PriceActionStrategy from "./strategy/PriceActionStrategy";
import LiveQuote from "./LiveQuote";

export const STRATEGIES: any = {
  FortyTwentyStrategy,
  MovingAverageStrategy,
  TwoBreakingCandle,
  PriceActionStrategy,
};

const persistBacktestResult = (stockName: string) => (outcomes: Trades) => {
  fs.writeFileSync(
    `result/backtest.json`,
    JSON.stringify({ report: outcomes.getReport(), trades: outcomes.toCSV() }),
    "utf-8"
  );
  fs.writeFileSync(`result/backtest.csv`, outcomes.toCSV(), "utf-8");
};

const backtest = (stockName: string, config: any) => {
  const stockData = transformStockData(stockName);

  const startingDay = 40;
  const stock = new ExistingQuoteManager(stockData, startingDay, stockName);
  const strategyClass = STRATEGIES[config.strategy]._class;

  const strategy = new strategyClass(
    stock,
    persistBacktestResult(stockName),
    config
  );

  strategy.execute();
};

export default backtest;
