const GREEN = "#6dc66d";
const RED = "#ff6060";
const DARK_RED = "#b20000";

const parseTitle = (camelCase) => {
  const title = camelCase.replace(/([A-Z])/g, " $1");
  return title.charAt(0).toUpperCase() + title.slice(1);
};

const generateReport = (report) => {
  document.querySelector("#report").innerHTML = "";
  Object.entries(report).forEach(([itemName, item]) => {
    const p = document.createElement("p");
    p.innerText = `${parseTitle(itemName)} : ${item}`;
    document.querySelector("#report").appendChild(p);
  });
};

const updatedTotalTrades = (data) => {
  const totalTradesEle = document.getElementById("total-trades");
  totalTradesEle.innerText = `Total Trades : ${data.length}`;
};

const main = async () => {
  const { tradeInfo, trades } = await getResult();

  generateReport(tradeInfo);

  const data = transformTradesData(trades);
  drawProfitLossChart(data);
  drawTotalProfitOverTime(data);
  drawDurationProfitChart(data);
  drawRiskRewardChart(data);
  drawAccumulatedRewardChart(data);
  drawDrawDownChart(data);
};
