const main = async () => {
  const { tradeInfo, trades } = await getResult();

  generateReport(tradeInfo);

  const data = transformTradesData(trades, tradeInfo.timeFrame);
  drawProfitLossChart(data);
  drawTotalProfitOverTime(data);
  drawDurationProfitChart(data);
  drawRiskRewardChart(data);
  drawAccumulatedRewardChart(data);
  drawDrawDownChart(data);
};