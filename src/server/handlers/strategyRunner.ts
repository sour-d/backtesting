import fs from "fs";
import { transformStockData } from "../../trading/parser/restructureData";
import { Trades } from "../../trading/outcome/Trades";
import FortyTwentyStrategy from "../../trading/strategy/FortyTwentyStrategy";
import MovingAverageStrategy from "../../trading/strategy/MovingAverageStrategy";
import TwoBreakingCandle from "../../trading/strategy/TwoBreakingCandle";
import PriceActionStrategy from "../../trading/strategy/PriceActionStrategy";
import { ExistingQuoteStorage } from "../../trading/quote/ExistingQuoteStorage";

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
  const stock = new ExistingQuoteStorage(stockData, startingDay, stockName);
  const strategyClass = STRATEGIES[config.strategy]._class;

  const strategy = new strategyClass(
    stock,
    persistBacktestResult(stockName),
    config
  );

  strategy.execute();
};

export default backtest;
