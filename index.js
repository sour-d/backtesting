// Import starts
const fs = require('fs');
const symbolList = require("./src/symbolList.json");
const { parse } = require("./src/parser.js");
const { StockSimulator } = require("./src/Stock.js");
const { FortyTwentyStrategy } = require("./src/strategy/FortyTwentyStrategy.js");
const { MovingAverageStrategy } = require("./src/strategy/MovingAverageStrategy.js");
// Import ends


// Global flags
const STRATEGY = FortyTwentyStrategy;
// Global flags


const persistTrades = (stockName) => (data) => {
  fs.writeFileSync(`result/${stockName}.json`, data, "utf-8");
};

// Main logic to get the result
const runStrategy = ({ name: stockName, symbol }) => {
  const stockData = parse(stockName);
  const startingDay = 40; // choose according to strategy
  const stock = new StockSimulator(stockData, startingDay);
  const capital = 100000;
  const riskFactor = 0.05;
  const strategy = new STRATEGY(stock, capital, riskFactor, persistTrades(stockName));
  const aggregates = strategy.getExpectancy();

  console.log(`\tExpectancy of ${stockName} is ${aggregates.averageExpectancy}`);
  console.log(`\tAverage return of ${stockName} is ${aggregates.averageReturn}`);
};

Object.keys(symbolList).forEach((categoryName) => {
  console.log(categoryName);
  symbolList[categoryName].forEach(runStrategy);
});
