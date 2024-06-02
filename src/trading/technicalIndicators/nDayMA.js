import _ from "lodash";

const movingAverageOf = (quote, prevMA = 0, days) => {
  let totalMovingAverage = prevMA * days - prevMA;
  if (prevMA === 0) {
    totalMovingAverage = quote["close"] * (days - 1);
  }
  return (totalMovingAverage + quote["close"]) / days;
};

export { movingAverageOf };
