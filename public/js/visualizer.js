const GREEN = "#6dc66d";
const RED = "#ff6060";
const DARK_RED = "#b20000";

const drawTimeProfitBarChart = async (trades) => {
  const chartData = {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    description: "Profit over time.",
    vconcat: [
      {
        mark: { type: "bar", tooltip: true },
        transform: [
          {
            calculate: "datum.profitOrLoss > 0 ? 'Profit' : 'Loss'",
            as: "Outcome",
          },
        ],
        encoding: {
          x: {
            field: "id",
            type: "ordinal",
            title: "Trades",
          },
          y: {
            field: "profitOrLoss",
            type: "quantitative",
            title: "Profit or Loss",
          },
          color: { field: "Outcome", scale: { range: [RED, GREEN] } },
          tooltip: [
            {
              field: "profitOrLoss",
              type: "quantitative",
              title: "Profit Or Loss",
            },
            { field: "buyingDate", type: "ordinal", title: "Buying Date" },
            { field: "sellingDate", type: "ordinal", title: "Selling Date" },
          ],
        },
      },
      {
        layer: [
          {
            mark: "bar",
            transform: [
              {
                calculate: "datum.profitOrLoss > 0 ? 'Profit' : 'Loss'",
                as: "Outcome",
              },
            ],
            encoding: {
              x: {
                field: "id",
                type: "ordinal",
                title: "Trades",
              },
              y: {
                field: "time",
                type: "quantitative",
                title: "Time",
              },
              color: {
                field: "Outcome",
                scale: { range: [RED, GREEN] },
              },
              tooltip: [
                { field: "time", type: "quantitative", title: "Time Taken" },
              ],
            },
          },
          {
            mark: { type: "rule", tooltip: true },
            encoding: {
              y: {
                aggregate: "mean",
                field: "time",
                type: "quantitative",
                title: "Average Time Taken",
              },
              color: { value: DARK_RED },
              size: { value: 2 },
            },
          },
        ],
      },
    ],
  };

  const data = trades.map((trade, i) => {
    const timeDiff = dayjs(trade["Selling Date"]).diff(
      dayjs(trade["Buying Date"]),
      "day"
    );
    const profitOrLoss =
      (trade["Selling Price"] - trade["Buying Price"]) * trade["Total Stocks"];
    return {
      time: timeDiff,
      profitOrLoss,
      id: i + 1,
      buyingDate: trade["Buying Date"],
      sellingDate: trade["Selling Date"],
    };
  });

  chartData.data = { values: data };
  vegaEmbed("#graph3", chartData);
};

const updatedTotalTrades = (data) => {
  const totalTradesEle = document.getElementById('total-trades');
  totalTradesEle.innerText = `Total Trades : ${data.length}`;
}

const main = async () => {
  const trades = await getTrades();
  const data = transformData(trades);
  updatedTotalTrades(data);
  drawProfitLossChart(data);
  drawTotalProfitOverTime(data);
  drawDurationProfitChart(data);
};

main();