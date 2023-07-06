import * as Papa from "papaparse";
import * as fs from "fs";
import { Quote } from "./StockFeedSimulator";

const CONFIG: Papa.ParseConfig = {
  header: true,
  dynamicTyping: true,
};

const parseQuotes = (filename: string): Quote[] => {
  const CSVString = fs.readFileSync(`./data/${filename}.csv`, "utf8");

  let { data: quotes, errors } = Papa.parse(CSVString, CONFIG);

  // quotes.forEach((quote: Stock) => quote.Date = new Date(quote.Date));

  if (errors.length > 0) {
    throw new Error("Failed to parse: " + { cause: errors });
  }

  return quotes;
};

export { parseQuotes };
