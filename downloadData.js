const symbolList = require("./symbolList.json");
const { parseQuotes } = require("./build/parser");
const axios = require("axios");
const fs = require("node:fs");
const DIR_PATH = "./data";

const writeIntoFile = (filename, data) => {
  fs.writeFileSync(filename, data, { encoding: "utf8" });
};

const onReceivingError = (name) => (error) => {
  console.error("Got error");
  console.error("Name:", name);
  console.error("Error is:", error);
};

const onReceivingData = (res, name) => {
  let data = res.data;
  writeIntoFile(`./${DIR_PATH}/${name}.csv`, data);
};

const getUNIXTime = (date) => {
  if (date instanceof Date) {
    return Math.round(date.getTime() / 1000);
  }
  return Math.round(Date.now() / 1000);
};

const shouldDownloadData = (filename) => {
  let data;

  try {
    console.log("filename", filename);
    data = parseQuotes(filename);
  } catch (error) {
    return true;
  }

  const startDate = parseQuotes(data)[0].Date;
  const lastDate = parseQuotes(data)[-1].Date;
  if (startDate != from || lastDate != to) {
    return true;
  }
};

const downloadData = () => {
  const url = "https://query1.finance.yahoo.com/v7/finance/download/";

  console.log("Downloading data...");
  Object.keys(symbolList).forEach((categoryName) => {
    const categorySymbolList = symbolList[categoryName];

    categorySymbolList.forEach(
      ({
        name,
        symbol,
        timeFrame = "1d",
        from = "2005-01-01",
        to = "2023-06-01",
      }) => {
        const filename = `${name}_${timeFrame}_${from}_${to}`;
        const period1 = getUNIXTime(new Date(from));
        const period2 = getUNIXTime(new Date(to));

        if (!shouldDownloadData(filename)) return;

        axios
          .get(`${url}${symbol}`, {
            params: {
              interval: timeFrame,
              period1,
              period2,
              includeAdjustedClose: false,
            },
          })
          .then((res) => onReceivingData(res, filename))
          .catch(onReceivingError(name))
          .finally((_) => console.log(`${name} download complete`));
      },
    );
  });
};

downloadData();
