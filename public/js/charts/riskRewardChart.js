const drawRiskRewardChart = (data) => {
  const chartData = {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    description: "Profit over time.",
    vconcat: [
      {
        layer: [
          {
            mark: { type: "bar", tooltip: true },
            encoding: {
              x: {
                field: "id",
                type: "ordinal",
                title: "Trades",
              },
              y: {
                field: "reward",
                type: "quantitative",
                title: "Profit or Loss",
              },
              color: { field: "result", scale: { range: [RED, GREEN] } },
              tooltip: [
                {
                  field: "reward",
                  type: "quantitative",
                  title: "Reward",
                },
                { field: "risk", type: "quantitative", title: "Risk" },
                { field: "duration", type: "quantitative", title: "Duration" },
                {
                  field: "transactionAmount",
                  type: "quantitative",
                  title: "Transaction Amount",
                },
              ],
            },
          },
          {
            mark: { type: "rule", tooltip: true },
            encoding: {
              y: {
                aggregate: "mean",
                field: "reward",
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

  chartData.data = { values: data };
  vegaEmbed("#graph4", chartData);
};
