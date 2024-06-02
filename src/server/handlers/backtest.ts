import fs from "fs";
import { transformStockData } from "../../trading/parser/restructureData";
import { Trades } from "../../trading/outcome/Trades";
import { ExistingQuoteStorage } from "../../trading/quote/ExistingQuoteStorage";
import { STRATEGIES } from "../../trading/strategy";

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
