const symbolList = require('../symbolList.json');
const https = require('node:https');
const fs = require('node:fs');
const path = require('node:path');

const DIR_PATH = './data';

const writeIntoFile = (filename, data) => {
  fs.writeFileSync(filename, data, { flag: 'a', encoding: 'utf8' });
};

const onErrorReceiveOf = (name) =>
  (error) => {
    console.error("Got error");
    console.error("Name:", name);
    console.error("Error is:", error);
  };

const onDataReceiveOf = (name) =>
  (data) => {
    writeIntoFile(`./${DIR_PATH}/${name}.csv`, data);
};

const clearPastData = () => {
  try {
    fs.readdirSync(DIR_PATH).forEach(file =>
      fs.unlinkSync(path.join(DIR_PATH, file)),
    );
  } catch (err) {
    console.log(err);
  }
};

const getUNIXTime = (date) => {
  if (date instanceof Date) {
    return Math.round(date.getTime() / 1000);
  }
  return Math.round(Date.now() / 1000);
};

const getEndPoint = (symbol) => {
  const period1 = getUNIXTime(new Date("2005-01-01"));
  const period2 = getUNIXTime();

  const hostname = `https://query1.finance.yahoo.com`;
  const url = `/v7/finance/download/${symbol}`;
  const query = `?interval=1d&period1=${period1}&period2=${period2}`;

  return hostname + url + query;
};

const downloadData = () => {
  console.log("Clearing past data...");
  clearPastData();

  console.log("Downloading data...");
  Object.keys(symbolList).forEach(categoryName => {
    const categorySymbolList = symbolList[categoryName];

    categorySymbolList.forEach(({ name, symbol }, index) => {
      https.get(getEndPoint(symbol), (res) => {
        res.on('data', onDataReceiveOf(name));
        res.on('end', () => console.log(`${name} download complete`));
      }).on('error', onErrorReceiveOf(name));
    });
  });
};

downloadData();



