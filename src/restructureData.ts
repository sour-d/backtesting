import { Quote } from "./StockFeedSimulator";
import { parseQuotes } from "./parser";
import { movingAverageOf } from "./technical/nDayMA";
import { highOfLast } from "./technical/nDaysHigh";
import { lowOfLast } from "./technical/nDaysLow";
import Papa from "papaparse";
import * as fs from "fs";

interface TechnicalQuote {
  Open: number;
  High: number;
  Low: number;
  Close: number;
  Date: string;
  Volume: number;
  "Adj Close": number;
  "FortyDayHigh": number;
  "TwentyDayLow": number;
  "FortyDayMA": number;
  "TwoHundredDayMA": number;
}

const removeNulls = (quotes: Quote[]) => {
  return quotes.filter(quote =>
    Object.entries(quote).every(([_ , value]) => 
      value === 'null' ? false : true))
}

const trimToDec = (value: number) => +value.toFixed(2);

const addTechnicalData = (processedData: Quote[]) => {
  const technicalData = [];

  while (processedData.length !== 0) {
    const currentQuote = processedData[processedData.length - 1];
    const technicalFields = calculateTechnicals(processedData);
    
    const quote: TechnicalQuote = {...currentQuote, ...technicalFields
    };

    technicalData.push(quote);
    processedData.pop();
  }
  
  return technicalData;
};

const writeTechnicalData = (filename: string, technicalData: Quote[]) => {
  const path = `./technicalData/${filename}`;
  const data = Papa.unparse(technicalData);

  fs.writeFileSync(path, data, { flag: 'a', encoding: 'utf8' });
}

const calculateTechnicals = (processedData: Quote[]) => {
  const FortyDayHigh = highOfLast(processedData, 40);
  const TwentyDayLow = lowOfLast(processedData, 20);
  const FortyDayMA = trimToDec(movingAverageOf(processedData, 40));
  const TwoHundredDayMA = trimToDec(movingAverageOf(processedData, 200));
  return { FortyDayHigh, TwentyDayLow, FortyDayMA, TwoHundredDayMA };
}

const transformStockData = (filename: string) => {
  const stockData = parseQuotes(filename);
  const processedData = removeNulls(stockData);
  
  processedData.forEach((quote: Quote) => {    
    quote["Adj Close"] = trimToDec(quote["Adj Close"]);
    quote.Close = trimToDec(quote.Close);
    quote.Open = trimToDec(quote.Open);
    quote.Low = trimToDec(quote.Low);
    quote.High = trimToDec(quote.High);
  });
  
  const technicalData = addTechnicalData(processedData).reverse();
  writeTechnicalData(filename, technicalData);

  return technicalData;
}

export { transformStockData  };