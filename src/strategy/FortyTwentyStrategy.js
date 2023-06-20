const { Strategy } = require("../Strategy");

class FortyTwentyStrategy extends Strategy {
  constructor(stock, capital, riskPercentage, persistTradesFn) {
    super(stock,capital,riskPercentage,persistTradesFn);
  }

  #checkForStopLossHit() {
    while (this.stock.hasData()) {
      const today = this.stock.nextDay();
      const lastTwentyDayLow = this.stock.lowOfLast(20);
      if (today.Low <= lastTwentyDayLow.Low) {
        return today;
      }
    }
    return this.stock.today();
  }

  #isHighBroken(today, highestDay) {
    return today.High > highestDay.High;
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

  #trade() { //renamed
    const buyingDay = this.stock.today();
    const initialStopLoss = this.stock.lowOfLast(20);
    const riskForOneStock = buyingDay.High - initialStopLoss.Low;
    const totalStocks = this.#getTotalStocks(riskForOneStock, buyingDay.High);

    const sellingDay = this.#checkForStopLossHit();
    const oneStockProfitOrLoss = sellingDay.Low - buyingDay.High;
    const totalProfitOrLoss = oneStockProfitOrLoss * totalStocks;
    const riskMultiple = totalProfitOrLoss / this.getRisk();
    const noOfMillis = sellingDay.Date.getTime() - buyingDay.Date.getTime();
    const noOfYrs = noOfMillis / (1000 * 60 * 60 * 24 * 365);
    const returnPercentage = (totalProfitOrLoss * 100) / (this.capital * noOfYrs);

    // store data
    this.updateCapital(totalProfitOrLoss);
    this.trades.push({
      buyingDay, initialStopLoss, riskForOneStock, totalStocks,
      sellingDay, oneStockProfitOrLoss, totalProfitOrLoss, riskMultiple, returnPercentage
    });

    return {riskMultiple, returnPercentage};
  }

  execute() {
    const tradeOutcomes = [];
    while (this.stock.hasData()) {
      const today = this.stock.nextDay();
      const lastFortyDayHigh = this.stock.highOfLast(40);

      if (this.#isHighBroken(today, lastFortyDayHigh)) {
        tradeOutcomes.push(this.#trade());
      }
    }
    this.persistTradesFn(JSON.stringify(this.trades));
    return tradeOutcomes;
  }
}

module.exports = { FortyTwentyStrategy };
