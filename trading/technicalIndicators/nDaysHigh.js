import _ from "lodash";

const highOfLast = (quote, prevQuotes, days) => {
  const lastNDayQuotes = _.takeRight(prevQuotes, days);
  const highestDay = _.maxBy(lastNDayQuotes, (q) => q.high)?.high || 0;

  return highestDay;
};

export { highOfLast };
