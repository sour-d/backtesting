import * as Papa from "papaparse";
import * as fs from "fs";

const CONFIG: Papa.ParseConfig = {
  header: true,
  dynamicTyping: true,
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
