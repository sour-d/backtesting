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

  getExpectancy() {
    const tradeOutcomes = this.execute();
    const totalCount = tradeOutcomes.length;
    const aggregateExpectancy = tradeOutcomes.reduce(
      (sum, tradeOutcome) => {
        sum.totalExpectancy += tradeOutcome.riskMultiple;
        sum.totalReturn += tradeOutcome.returnPercentage;
        return sum;
      },
      { totalExpectancy: 0, totalReturn: 0 }
    );
    return {
      averageExpectancy: aggregateExpectancy.totalExpectancy / totalCount,
      averageReturn: aggregateExpectancy.totalReturn / totalCount
    };
  }
}

module.exports = { Strategy };