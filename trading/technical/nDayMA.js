import _ from "lodash";

const movingAverageOf = (quote, prevMA = 0, days) => {
  const totalMovingAverage = prevMA * days - prevMA;
  return (totalMovingAverage + quote["Close"]) / days;
};

export { movingAverageOf };
