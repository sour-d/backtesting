const searchQueryString = location.search;
const searchQuery = new URLSearchParams(searchQueryString);
const stockName = decodeURI(searchQuery.get("name"));

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
    title: {
      text: "Profit or Loss on each trade",
      color: "blue",
    },
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    mark: {
      type: "bar",
      tooltip: true,
    },
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
    title: {
      text: "Total Profit or Loss over time",
      color: "blue",
    },
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    description: "Profit over time.",
    mark: { type: "line", point: true },
    encoding: {
      x: { field: "date", type: "ordinal", title: "Date" },
      y: {
        field: "profitOrLoss",
        type: "quantitative",
        title: "Total Profit Or Loss",
      },
      tooltip: [
        { field: "date", type: "ordinal", title: "Selling Date" },
        {
          field: "profitOrLoss",
          type: "quantitative",
          title: "Total Profit or Loss",
        },
      ],
    },
  };

  const data = [];
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

const main = async () => {
  const trades = await downloadData();
  drawProfitLossChart(trades);
  drawTotalProfitOverTime(trades);
};

main();
