import _ from "lodash";

const movingAverageOf = (
  quote: any,
  prevMA: number = 0,
  days: number
): number => {
  const totalMovingAverage = prevMA * days - prevMA;
  return (totalMovingAverage + quote["Close"]) / days;
};

export { movingAverageOf };
