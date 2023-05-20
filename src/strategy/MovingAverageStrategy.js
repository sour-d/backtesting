class MovingAverageStrategy {
  #stock;
  #capital;
  #riskPercentage;

  constructor(stock, capital, risk) {
    this.#stock = stock;
    this.#capital = capital;
    this.#riskPercentage = risk;
  }

  #checkForStopLossHit() {
    while (this.#stock.hasData()) {
      const today = this.#stock.nextDay();
      const fiftyDayMovingAverage = this.#stock.simpleMovingAverage(50);
      if (today.Low <= fiftyDayMovingAverage) {
        return today;
      }
    }
    return this.#stock.today();
  }

  #getRisk() {
    return this.#capital * this.#riskPercentage;
  }

  #getTotalStocks(riskForOneStock, buyingPrice) {
    const risk = this.#getRisk();
    const numberOfStocksUnderRisk = Math.floor(risk / riskForOneStock); // get a better name if possible.
    const totalCost = numberOfStocksUnderRisk * buyingPrice;
    if (totalCost <= this.#capital) {
      return numberOfStocksUnderRisk;
    }

    return Math.floor(this.#capital / buyingPrice);
  }

  #trade() {
    const buyingDay = this.#stock.today();
    const initialStopLoss = this.#stock.simpleMovingAverage(50);
    const riskForOneStock = buyingDay.High - initialStopLoss.Low;
    const totalStocks = this.#getTotalStocks(riskForOneStock, buyingDay.High);

    const sellingDay = this.#checkForStopLossHit();
    const oneStockProfitOrLoss = sellingDay.Low - buyingDay.High;
    const totalProfitOrLoss = oneStockProfitOrLoss * totalStocks;
    const riskMultiple = totalProfitOrLoss / this.#getRisk();

    return riskMultiple;
  }

  execute() {
    while (this.#stock.hasData()) {
      const today = this.#stock.nextDay();
      const twoHundredDayMovingAverage = this.#stock.simpleMovingAverage(200);
      const hundredDayMovingAverage = this.#stock.simpleMovingAverage(100);
      console.log(twoHundredDayMovingAverage, hundredDayMovingAverage);
      if (twoHundredDayMovingAverage < today.High && hundredDayMovingAverage < today.High) {
        return this.#trade();
      }
    }
  }
}

module.exports = { MovingAverageStrategy };