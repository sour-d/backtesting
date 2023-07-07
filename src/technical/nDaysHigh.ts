import { Quote } from "../StockFeedSimulator";
import { dataOfLast } from "./utils";

const highOfLast = (quotes: Quote[], days: number): number => {
  const lastNDayQuotes: Quote[] = dataOfLast(quotes, days);
  let highestDay: number = lastNDayQuotes[lastNDayQuotes.length - 1]['High'];

  while (lastNDayQuotes.length !== 0) {
    const todaysHigh = lastNDayQuotes[lastNDayQuotes.length - 1]['High'];
    if (todaysHigh > highestDay) {
      highestDay = todaysHigh;
    }
    lastNDayQuotes.pop();
  }

  return highestDay;
};

export { highOfLast };