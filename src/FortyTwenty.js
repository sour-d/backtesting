const { parse } = require("./parseData");
const { Simulator } = require("./simulator");

const oneTrade = (stock) => {
  while (stock.nextDay()) {
    const last20DayLow = stock.lowOfLast(20);
    const today = stock.today();
    if (today.Low <= last20DayLow.Low) {
      return { sellingDay: today };
    }
  }

  return {};
}

const multipleTrades = (stock) => {
  const expectancies = [];
  while (stock.hasData()) {
    const highestDay = stock.highOfLast(40);
    const lowestDay = stock.lowOfLast(20);

    const { sellingDay } = oneTrade(stock);
    if (sellingDay) {
      const risk = highestDay.High - lowestDay.Low;
      const profitOrLoss = sellingDay.Low - highestDay.High;
      const riskMultiple = profitOrLoss / risk;
      expectancies.push({ riskMultiple, risk });
      stock.nextDay();
    }

  }
  return expectancies;
}

const tcsSimulator = new Simulator(parse("NIFTY").data, 40);

const expectancies = multipleTrades(tcsSimulator);
const avg = expectancies.reduce((avg, trade) => {
  avg += trade.riskMultiple;
  return avg;
}, 0);

console.log(expectancies);
console.log(avg / expectancies.length);