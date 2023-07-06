import fs from "fs";
// import { table } from "console";
import { parseQuotes } from "./parser";
import { StockFeedSimulator } from "./StockFeedSimulator";
import { FortyTwentyStrategy } from "./strategy/FortyTwentyStrategy";
import { MovingAverageStrategy } from "./strategy/MovingAverageStrategy";

const STRATEGY = MovingAverageStrategy;

const persistTrades = (stockName: string) => (data: string) => {
  fs.writeFileSync(`result/${stockName}.json`, data, "utf-8");
};

const runStrategy = ({ name: stockName, symbol }: any) => {
  const stockData = parseQuotes(stockName);
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
  const aggregates = strategy.getExpectancy();
  // analyzedResult[stockName] = {
  //   averageExpectancy: aggregates.averageExpectancy,
  //   averageReturn: aggregates.averageReturn,
  // };
  // analyzedResult.totalExpectancy += aggregates.averageExpectancy;
  // analyzedResult.totalReturn += aggregates.averageReturn;
  // return analyzedResult;
};

const app = (symbolList: any) => {
  Object.keys(symbolList).forEach((categoryName) => {
    console.log(categoryName);
    const category = symbolList[categoryName];
    category.forEach(runStrategy);
    // const totalSymbol = category.length;
    // const categoryResult = category.reduce(
    //   (analyzedResult, x) => runStrategy(analyzedResult, x),
    //   { totalExpectancy: 0, totalReturn: 0 }
    // );
    // categoryResult.averages = {};
    // categoryResult.averages.averageExpectancy =
    //   categoryResult.totalExpectancy / totalSymbol;
    // categoryResult.averages.averageReturn =
    //   categoryResult.totalReturn / totalSymbol;
    // delete categoryResult.totalExpectancy;
    // delete categoryResult.totalReturn;
    // table(categoryResult);
  });
};

module.exports = { app };
