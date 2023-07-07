import { Quote } from "../StockFeedSimulator";
import { dataOfLast } from "./utils";

const movingAverageOf = (quotes: Quote[], days: number): number => {
  const lastNDayQuotes: Quote[] = dataOfLast(quotes, days);
  let sumOfDayCloses: number = 0;

   while (lastNDayQuotes.length !== 0) {
    const todaysClose = lastNDayQuotes[lastNDayQuotes.length - 1]['Close'];
    sumOfDayCloses += todaysClose;
    lastNDayQuotes.pop();
  }

  return sumOfDayCloses / days;
};

export { movingAverageOf };