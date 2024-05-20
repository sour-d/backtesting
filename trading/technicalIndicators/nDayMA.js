import _ from "lodash";

const movingAverageOf = (quote, prevMA = 0, days) => {
  let totalMovingAverage = prevMA * days - prevMA;
  if (prevMA === 0) {
    totalMovingAverage = quote["Close"] * (days - 1);
  }
  return (totalMovingAverage + quote["Close"]) / days;
};

export { movingAverageOf };
