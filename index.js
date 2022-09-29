const { parse } = require("./src/parser.js");
const { Stock } = require("./src/Stock.js");
const { FortyTwentyStrategy } = require("./src/strategy/FortyTwentyStrategy.js");

const stockSymbols = ["TCS", "NIFTY"];
// const stockSymbols = ["NIFTY"];

stockSymbols.forEach((symbol) => {
  const { data } = parse(symbol);
  const stock = new Stock(data, 40); //should start from 40th day otherwise data will be inaccurate
  const strategy = new FortyTwentyStrategy(stock);

  console.log(symbol);
  // strategy.execute();
  console.log(strategy.getExpectancy());
});