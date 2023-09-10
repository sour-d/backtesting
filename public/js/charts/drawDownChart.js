const drawDrawDownChart = (data) => {
  const chartData = {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    description: "Profit over time.",
    layer: [
      {
        mark: {
          type: "area",
          point: true,
          tooltip: true,
          line: { color: RED },
          point: { color: "red" },
          color: {
            x1: 1,
            y1: 1,
            x2: 1,
            y2: 0,
            gradient: "linear",
            stops: [
              {
                offset: 1,
                color: "white",
              },
              {
                offset: 0,
                color: RED,
              },
            ],
          },
        },
        transform: [
          {
            calculate: "datum.totalProfitOrLoss > 0 ? 'Profit' : 'Loss'",
            as: "Outcome",
          },
        ],
        encoding: {
          x: {
            field: "id",
            type: "ordinal",
            title: "id",
            axis: { orient: "top" },
          },
          y: {
            field: "drawDown",
            type: "quantitative",
            title: "Draw Down",
            axis: { orient: "left" },
          },
          tooltip: [
            { field: "drawDown", type: "quantitative", title: "Draw Down" },
          ],
        },
      },
      {
        mark: {
          type: "bar",
          tooltip: true,
          color: "#ff00003b",
        },
        transform: [{ filter: "datum.profitOrLoss < 0" }],
        encoding: {
          x: {
            field: "id",
            type: "ordinal",
            title: "id",
            scale: {
              paddingInner: 0.2,
            },
          },
          y: {
            field: "profitOrLoss",
            type: "quantitative",
            title: "Profit/Loss",
            axis: { orient: "right" },
          },
        },
      },
    ],
    height: 300,
    resolve: { scale: { y: "independent" } },
  };

  chartData.data = { values: data };
  vegaEmbed("#graph6", chartData);
};
