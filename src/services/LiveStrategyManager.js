import { createStrategy, getAllStrategies, updateStrategyState } from "../db/strategies";
import { logFileName } from "../utils";
import strategies from "../trading/strategy";

const isProd = process.env.ENV === "prod";

class LiveStrategyManager {
  constructor() {
    this.runningStrategies = {};
  }

  async loadStrategies() {
    if (!isProd) return;
    const allStrategies = await getAllStrategies();
    for (const dbStrategy of allStrategies) {
      const { strategyName, stockName, timeFrame, config, state } = dbStrategy;
      const Strategy = strategies.find(
        (strategy) => strategy.name === strategyName
      );
      if (Strategy) {
        const strategy = new Strategy(
          stockName,
          timeFrame,
          () => {},
          config,
          state
        );
        this.addStrategy(strategy, false);
      }
    }
  }

  async addStrategy(strategy, isNew = true) {
    const { stockName, timeFrame, strategyName, config } = strategy;
    const strategyKey = logFileName(stockName, timeFrame, strategyName);

    if (isNew && isProd) {
      const dbStrategy = await createStrategy({
        strategyName,
        stockName,
        timeFrame,
        config,
        state: strategy.toJSON(),
      });
      strategy.id = dbStrategy.id;
    }

    this.runningStrategies[strategyKey] = strategy;

    if (isProd) {
      // periodically update the state in the database
      setInterval(async () => {
        await updateStrategyState(strategy.id, strategy.toJSON());
      }, 5000);
    }
  }

  getStrategy({ stockName, timeFrame, strategyName }) {
    const strategyKey = logFileName(stockName, timeFrame, strategyName);

    return this.runningStrategies[strategyKey];
  }
}

export default LiveStrategyManager;
