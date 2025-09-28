import getInstrumentInfo from "../../exchange/instrument.js";

class Symbol {
  constructor(name) {
    this.name = name;
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
}

export default Symbol;