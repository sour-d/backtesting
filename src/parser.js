const Papa = require('papaparse');
const fs = require('fs');

const CONFIG = {
  header: true,
  dynamicTyping: true,
};


const parseQuotes = (filename) => {
  const CSVString = fs.readFileSync(`./data/${filename}.csv`, 'utf8');

  let { data : quotes, errors } = Papa.parse(CSVString, CONFIG);

  quotes.forEach(quote => quote.Date = new Date(quote.Date));

  if (errors.length > 0) {
    throw new Error("Failed to parse", { cause: errors });
  }

  return quotes;
};

module.exports = { parseQuotes };
