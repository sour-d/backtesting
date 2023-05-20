// Import starts
const { parse } = require("./src/parser.js");
const { StockSimulator } = require("./src/Stock.js");
const { FortyTwentyStrategy } = require("./src/strategy/FortyTwentyStrategy.js");
const { MovingAverageStrategy } = require("./src/strategy/MovingAverageStrategy.js");
// Import ends


// Global flags
const STRATEGY = FortyTwentyStrategy;
const STOCKSYMBOLS = ["TCS", "NIFTY", "BAJFINANCE"];
// Global flags


// Main logic to get the result
const runStrategy = (symbol) => {
  const { data: stockData } = parse(symbol);
  const startingDay = 40; // choose according to strategy
  const stock = new StockSimulator(stockData, startingDay);
  const capital = 100000;
  const riskFactor = 0.02;
  const strategy = new STRATEGY(stock, capital, riskFactor);

  console.log(`Expectancy of ${symbol} is ${strategy.getExpectancy()}`);
};

STOCKSYMBOLS.forEach(runStrategy);
