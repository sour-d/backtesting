import * as Papa from "papaparse";
import * as fs from "fs";

const CONFIG: Papa.ParseConfig = {
  delimiter: ",", // auto-detect
  newline: "\n", // auto-detect
  quoteChar: '"',
  escapeChar: '"',
  header: true,
  transformHeader: undefined,
  dynamicTyping: true,
  preview: 0,
  comments: false,
  step: undefined,
  complete: undefined,
  skipEmptyLines: false,
  fastMode: undefined,
  beforeFirstChunk: undefined,
  transform: undefined,
  delimitersToGuess: [",", "\t", "|", ";", Papa.RECORD_SEP, Papa.UNIT_SEP],
};

interface Stock {
  Date: Date;
}

const parse = (filename: string): Stock[] => {
  const CSVString = fs.readFileSync(`./data/${filename}.csv`, "utf8");

  let { data, errors } = Papa.parse(CSVString, CONFIG);

  data = data.map((stock: Stock) => {
    stock.Date = new Date(stock.Date);
    return stock;
  });

  if (errors.length > 0) {
    throw new Error("Failed to parse: " + { cause: errors });
  }

  return data;
};

export { parse };
