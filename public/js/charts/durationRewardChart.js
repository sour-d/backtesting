const drawDurationProfitChart = (data) => {
  const chartData = {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    description: "Profit over time.",
    vconcat: [
      {
        mark: { type: "bar", tooltip: true },
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
          color: { field: "result", scale: { range: [RED, GREEN] } },
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
            encoding: {
              x: {
                field: "id",
                type: "ordinal",
                title: "Trades",
              },
              y: {
                field: "duration",
                type: "quantitative",
                title: "Duration",
              },
              color: {
                field: "result",
                scale: { range: [RED, GREEN] },
              },
              tooltip: [
                {
                  field: "duration",
                  type: "quantitative",
                  title: "Duration",
                },
              ],
            },
          },
          {
            mark: { type: "rule", tooltip: true },
            encoding: {
              y: {
                aggregate: "mean",
                field: "duration",
                type: "quantitative",
                title: "Average duration",
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
  vegaEmbed("#graph3", chartData);
};
