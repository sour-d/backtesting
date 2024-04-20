import _ from "lodash";
import { Quote } from "../quote/IQuote";

const lowOfLast = (quote: Quote, prevQuotes: Quote[], days: number): number => {
  const lastNDayQuotes: Quote[] = _.takeRight(prevQuotes, days - 1);
  const highestDay = _.maxBy(lastNDayQuotes, (q) => q.High)?.Low || 0;

  return Math.max(highestDay, quote.Low);
};

export { lowOfLast };
