import { prepareResponse } from "../../utils";
import strategies from "../../trading/strategy";
import fs from "fs";

const persistBackTestResult = (stockName, timeFrame) => (outcomes) => {
  fs.writeFileSync(
    `${process.env.RESULT_OUTPUT_DIR}/${stockName}_${timeFrame}.json`,
    JSON.stringify({ report: outcomes.getReport(), trades: outcomes.toJSON() }),
    "utf-8"
  );
};

export async function Trade(req, res) {
  const { strategyName, timeFrame, config, stockName } = await req.json();
  const Strategy = strategies.find(
    (strategy) => strategy.name === strategyName
  );
  if (!Strategy) {
    return Response.json(prepareResponse("Strategy not found", true), {
      status: 500,
    });
  }

  const strategy = new Strategy(
    stockName,
    timeFrame,
    persistBackTestResult(stockName, timeFrame),
    config,
    true
  );
  strategy.execute();

  return res.json(prepareResponse("Strategy executed", false));
}
