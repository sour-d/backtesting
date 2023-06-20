const { Strategy } = require("../Strategy");

class MovingAverageStrategy extends Strategy{
  constructor(stock, capital, riskPercentage, persistTradesFn) {
    super(stock,capital,riskPercentage,persistTradesFn);
  }

  #checkForStopLossHit() {
    while (this.stock.hasData()) {
      const today = this.stock.nextDay();
      const fiftyDayMovingAverage = this.stock.simpleMovingAverage(50);
      if (today.Low <= fiftyDayMovingAverage) {
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
    const initialStopLoss = this.stock.simpleMovingAverage(50);
    const riskForOneStock = buyingDay.High - initialStopLoss.Low;
    const totalStocks = this.#getTotalStocks(riskForOneStock, buyingDay.High);

    const sellingDay = this.#checkForStopLossHit();
    const oneStockProfitOrLoss = sellingDay.Low - buyingDay.High;
    const totalProfitOrLoss = oneStockProfitOrLoss * totalStocks;
    const riskMultiple = totalProfitOrLoss / this.getRisk();

    this.updateCapital(totalProfitOrLoss);
    this.trades.push({
      buyingDay, initialStopLoss, riskForOneStock, totalStocks,
      sellingDay, oneStockProfitOrLoss, totalProfitOrLoss, riskMultiple
    });

    return riskMultiple;
  }

  execute() {
    const tradeOutcomes = [];
    while (this.stock.hasData()) {
      const today = this.stock.nextDay();
      const twoHundredDayMovingAverage = this.stock.simpleMovingAverage(200);
      const hundredDayMovingAverage = this.stock.simpleMovingAverage(100);
      if (twoHundredDayMovingAverage < today.High && hundredDayMovingAverage < today.High) {
         tradeOutcomes.push(this.#trade());
      }
    }
    this.persistTradesFn(JSON.stringify(this.trades));
    return tradeOutcomes;
  }
}

module.exports = { MovingAverageStrategy };