import fs from "fs";
import { transformStockData } from "./restructureData";
import { ExistingQuoteManager, LiveQuoteManager } from "./QuoteManager";
import { Trades } from "./Trades";
import FortyTwentyStrategy from "./strategy/FortyTwentyStrategy";
import MovingAverageStrategy from "./strategy/MovingAverageStrategy";
import TwoBreakingCandle from "./strategy/TwoBreakingCandle";
import LiveQuote from "./LiveQuote";

export const STRATEGIES: any = {
  FortyTwentyStrategy,
  MovingAverageStrategy,
  TwoBreakingCandle,
};

const persistBacktestResult = (stockName: string) => (outcomes: Trades) => {
  fs.writeFileSync(
    `result/backtest.json`,
    JSON.stringify({ report: outcomes.getReport(), trades: outcomes.toCSV() }),
    "utf-8"
  );
  fs.writeFileSync(`result/backtest.csv`, outcomes.toCSV(), "utf-8");
};

const persistPaperTradeResult = (fileName: string) => (trade: any) => {
  if (!fs.existsSync(`result/${fileName}.json`)) {
    fs.writeFileSync(
      `result/${fileName}.csv`,
      "Buying Date,Buying Price,Selling Date,Selling Price,Total Stocks,Risk",
      "utf-8"
    );
  }
  fs.writeFile(
    `result/${fileName}.csv`,
    "\r\n" + trade,
    { encoding: "utf-8", flag: "a" },
    () => {}
  );
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

export const paperTrade = (config: any) => {
  const startingDay = 2;
  const liveQuote = new LiveQuote();
  const stock = new LiveQuoteManager(liveQuote, startingDay);

  const strategyClass = STRATEGIES[config.strategy]._class;

  const strategy = new strategyClass(
    stock,
    persistPaperTradeResult("paperTrade")
  );

  strategy.execute();
};

export default backtest;
