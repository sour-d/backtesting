const searchQueryString = location.search;
const searchQuery = new URLSearchParams(searchQueryString);
const name = decodeURI(searchQuery.get("name"));
console.log(name);

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
      x: { field: "buyingDate", type: "ordinal" },
      y: { field: "totalProfitOrLoss", type: "quantitative" },
      tooltip: [
        { field: "buyingDate", type: "ordinal", title: "buyingDate" },
        {
          field: "totalProfitOrLoss",
          type: "quantitative",
          title: "totalProfitOrLoss",
        },
        { field: "sellingDate", type: "ordinal", title: "sellingDate" },
      ],
    },
  };

  const data = await fetch(`/result/${name}.json`)
    .then((res) => res.json())
    .then((res) => {
      return res.map(
        ({ buyingDay, totalProfitOrLoss, sellingDay }) =>
          new Object({
            buyingDate: buyingDay.Date,
            totalProfitOrLoss,
            sellingDate: sellingDay.Date,
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
    mark: {
      type: "line",
      interpolate: "step-after",
    },
    encoding: {
      x: { field: "date", type: "ordinal" },
      y: { field: "totalProfitOrLoss", type: "quantitative" },
    },
  };

  const data = [];
  await fetch(`/result/${name}.json`)
    .then((res) => res.json())
    .then((res) => {
      res.reduce((total, { buyingDay, totalProfitOrLoss }) => {
        data.push({ date: buyingDay.Date, totalProfitOrLoss: total });
        return total + totalProfitOrLoss;
      }, 0);
    });

  chartData.data = { values: data };
  vegaEmbed("#graph2", chartData);
};

drawProfitLossChart();
drawTotalProfitOverTime();
