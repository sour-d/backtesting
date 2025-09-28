import getInstrumentInfo from "../../exchange/instrument.js";

class Symbol {
  constructor(name, strategyId = null) {
    this.name = name;
    this.strategyId = strategyId;
    try {
      this.info = getInstrumentInfo(name);
    } catch (error) {
      this.logger.error("Failed to get symbol info", { symbol: this.symbol, error });
    }
  }

  async getInfo() {
    if (this.info instanceof Promise) {
      this.info = await this.info;
    }
    return this.info;
  }

  toString() {
    return this.name;
  }

  getName() {
    return this.name;
  }

  getStrategyId() {
    return this.strategyId;
  }
}

export default Symbol;