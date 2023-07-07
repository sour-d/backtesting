import { Quote } from "../StockFeedSimulator";
import { dataOfLast } from "./utils";

const lowOfLast = (quotes: Quote[], days: number): number => {
  const lastNDayQuotes: Quote[] = dataOfLast(quotes, days);
  
  let lowestDay: number = lastNDayQuotes[lastNDayQuotes.length - 1]['Low'];

  while (lastNDayQuotes.length !== 0) {
    const todaysLow = lastNDayQuotes[lastNDayQuotes.length - 1]['Low'];
    if (todaysLow < lowestDay) {
      lowestDay = todaysLow;
    }
    lastNDayQuotes.pop();
  }

  return lowestDay;
};

export { lowOfLast };
