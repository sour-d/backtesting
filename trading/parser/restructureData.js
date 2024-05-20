import { parseQuotes } from "./parser.js";
import Papa from "papaparse";
import * as fs from "fs";
import _ from "lodash";
import getIndicator from "../technicalIndicators/index.js";

const removeNulls = (quotes) => {
  return quotes.filter((quote) =>
    Object.entries(quote).every(([_, value]) => value !== "null")
  );
};

const trimToTwoDecimal = (value) => +value.toFixed(2);

const writeTechnicalData = (filename, technicalData) => {
  const path = `./.output/dataWithTechnicalIndicators/${filename}`;
  const data = Papa.unparse(technicalData);

  fs.writeFileSync(path, data, { flag: "a", encoding: "utf8" });
};

const addTechnicalIndicator = (quotes, startFrom = 0) => {
  const technicalQuotes = quotes.slice(0, startFrom);
  for (let i = startFrom; i < quotes.length; i++) {
    const quote = quotes[i];
    const indicator = getIndicator(quote, technicalQuotes);
    technicalQuotes.push(indicator);
  }
  return technicalQuotes;
};

const transformStockData = (filename) => {
  const stockData = parseQuotes(filename);
  const processedData = removeNulls(stockData);

  processedData.forEach((quote) => {
    quote.Close = trimToTwoDecimal(quote.Close);
    quote.Open = trimToTwoDecimal(quote.Open);
    quote.Low = trimToTwoDecimal(quote.Low);
    quote.High = trimToTwoDecimal(quote.High);
  });

  const technicalQuotes = addTechnicalIndicator(processedData);
  writeTechnicalData(filename, technicalQuotes);

  return technicalQuotes;
};

export { transformStockData, addTechnicalIndicator };
