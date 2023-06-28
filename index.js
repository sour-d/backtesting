// Import starts
const fs = require('fs');
const symbolList = require("./src/symbolList.json");
const { parseQuotes } = require("./src/parser.js");
const { StockFeedSimulator } = require("./src/StockFeedSimulator.js");
const { FortyTwentyStrategy } = require("./src/strategy/FortyTwentyStrategy.js");
const { MovingAverageStrategy } = require("./src/strategy/MovingAverageStrategy.js");
const { table } = require('console');
// Import ends


// Global flags
const STRATEGY = FortyTwentyStrategy;
// Global flags


const persistTrades = (stockName) => (data) => {
  fs.writeFileSync(`result/${stockName}.json`, data, "utf-8");
};

// Main logic to get the result
const runStrategy = (analyzedResult, { name: stockName, symbol }) => {
  const stockData = parseQuotes(stockName);
  const startingDay = 40; // choose according to strategy
  const stock = new StockFeedSimulator(stockData, startingDay);
  const capital = 100000;
  const riskFactor = 0.05;
  const strategy = new STRATEGY(stock, capital, riskFactor, persistTrades(stockName));
  const aggregates = strategy.getExpectancy();

  analyzedResult[stockName] = {
    averageExpectancy: aggregates.averageExpectancy,
    averageReturn: aggregates.averageReturn
  };

  analyzedResult.totalExpectancy += aggregates.averageExpectancy;
  analyzedResult.totalReturn += aggregates.averageReturn;

  return analyzedResult;
};

const main = () => {
  Object.keys(symbolList).forEach((categoryName) => {
    console.log(categoryName);
    const category = symbolList[categoryName];
    const totalSymbol = category.length;
    const categoryResult = category.reduce(
      (analyzedResult, x) => runStrategy(analyzedResult, x),
      { totalExpectancy: 0, totalReturn: 0 });
  
    categoryResult.averages = {};
    categoryResult.averages.averageExpectancy = categoryResult.totalExpectancy / totalSymbol;
    categoryResult.averages.averageReturn = categoryResult.totalReturn / totalSymbol;

    delete categoryResult.totalExpectancy;
    delete categoryResult.totalReturn;
  
    table(categoryResult);
  });
};

main();
