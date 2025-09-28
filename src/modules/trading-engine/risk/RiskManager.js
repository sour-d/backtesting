import broker from "../../exchange/index.js";

class RiskManager {
  constructor(logger, config = {}, state = {}) {
    this.logger = logger;
    this.capital = state.capital || parseInt(config.capital) || 0;
    this.riskPercentage = state.riskPercentage || parseFloat(config.riskPercentage) || 5;
    this.precise = state.precise || parseInt(config.precise) || 0;
    this.risk = this.capital * (this.riskPercentage / 100);

    this.logger.info("restarting risk manager", { state });
  }

  toJSON() {
    return {
      capital: this.capital,
      riskPercentage: this.riskPercentage,
      precise: this.precise,
      risk: this.risk
    };
  }

  updateCapital() {
    broker.getBalance().then((res) => {
      this.capital = res?.bal?.available ?? 0;
      this.logger.info("Fetched Capital", res);
    }).catch((err) => {
      this.logger.error("Failed to fetch capital", err);
    });
    return this.capital;
  }

  setCapital(capital) {
    this.capital = parseInt(capital);
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
      quantity: affordableStocks.toFixed(this.precise),
      quantity_raw: affordableStocks
    });

    return this.precise === 0 ? parseInt(affordableStocks) : affordableStocks.toFixed(this.precise);
  }
}

export { RiskManager };