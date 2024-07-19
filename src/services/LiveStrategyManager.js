const { logFileName } = require("../utils");

class LiveStrategyManager {
  constructor() {
    this.runningStrategies = {};
  }

  addStrategy(strategy) {
    const { stockName, timeFrame, strategyName } = strategy;
    const strategyKey = logFileName(stockName, timeFrame, strategyName);

    this.runningStrategies[strategyKey] = strategy;
  }

  getStrategy({ stockName, timeFrame, strategyName }) {
    const strategyKey = logFileName(stockName, timeFrame, strategyName);

    return this.runningStrategies[strategyKey];
  }
}

export default LiveStrategyManager;
