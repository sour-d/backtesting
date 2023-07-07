const symbolList = require('../symbolList.json');
const axios = require('axios');
const fs = require('node:fs');
const path = require('node:path');
const DIR_PATH = './data';

const writeIntoFile = (filename, data) => {
  fs.writeFileSync(filename, data, { flag: 'a', encoding: 'utf8' });
};

const onReceivingError = (name) =>
  (error) => {
    console.error("Got error");
    console.error("Name:", name);
    console.error("Error is:", error);
  };

const onReceivingData = (res, name, isHeaderNeeded) => {
  let data = res.data;
  if (!isHeaderNeeded) {
    data = '\n' + res.data.split('\n').slice(2).join('\n');
  }

  writeIntoFile(`./${DIR_PATH}/${name}.csv`, data);
};

const getUNIXTime = (date) => {
  if (date instanceof Date) {
    return Math.round(date.getTime() / 1000);
  }
  return Math.round(Date.now() / 1000);
};

const getDateAndHeaderInfo = (name) => {
  let data;

  try {
    data = fs.readFileSync(`./${DIR_PATH}/${name}.csv`, { encoding: "utf-8" });
  } catch (error) {
    return { date: "2005-01-01", isHeaderNeeded: true };
  }

  const lastDate = data.split('\n').slice(-1)[0].slice(0, 10);
  return { date: lastDate, isHeaderNeeded: false };
};

const downloadData = () => {
  const url = 'https://query1.finance.yahoo.com/v7/finance/download/';
  const period2 = getUNIXTime();

  console.log("Downloading data...");
  Object.keys(symbolList).forEach(categoryName => {
    const categorySymbolList = symbolList[categoryName];

    categorySymbolList.forEach(({ name, symbol }, index) => {
      const { date, isHeaderNeeded } = getDateAndHeaderInfo(name);
      const period1 = getUNIXTime(new Date(date));

      axios.get(`${url}${symbol}`, {
        params: {
          interval: "1d",
          period1: period1,
          period2: period2
        }
      })
        .then(res => onReceivingData(res, name, isHeaderNeeded))
        .catch(res => onReceivingError(name))
        .finally(res => console.log(`${name} download complete`));
    });
  });
};

downloadData();
