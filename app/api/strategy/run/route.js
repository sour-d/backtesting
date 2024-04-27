import strategies from "@/trading/strategy";
import fs from "fs";

const persistBackTestResult = (stockName) => (outcomes) => {
  fs.writeFileSync(
    `result/backtest.json`,
    JSON.stringify({ report: outcomes.getReport(), trades: outcomes.toCSV() }),
    "utf-8"
  );
  fs.writeFileSync(`result/backtest.csv`, outcomes.toCSV(), "utf-8");
};

export async function POST(req) {
  const { strategyName, config } = await req.json();
  const Strategy = strategies.find(
    (strategy) => strategy.name === strategyName
  );
  if (!Strategy) {
    return Response.json(
      {
        success: false,
        message: "Strategy not found",
        config,
      },
      { status: 500 }
    );
  }

  const strategy = new Strategy(
    "nifty",
    persistBackTestResult("nifty"),
    config
  );
  strategy.execute();

  return Response.json({
    success: true,
    message: "Strategy executed",
    config,
  });
}
