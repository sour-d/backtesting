import _ from "lodash";

const lowOfLast = (quote, prevQuotes, days) => {
  const lastNDayQuotes = _.takeRight(prevQuotes, days);
  const lowestDay = _.minBy(lastNDayQuotes, (q) => q.low)?.low || Infinity;

  return lowestDay;
};

export { lowOfLast };
