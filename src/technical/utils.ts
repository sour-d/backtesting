import { Quote } from "../StockFeedSimulator";

const dataOfLast = (quotes: Quote[], days: number): Quote[] => {
  if (quotes.length <= days) {
    return quotes.slice(0);
  }

  return quotes.slice(-days);
};

export { dataOfLast };