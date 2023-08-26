const drawProfitLossChart = (data) => {
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

  chartData.data = { values: data };
  vegaEmbed("#graph1", chartData);
};
