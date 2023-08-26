const drawTotalProfitOverTime = (data) => {
  const chartData = {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    description: "Profit over time.",
    layer: [
      { mark: { type: "line", point: true, tooltip: true } },
      {
        mark: { type: "line", point: true, tooltip: true },
        transform: [
          {
            calculate: "datum.totalProfitOrLoss > 0 ? 'Profit' : 'Loss'",
            as: "Outcome",
          },
        ],
      },
    ],
    encoding: {
      x: { field: "sellingDate", type: "ordinal", title: "Date" },
      y: {
        field: "totalProfitOrLoss",
        type: "quantitative",
        title: "Total Profit Or Loss",
        impute: { value: null },
      },
      tooltip: [
        { field: "sellingDate", type: "ordinal", title: "Selling Date" },
        {
          field: "totalProfitOrLoss",
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

  chartData.data = { values: data };
  vegaEmbed("#graph2", chartData);
};
