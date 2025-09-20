import * as Papa from "papaparse";
import * as fs from "fs";

const CONFIG = {
  header: true,
  dynamicTyping: true,
};

const parseQuotes = (filename) => {
  const CSVString = fs.readFileSync(`./data/${filename}.csv`, "utf8");

  let { data: quotes, errors } = Papa.parse(CSVString, CONFIG);

  // quotes.forEach((quote: Stock) => quote.Date = new Date(quote.Date));

  if (errors.length > 0) {
    throw new Error("Failed to parse: " + errors[0].message);
  }

  return quotes;
};

export { parseQuotes };
