import { transformTradesData } from "../trading/outcome/transformResult.js";
import fs from "fs";
import { std } from "mathjs"; // Example library for standard deviation

const resultDir = "./.output/result/";

const trimToTwoDecimal = (value) => +value.toFixed(2);

const showInfo = (data, filename) => {
  fs.writeFileSync(
    `${resultDir}${filename}summary.json`,
    JSON.stringify(data, null, 2),
    "utf-8"
  );

  const summary = {};
  summary.totalTrades = data.length;
  summary.win = data.filter((trade) => trade.profitOrLoss > 0).length;
  summary.loss = data.filter((trade) => trade.profitOrLoss < 0).length;
  summary.accuracy = (summary.win / summary.totalTrades) * 100;

  summary.totalReward = data.reduce((acc, trade) => acc + trade.reward, 0);
  summary.maxReward = Math.max(...data.map((trade) => trade.reward));
  summary.minReward = Math.min(...data.map((trade) => trade.reward));
  summary.averageWinReward =
    data
      .filter((trade) => trade.profitOrLoss > 0)
      .reduce((acc, trade) => acc + trade.reward, 0) / summary.win;
  summary.averageLossReward =
    data
      .filter((trade) => trade.profitOrLoss < 0)
      .reduce((acc, trade) => acc + trade.reward, 0) / summary.loss;
  summary.averageReward = summary.totalReward / summary.totalTrades;
  summary.totalRisk = data.reduce((acc, trade) => acc + trade.risk, 0);
  summary.totalProfitOrLoss = data.reduce(
    (acc, trade) => acc + trade.profitOrLoss,
    0
  );
  summary.averageExpectancy = summary.totalProfitOrLoss / summary.totalRisk; // Assuming risk is the total risk
  summary.averageTradeTime =
    data.reduce((acc, trade) => acc + trade.duration, 0) / summary.totalTrades;
  summary.maxDrawDown = Math.abs(
    Math.min(...data.map((trade) => trade.drawDown))
  ); // Drawdown is negative, so take absolute value
  summary.maxDrawDownDuration = Math.max(
    ...data.map((trade) => trade.drawDownDuration)
  );
  summary.totalProfitOrLoss = data.reduce(
    (acc, trade) => acc + trade.profitOrLoss,
    0
  );

  summary.totalReward = data.reduce((acc, trade) => acc + trade.reward, 0);
  summary.averageReward = summary.totalReward / summary.totalTrades;
  summary.rewardStandardDeviation = std(data.map((trade) => trade.reward)); // Assuming reward data is normally distributed
  summary.sharpeRatio =
    (summary.averageReward - 0) / summary.rewardStandardDeviation || 0; // Assuming risk-free rate of 0

  // Profit Factor calculation
  const winningTrades = data.filter((trade) => trade.profitOrLoss > 0);
  summary.averageWinningReward =
    winningTrades.length > 0
      ? winningTrades.reduce((acc, trade) => acc + trade.reward, 0) /
        winningTrades.length
      : 0;
  const losingTrades = data.filter((trade) => trade.profitOrLoss < 0);
  const averageLosingReward =
    losingTrades.length > 0
      ? Math.abs(
          losingTrades.reduce((acc, trade) => acc + trade.reward, 0) /
            losingTrades.length
        )
      : 0;
  summary.profitFactor =
    summary.averageWinningReward !== 0
      ? summary.averageWinningReward / averageLosingReward
      : 0;

  // Print the summary in a readable format
  console.log("Summary:");
  for (const key of Object.keys(summary)) {
    console.log(`${key}: ${trimToTwoDecimal(summary[key])}`);
  }
};

const main = () => {
  if (process.argv.length < 3) throw "Please provide a filename";

  const filename = process.argv[2];
  const filepath = `${resultDir}${filename}.json`;
  if (!fs.existsSync(filepath)) throw "File not found";

  const data = JSON.parse(fs.readFileSync(filepath, "utf-8"));

  const parsedResult = transformTradesData(data.tradeResults, "1");
  showInfo(parsedResult, filename);
};

main();
