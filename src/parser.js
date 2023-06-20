const Papa = require('papaparse');
const fs = require('fs');
const dayjs = require('dayjs');

const CONFIG = {
  delimiter: ",",	// auto-detect
  newline: "",	// auto-detect
  quoteChar: '"',
  escapeChar: '"',
  header: true,
  transformHeader: undefined,
  dynamicTyping: true,
  preview: 0,
  encoding: "",
  worker: false,
  comments: false,
  step: undefined,
  complete: undefined,
  error: undefined,
  download: false,
  downloadRequestHeaders: undefined,
  downloadRequestBody: undefined,
  skipEmptyLines: false,
  chunk: undefined,
  chunkSize: undefined,
  fastMode: undefined,
  beforeFirstChunk: undefined,
  withCredentials: undefined,
  transform: undefined,
  delimitersToGuess: [',', '\t', '|', ';', Papa.RECORD_SEP, Papa.UNIT_SEP]
};


const parse = (filename) => {
  const CSVString = fs.readFileSync(`./data/${filename}.csv`, 'utf8');

  let { data, errors } = Papa.parse(CSVString, CONFIG);

  data = data.map(stock => {
    stock.Date = new Date(stock.Date);
    return stock;
  });

  if (errors.length > 0) {
    throw new Error("Failed to parse", { cause: errors });
  }

  return data;
};

module.exports = { parse };
