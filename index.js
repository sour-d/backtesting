const { parse } = require("./src/parser");
const { Stock } = require("./src/Stock");
const { FortyTwentyStrategy } = require("./src/strategy/FortyTwentyStrategy");

const stockSymbols = ["TCS", "NIFTY"];

stockSymbols.forEach((symbol) => {
  const { data } = parse(symbol);
  const stock = new Stock(data);
  const strategy = new FortyTwentyStrategy(stock);

  console.log(symbol);
  strategy.execute();
});