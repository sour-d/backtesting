class FortyTwentyStrategy {
  #stock;
  #capital;
  #riskPercentage;

  constructor(stock, capital, riskPercentage) {
    this.#stock = stock;
    this.#capital = capital;

    // riskPercentage stored as fraction like 2/100, not 2%
    this.#riskPercentage = riskPercentage;
  }

  #checkForStopLossHit() {
    while (this.#stock.hasData()) {
      const today = this.#stock.nextDay();
      const lastTwentyDayLow = this.#stock.lowOfLast(20);
      if (today.Low <= lastTwentyDayLow.Low) {
        return today;
      }
    }
    return this.#stock.today();
  }

  #isHighBroke(today, highestDay) {
    return today.High > highestDay.High;
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

  #updateCapital(amountGainOrLoss) {
    this.#capital += amountGainOrLoss;
  }

  #trade() { //renamed
    const buyingDay = this.#stock.today();
    const initialStopLoss = this.#stock.lowOfLast(20);
    const riskForOneStock = buyingDay.High - initialStopLoss.Low;
    const totalStocks = this.#getTotalStocks(riskForOneStock, buyingDay.High);

    const sellingDay = this.#checkForStopLossHit();
    const oneStockProfitOrLoss = sellingDay.Low - buyingDay.High;
    const totalProfitOrLoss = oneStockProfitOrLoss * totalStocks;
    const riskMultiple = totalProfitOrLoss / this.#getRisk();

    // store data
    this.#updateCapital(totalProfitOrLoss);
    return riskMultiple;

  }

  execute() {
    const tradeOutcomes = [];
    while (this.#stock.hasData()) {
      const today = this.#stock.nextDay();
      const lastFortyDayHigh = this.#stock.highOfLast(40);

      if (this.#isHighBroke(today, lastFortyDayHigh)) {
        tradeOutcomes.push(this.#trade());
      }
    }
    return tradeOutcomes;
  }

  getExpectancy() {
    const tradeOutcomes = this.execute();
    const aggregateExpectancy = tradeOutcomes.reduce(
      (sum, tradeOutcome) => sum + tradeOutcome
    );
    return aggregateExpectancy / tradeOutcomes.length;
  }

  getCapital() {
    return this.#capital;
  }
}

module.exports = { FortyTwentyStrategy };
