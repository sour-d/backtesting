import { Quote, StockFeedSimulator } from "./StockFeedSimulator";
import { parseQuotes } from "./parser";
import { highOfLast } from "./technical/nDaysHigh";

interface TechnicalQuote {
  Open: number;
  High: number;
  Low: number;
  Close: number;
  Date: string;
  Volume: number;
  "Adj Close": number;
  "FortyDayHigh": number;
}

const removeNulls = (quotes: Quote[]) => {
  return quotes.filter(quote =>
    Object.entries(quote).every(([_ , value]) => 
      value === 'null' ? false : true))
}

const addTechnicalData = (processedData: Quote[]) => {
  const technicalData = [];
  while (processedData.length !== 0) {
    const currentQuote = processedData[processedData.length - 1];
    const fortyDayHigh = highOfLast(processedData, 40);
    const quote: TechnicalQuote = { ...currentQuote, FortyDayHigh: fortyDayHigh };
    technicalData.push(quote);
    processedData.pop();
  }
  return technicalData;
};

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
  
  return addTechnicalData(processedData).reverse();
}

export { transformStockData  };
