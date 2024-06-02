import strategies from "../../trading/strategy";

export function StrategyList(req, res) {
  const strategyWithConfig = {};
  strategies.forEach((strategy) => {
    strategyWithConfig[strategy.name] = strategy.getDefaultConfig();
  });
  return res.json(strategyWithConfig);
}
