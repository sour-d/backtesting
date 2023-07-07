import fs from "fs";
import { table } from "console";
import { parseQuotes } from "./parser";
import { StockFeedSimulator } from "./StockFeedSimulator";
import { FortyTwentyStrategy } from "./strategy/FortyTwentyStrategy";
import { MovingAverageStrategy } from "./strategy/MovingAverageStrategy";
import { Trades } from "./Trades";
import { transformStockData } from "./restructureData";

const STRATEGY = FortyTwentyStrategy;

const persistTrades = (stockName: string) => (data: string) => {
  fs.writeFileSync(`result/${stockName}.csv`, data, "utf-8");
};

const runStrategy = ({ name: stockName, symbol }: any) => {
  const stockData = transformStockData(stockName);

  const startingDay = 40;
  const stock = new StockFeedSimulator(stockData, startingDay);
  const capital = 100000;
  const riskFactor = 0.05;
  const strategy = new STRATEGY(
    stock,
    capital,
    riskFactor,
    persistTrades(stockName)
  );
  const outcomes: Trades = strategy.execute();
  return {
    averageExpectancy: outcomes.averageExpectancy(),
    averageReturn: outcomes.averageReturn(),
  };
};

const app = (symbolList: any) => {
  console.log("Strategy used :", STRATEGY.name);

  Object.keys(symbolList).forEach((categoryName) => {
    console.log(categoryName);
    const stockList = symbolList[categoryName];
    const results: any = {};
    stockList.forEach((stock: any) => {
      const result = runStrategy(stock);
      results[stock.name] = result;
    });
    table(results);
  });
};

module.exports = { app };
