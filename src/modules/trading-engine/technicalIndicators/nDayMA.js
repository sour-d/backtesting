import _ from "lodash";

const movingAverageOf = (quote, prevQuotes, days, source) => {
  const keyName = `ma${days}${source}`;
  const totalMovingAverage = _.sumBy(
    prevQuotes.slice(-days),
    (quote) => quote[source]
  );
  quote[keyName] = totalMovingAverage / days;
};

export { movingAverageOf };
