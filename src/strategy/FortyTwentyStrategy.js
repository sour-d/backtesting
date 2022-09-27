class FortyTwentyStrategy {
  #stock;

  constructor(stock) {
    this.#stock = stock;
  }

  #checkForStopLossHit() {
    while (this.#stock.nextDay()) {
      const lastTwentyDayLow = this.#stock.lowOfLast(20);
      const today = this.#stock.today();
      if (today.Low <= lastTwentyDayLow.Low) {
        return today;
      }
    }
  }

  #isHighBroke(today, highestDay) {
    return today.High > highestDay.High;
  }

  #buyStock(risk) {
    const buyingDay = this.#stock.today();
    const sellingDay = this.#checkForStopLossHit();
    if (sellingDay) {
      const profitOrLoss = sellingDay.Low - buyingDay.High;
      const riskMultiple = profitOrLoss / risk;
      // store data
      console.log({ riskMultiple, risk });
    }
  }

  execute() {
    while (this.#stock.hasData() && this.#stock.nextDay()) {
      const highestDay = this.#stock.highOfLast(40);
      const today = this.#stock.today();

      if (this.#isHighBroke(today, highestDay)) {
        const lowestDay = this.#stock.lowOfLast(20);
        const risk = today.High - lowestDay.Low;
        this.#buyStock(risk);
      }
    }
  }
}

module.exports = { FortyTwentyStrategy };
