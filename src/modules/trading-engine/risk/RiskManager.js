import broker from "../../broker/index.js";

/**
 * RiskManager class to handle risk calculations and position sizing
 */
class RiskManager {
  /**
   * Constructor for the RiskManager class
   * @param {string} stockName - The name of the stock
   * @param {Function} logger - Logger function
   * @param {Object} config - Configuration for risk management
   * @param {Object} state - Optional state to restore from persistence
   */
  constructor(stockName, logger, config = {}, state = {}) {
    this.stockName = stockName;
    this.logger = logger;
    this.capital = state.capital || parseInt(config.capital) || 0;
    this.riskPercentage = state.riskPercentage || parseFloat(config.riskPercentage) || 5;
    this.precise = state.precise || parseInt(config.precise) || 0;
    this.risk = this.capital * (this.riskPercentage / 100);
  }

  /**
   * Convert the risk manager to JSON for persistence
   * @returns {Object} JSON representation of the risk manager
   */
  toJSON() {
    return {
      stockName: this.stockName,
      capital: this.capital,
      riskPercentage: this.riskPercentage,
      precise: this.precise,
      risk: this.risk
    };
  }

  /**
   * Update the capital from the broker
   * @returns {number} The updated capital
   */
  updateCapital() {
    broker.getBalance().then((res) => {
      this.capital = res?.bal?.available ?? 0;
      this.logger.info("-------- Fetched Capital ---------", res);
    }).catch((err) => {
      this.logger.error("Failed to fetch capital", err);
    });
    return this.capital;
  }

  /**
   * Set the capital manually
   * @param {number} capital - The capital to set
   */
  setCapital(capital) {
    this.capital = parseInt(capital);
    this.risk = this.capital * (this.riskPercentage / 100);
  }

  /**
   * Set the risk percentage
   * @param {number} riskPercentage - The risk percentage to set
   */
  setRiskPercentage(riskPercentage) {
    this.riskPercentage = parseFloat(riskPercentage);
    this.risk = this.capital * (this.riskPercentage / 100);
  }

  /**
   * Get the current capital
   * @returns {number} The current capital
   */
  getCapital() {
    return this.capital;
  }

  /**
   * Get the current risk percentage
   * @returns {number} The current risk percentage
   */
  getRiskPercentage() {
    return this.riskPercentage;
  }

  /**
   * Get the current risk amount
   * @returns {number} The current risk amount
   */
  getRisk() {
    return this.risk;
  }

  /**
   * Calculate the number of stocks that can be bought based on risk and capital
   * @param {number} riskForOneStock - The risk per stock
   * @param {number} buyingPrice - The price to buy at
   * @returns {number} The number of stocks that can be bought
   */
  stocksCanBeBought(riskForOneStock, buyingPrice) {
    const maxStocksByCapital = this.capital / buyingPrice;
    const maxStocksByRisk = this.risk / riskForOneStock;

    const totalCost = maxStocksByRisk * buyingPrice;
    const affordableStocks =
      totalCost <= this.capital ? maxStocksByRisk : maxStocksByCapital;

    this.logger.info("-------- Calculating Stocks to Buy ---------", {
      risk: riskForOneStock,
      price: buyingPrice,
      capital: this.capital,
      risk: this.risk,
      quantity: +affordableStocks.toFixed(this.precise),
      quantity_raw: affordableStocks
    });

    return +affordableStocks.toFixed(this.precise);
  }
}

export { RiskManager };