const drawDurationProfitChart = (data) => {
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

  chartData.data = { values: data };
  vegaEmbed("#graph3", chartData);
};
