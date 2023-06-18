const symbolList = require('./symbolList.json');
const https = require('node:https');
const fs = require('node:fs');
const path = require('node:path');

const DIR_PATH = './data';

const writeIntoFile = (filename, data) => {
  fs.writeFileSync(filename, data, { flag: 'a', encoding: 'utf8' });
};

const onErrorReciveOf = (name) =>
  (error) => {
    console.error("Got error");
    console.error("Name:", name);
    console.error("Error is:", error);
  };

const onDataReciveOf = (name) =>
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

const downloadData = () => {
  console.log("Clearing past data...");
  clearPastData();

  console.log("Downloading data...");
  Object.keys(symbolList).forEach(categoryName => {
    const symbolsInfo = symbolList[categoryName];
    symbolsInfo.forEach(({ name, symbol }) => {
      const url = `https://query1.finance.yahoo.com/v7/finance/download/${symbol}?interval=1d&range=max`;
      https.get(url, (res) => {
        res.on('data', onDataReciveOf(name));
      })
        .on('error', onErrorReciveOf(name));
    });
  });
  console.log("Done!");
};

downloadData();



