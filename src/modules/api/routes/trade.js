import { prepareResponse } from "../../utils.js";
import strategies from "../../trading/strategy/index.js";
import fs from "fs";
import ServiceProvider from "../../services/ServiceProvider.js";

const persistBackTestResult = (stockName, timeFrame) => (outcomes) => {
  fs.writeFileSync(
    `${process.env.RESULT_OUTPUT_DIR}/${stockName}_${timeFrame}.json`,
    JSON.stringify({ report: outcomes.getReport(), trades: outcomes.toJSON() }),
    "utf-8"
  );
};

export async function Trade(req, res) {
  const { strategyName, timeFrame, stockName, ...config } = req.body;
  const Strategy = strategies.find(
    (strategy) => strategy.name === strategyName
  );
  if (!Strategy) {
    return res.json(prepareResponse("Strategy not found", true), {
      status: 500,
    });
  }

  const strategy = new Strategy(
    stockName,
    timeFrame,
    persistBackTestResult(stockName, timeFrame),
    { ...config, capital: parseInt(config.capital), precise: parseInt(config.precise), }
  );
  await ServiceProvider.getInstance().liveStrategyManager.addStrategy(strategy);
  strategy.execute();

  return res.json(prepareResponse("Strategy executed", false));
}
