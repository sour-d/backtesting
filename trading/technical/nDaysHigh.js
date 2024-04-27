import _ from "lodash";

const highOfLast = (quote, prevQuotes, days) => {
  const lastNDayQuotes = _.takeRight(prevQuotes, days - 1);
  const highestDay = _.maxBy(lastNDayQuotes, (q) => q.High)?.High || 0;

  return Math.max(highestDay, quote.High);
};

export { highOfLast };
