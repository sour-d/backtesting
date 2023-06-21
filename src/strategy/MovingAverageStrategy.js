const { Strategy } = require("../Strategy");
const lowerLimit = 40;
const upperLimit = 200;

class MovingAverageStrategy extends Strategy{
  constructor(stock, capital, riskPercentage, persistTradesFn) {
    super(stock,capital,riskPercentage,persistTradesFn);
  }

  #checkForStopLossHit() {
    while (this.stock.hasData()) {
      const today = this.stock.nextDay();
      const fortyDayMA = this.stock.simpleMovingAverage(lowerLimit);
      const twoHundredDayMA = this.stock.simpleMovingAverage(upperLimit);
      if (today.Low <= fortyDayMA || twoHundredDayMA >= fortyDayMA) {
        return today;
      }
    }
    return this.stock.today();
  }

  #getTotalStocks(riskForOneStock, buyingPrice) {
    const risk = this.getRisk();
    const numberOfStocksUnderRisk = Math.floor(risk / riskForOneStock); // get a better name if possible.
    const totalCost = numberOfStocksUnderRisk * buyingPrice;
    if (totalCost <= this.capital) {
      return numberOfStocksUnderRisk;
    }

    return Math.floor(this.capital / buyingPrice);
  }

  #trade() {
    const buyingDay = this.stock.today();
    const initialStopLoss = this.stock.simpleMovingAverage(lowerLimit);
    const riskForOneStock = buyingDay.High - initialStopLoss;
    if (riskForOneStock <= 0) {
      return { riskMultiple: 0, returnPercentage: 0 };
    }
    const totalStocks = this.#getTotalStocks(riskForOneStock, buyingDay.High);

    const sellingDay = this.#checkForStopLossHit();
    const oneStockProfitOrLoss = sellingDay.Low - buyingDay.High;
    const totalProfitOrLoss = oneStockProfitOrLoss * totalStocks;
    const riskMultiple = totalProfitOrLoss / this.getRisk();
    const noOfMillis = sellingDay.Date.getTime() - buyingDay.Date.getTime();
    const noOfYrs = noOfMillis / (1000 * 60 * 60 * 24 * 365);
    const returnPercentage = (totalProfitOrLoss * 100) / (this.capital * noOfYrs);

    this.trades.push({
      buyingDay,
      initialStopLoss,
      riskForOneStock,
      totalStocks,
      sellingDay,
      oneStockProfitOrLoss,
      totalProfitOrLoss,
      riskMultiple,
      returnPercentage,
    });

    return {riskMultiple, returnPercentage};
  }

  execute() {
    const tradeOutcomes = [];
    while (this.stock.hasData()) {
      const previousDayUpperLimitMA = this.stock.simpleMovingAverage(upperLimit);
      const previousDayLowerLimitMA = this.stock.simpleMovingAverage(lowerLimit);
      const today = this.stock.nextDay();
      if (previousDayUpperLimitMA > previousDayLowerLimitMA) {
        const upperLimitMA = this.stock.simpleMovingAverage(upperLimit);
        const lowerLimitMA = this.stock.simpleMovingAverage(lowerLimit);
        if (lowerLimitMA >= upperLimitMA) {
          tradeOutcomes.push(this.#trade());
        }  
      }
    }
    this.persistTradesFn(JSON.stringify(this.trades));
    return tradeOutcomes;
  }
}

module.exports = { MovingAverageStrategy };