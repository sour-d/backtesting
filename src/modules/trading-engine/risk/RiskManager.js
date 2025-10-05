import broker from "../../exchange/index.js";

class RiskManager {
  constructor(logger, config = {}, state = {}) {
    this.logger = logger;
    this.capital = state.capital || parseInt(config.capital) || 0;
    this.riskPercentage = state.riskPercentage || parseFloat(config.riskPercentage) || 5;
    this.risk = this.capital * (this.riskPercentage / 100);
  }

  toJSON() {
    return {
      capital: this.capital,
      riskPercentage: this.riskPercentage,
      risk: this.risk
    };
  }

  setCapital(capital) {
    this.capital = capital;
    this.risk = this.capital * (this.riskPercentage / 100);
  }

  setRiskPercentage(riskPercentage) {
    this.riskPercentage = parseFloat(riskPercentage);
    this.risk = this.capital * (this.riskPercentage / 100);
  }

  getCapital() {
    return this.capital;
  }

  getRiskPercentage() {
    return this.riskPercentage;
  }

  getRisk() {
    return this.risk;
  }

  stocksCanBeBought(riskForOneStock, buyingPrice) {
    const maxStocksByCapital = parseFloat(this.capital / buyingPrice);
    const maxStocksByRisk = parseFloat(this.risk / riskForOneStock);

    const totalCost = maxStocksByRisk * buyingPrice;
    const affordableStocks =
      totalCost <= this.capital ? maxStocksByRisk : maxStocksByCapital;

    this.logger.info("Stocks quantity calculation", {
      risk: riskForOneStock,
      price: buyingPrice,
      capital: this.capital,
      risk: this.risk,
      quantity: affordableStocks,
    });

    return affordableStocks;
  }
}

export { RiskManager };