const { parse } = require("./src/parser");
const { Stock } = require("./src/Stock");
const { FortyTwentyStrategy } = require("./src/strategy/FortyTwentyStrategy");

const stockSymbols = ["TCS", "NIFTY"];

stockSymbols.forEach((symbol) => {
  const stock = new Stock(parse(symbol).data);
  const strategy = new FortyTwentyStrategy(stock);

  strategy.execute();
});