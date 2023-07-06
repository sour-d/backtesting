import { Quote, StockFeedSimulator } from "./StockFeedSimulator";
import { parseQuotes } from "./parser"

const removeNulls = (quotes: Quote[]) => {
  return quotes.filter(quote =>
    Object.entries(quote).every(([_ , value]) => 
      value === 'null' ? false : true))
}

const transformStockData = (filename: string) => {
  const stockData = parseQuotes(filename);
  
  const processedData = removeNulls(stockData);

  processedData.forEach((quote: Quote) => {    
     quote["Adj Close"] = +quote["Adj Close"].toFixed(2);
     quote.Close = +quote.Close.toFixed(2);
     quote.Open = +quote.Open.toFixed(2);
     quote.Low = +quote.Low.toFixed(2);
     quote.High = +quote.High.toFixed(2);
  });

  const stockFeedSimulator = new StockFeedSimulator(processedData);
  console.log(stockFeedSimulator.dataOfLast(40));
}

export { transformStockData  };