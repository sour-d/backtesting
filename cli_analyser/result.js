import { transformTradesData } from "../trading/outcome/transformResult.js";
import fs from "fs";

const result_dir = "./.output/result/";

const trimToTwoDecimal = (value) => +value.toFixed(2);

const showInfo = (data, filename) => {
  fs.writeFileSync(
    `${result_dir}${filename}summary.json`,
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

  summary.averageTradeTime =
    data.reduce((acc, trade) => acc + trade.duration, 0) / summary.totalTrades;

  summary.maxDrawDown = Math.min(...data.map((trade) => trade.drawDown)); // drawDown is negative
  summary.maxDrawDownDuration = Math.max(
    ...data.map((trade) => trade.drawDownDuration)
  );
  // summary.maxRiskLoss = Math.max(...data.map((trade) => trade.risk));

  // console.log(
  //   Object.keys(summary).forEach((key) =>
  //     console.log(`${key}: ${trimToTwoDecimal(summary[key])}`)
  //   )
  // );
  console.log(summary);
};

const main = () => {
  if (process.argv.length < 3) throw "Please provide a filename";

  const filename = process.argv[2];
  const filepath = `${result_dir}${filename}.json`;
  if (!fs.existsSync(filepath)) throw "File not found";

  const data = JSON.parse(fs.readFileSync(filepath, "utf-8"));

  const parsedResult = transformTradesData(data.tradeResults, "1");
  showInfo(parsedResult, filename);
};

main();
