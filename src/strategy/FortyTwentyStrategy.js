class FortyTwentyStrategy {
  #stock;
  // #capital;
  // #riskPercentage;

  constructor(stock, capital, riskPercentage) {
    this.#stock = stock;
    // this.#capital = capital;
    // this.#riskPercentage = riskPercentage;
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

  #trade(risk) { //renamed
    const buyingDay = this.#stock.today();
    const sellingDay = this.#checkForStopLossHit();
    const profitOrLoss = sellingDay.Low - buyingDay.High;
    const riskMultiple = profitOrLoss / risk;
    // store data
    return riskMultiple;

  }

  execute() {
    const tradeOutcomes = [];
    while (this.#stock.hasData()) {
      const today = this.#stock.nextDay();
      const lastFortyDayHigh = this.#stock.highOfLast(40);

      if (this.#isHighBroke(today, lastFortyDayHigh)) {
        const lastTwentyDayLow = this.#stock.lowOfLast(20);
        const risk = today.High - lastTwentyDayLow.Low;

        tradeOutcomes.push(this.#trade(risk));
      }
    }
    return tradeOutcomes;
  }

  getExpectancy() {
    const tradeOutcomes = this.execute();
    const aggregateExpectancy = tradeOutcomes.reduce(
      (sum, tradeOutcomes) => sum + tradeOutcomes
    );
    return aggregateExpectancy / tradeOutcomes.length;
  }
}

module.exports = { FortyTwentyStrategy };
