const searchQueryString = location.search;
const searchQuery = new URLSearchParams(searchQueryString);
const stockName = decodeURI(searchQuery.get("name"));
const GREEN = "#6dc66d";
const RED = "#ff6060";
const DARK_RED = "#b20000";

const downloadData = async () => {
  const response = await fetch(`/result/${stockName}.csv`);
  const rawTrades = await response.text();
  const trades = Papa.parse(rawTrades, {
    header: true,
    dynamicTyping: true,
  });
  return trades.data;
};

const drawProfitLossChart = async (trades) => {
  var chartData = {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    mark: {
      type: "bar",
      tooltip: true,
    },
    transform: [
      {
        calculate: "datum.profitOrLoss > 0 ? 'Profit' : 'Loss'",
        as: "Outcome",
      },
    ],
    encoding: {
      x: { field: "buyingDate", type: "ordinal", title: "Buying Date" },
      y: {
        field: "profitOrLoss",
        type: "quantitative",
        title: "Profit Or Loss",
      },
      tooltip: [
        { field: "buyingDate", type: "ordinal", title: "Buying Date" },
        {
          field: "profitOrLoss",
          type: "quantitative",
          title: "Profit Or Loss",
        },
        {
          field: "transactionAmount",
          type: "quantitative",
          title: "Transaction Amount",
        },
        { field: "sellingDate", type: "ordinal", title: "Selling Date" },
      ],
      color: { field: "Outcome", scale: { range: [RED, GREEN] } },
    },
  };

  const data = trades.map((trade) => ({
    buyingDate: dayjs(trade["Buying Date"]).format("YYYY-MM-DD"),
    sellingDate: dayjs(trade["Selling Date"]).format("YYYY-MM-DD"),
    profitOrLoss:
      (trade["Selling Price"] - trade["Buying Price"]) * trade["Total Stocks"],
    transactionAmount: trade["Total Stocks"] * trade["Buying Price"],
  }));

  chartData.data = { values: data };

  vegaEmbed("#graph1", chartData);
};

const drawTotalProfitOverTime = async (trades) => {
  const chartData = {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    description: "Profit over time.",
    layer: [
      { mark: { type: "line", point: true, tooltip: true } },
      {
        mark: { type: "line", point: true, tooltip: true },
        transform: [
          {
            calculate: "datum.profitOrLoss > 0 ? 'Profit' : 'Loss'",
            as: "Outcome",
          },
        ],
      },
    ],
    encoding: {
      x: { field: "date", type: "ordinal", title: "Date" },
      y: {
        field: "profitOrLoss",
        type: "quantitative",
        title: "Total Profit Or Loss",
        impute: { value: null },
      },
      tooltip: [
        { field: "date", type: "ordinal", title: "Selling Date" },
        {
          field: "profitOrLoss",
          type: "quantitative",
          title: "Total Profit or Loss",
        },
      ],
      color: {
        field: "Outcome",
        scale: { range: [GREEN, RED, GREEN] },
      },
    },
  };

  const data = [
    {
      date: "0000/00/00",
      profitOrLoss: 0,
    },
  ];
  trades.reduce((total, trade) => {
    const profitOrLoss =
      (trade["Selling Price"] - trade["Buying Price"]) * trade["Total Stocks"];
    data.push({
      date: dayjs(trade["Buying Date"]).format("YYYY-MM-DD"),
      profitOrLoss: total + profitOrLoss,
    });
    return total + profitOrLoss;
  }, 0);

  chartData.data = { values: data };
  vegaEmbed("#graph2", chartData);
};

const drawTimeProfitBarChart = async (trades) => {
  const chartData = {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    description: "Profit over time.",
    config: {
      legend: {
        aria: false,
      },
    },
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

const fillDynamicAreas = (count) => {
  document.querySelector("#totalTrades").innerText = count;
  document.querySelector("#symbol").innerText = stockName;
};

const main = async () => {
  const trades = await downloadData();
  drawProfitLossChart(trades);
  drawTotalProfitOverTime(trades);
  drawTimeProfitBarChart(trades);
  fillDynamicAreas(trades.length);
};

main();
