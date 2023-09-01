const drawAccumulatedRewardChart = (data) => {
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
      x: { field: "id", type: "ordinal", title: "id" },
      y: {
        field: "totalReward",
        type: "quantitative",
        title: "Total Profit Or Loss",
        impute: { value: null },
      },
      tooltip: [
        { field: "totalReward", type: "ordinal", title: "Total Reward" },
      ],
      color: {
        field: "Outcome",
        scale: { range: [GREEN, RED, GREEN] },
      },
    },
  };

  chartData.data = { values: data };
  vegaEmbed("#graph5", chartData);
};
