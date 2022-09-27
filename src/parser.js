const Papa = require('papaparse');
const fs = require('fs');

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

  const parsedData = Papa.parse(CSVString, CONFIG);

  if (parsedData.errors.length > 0) {
    throw new Error("Failed to parse", { cause: parsedData.errors });
  }

  return parsedData;
};

module.exports = { parse };
