import { prepareResponse } from "../../modules/utils/index.js";
import strategies from "../../modules/trading-engine/strategy/index.js";
import ServiceProvider from "../../modules/core-services/service-provider.js";

export async function Trade(req, res) {
  const { strategyName, timeFrame, stockName, ...config } = req.body;
  const Strategy = strategies.find(
    (strategy) => strategy.name === strategyName
  );
  if (!Strategy) {
    return res.status(500).json(prepareResponse("Strategy not found", true));
  }

  const strategy = new Strategy(
    stockName,
    timeFrame,
    { ...config, capital: parseInt(config.capital), }
  );

  await ServiceProvider.getInstance().liveStrategyManager.addStrategy(strategy);
  strategy.execute();

  return res.status(200).json(prepareResponse("Strategy executed", false));
}
