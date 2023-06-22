const searchQueryString = location.search;
const searchQuery = new URLSearchParams(searchQueryString);
const stockName = decodeURI(searchQuery.get("name"));

const drawProfitLossChart = async () => {
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
        field: "totalProfitOrLoss",
        type: "quantitative",
        title: "Profit Or Loss",
      },
      tooltip: [
        { field: "buyingDate", type: "ordinal", title: "Buying Date" },
        {
          field: "totalProfitOrLoss",
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

  const data = await fetch(`/result/${stockName}.json`)
    .then((res) => res.json())
    .then((res) => {
      return res.map(
        ({ buyingDay, totalProfitOrLoss, sellingDay, totalStocks }) =>
          new Object({
            buyingDate: dayjs(buyingDay.Date).format("YYYY-MM-DD"),
            totalProfitOrLoss,
            sellingDate: dayjs(sellingDay.Date).format("YYYY-MM-DD"),
            transactionAmount: totalStocks * buyingDay.High,
          })
      );
    });

  chartData.data = { values: data };

  vegaEmbed("#graph1", chartData);
};

const drawTotalProfitOverTime = async () => {
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
        field: "totalProfitOrLoss",
        type: "quantitative",
        title: "Total Profit Or Loss",
      },
      tooltip: [
        { field: "date", type: "ordinal", title: "Selling Date" },
        {
          field: "totalProfitOrLoss",
          type: "quantitative",
          title: "Total Profit or Loss",
        },
      ],
    },
  };

  const data = [];
  await fetch(`/result/${stockName}.json`)
    .then((res) => res.json())
    .then((res) => {
      res.reduce((total, { sellingDay, totalProfitOrLoss }) => {
        data.push({
          date: dayjs(sellingDay.Date).format("YYYY-MM-DD"),
          totalProfitOrLoss: total,
        });
        return total + totalProfitOrLoss;
      }, 0);
    });

  chartData.data = { values: data };
  vegaEmbed("#graph2", chartData);
};

drawProfitLossChart();
drawTotalProfitOverTime();
