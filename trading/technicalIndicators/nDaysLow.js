import _ from "lodash";

const lowOfLast = (quote, prevQuotes, days) => {
  const lastNDayQuotes = _.takeRight(prevQuotes, days - 1);
  const highestDay = _.minBy(lastNDayQuotes, (q) => q.Low)?.Low || Infinity;

  return Math.min(highestDay, quote.Low);
};

export { lowOfLast };
