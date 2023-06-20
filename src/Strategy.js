class Strategy {
  constructor(stock, capital, riskPercentage, persistTradesFn) {
    this.stock = stock;
    this.capital = capital;

    // riskPercentage stored as fraction like 2/100, not 2%
    this.riskPercentage = riskPercentage;
    this.trades = [];
    this.persistTradesFn = persistTradesFn;
  }

  getRisk() {
    return this.capital * this.riskPercentage;
  }

  updateCapital(amountGainOrLoss) {
    this.capital += amountGainOrLoss;
  }

  getExpectancy() {
    const tradeOutcomes = this.execute();
    const aggregateExpectancy = tradeOutcomes.reduce(
      (sum, tradeOutcome) => sum + tradeOutcome
    );
    return aggregateExpectancy / tradeOutcomes.length;
  }
}

module.exports = { Strategy };