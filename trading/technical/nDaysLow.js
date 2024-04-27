import _ from "lodash";

const lowOfLast = (quote, prevQuotes, days) => {
  const lastNDayQuotes = _.takeRight(prevQuotes, days - 1);
  const highestDay = _.maxBy(lastNDayQuotes, (q) => q.High)?.Low || 0;

  return Math.max(highestDay, quote.Low);
};

export { lowOfLast };
