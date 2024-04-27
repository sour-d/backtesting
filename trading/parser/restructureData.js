import { parseQuotes } from "./parser";
import { movingAverageOf } from "../technical/nDayMA";
import { highOfLast } from "../technical/nDaysHigh";
import { lowOfLast } from "../technical/nDaysLow";
import Papa from "papaparse";
import * as fs from "fs";
import candleStick from "../technical/candleStick";
import _ from "lodash";

const removeNulls = (quotes) => {
  return quotes.filter((quote) =>
    Object.entries(quote).every(([_, value]) => value !== "null")
  );
};

const trimToDec = (value) => +value.toFixed(2);

const addTechnicalData = (quotes) => {
  const technicalQuotes = [];
  quotes.forEach((quote) => {
    const technicalQuote = calculateTechnicals(quote, technicalQuotes);
    technicalQuotes.push(technicalQuote);
  });
  return technicalQuotes;
};

const writeTechnicalData = (filename, technicalData) => {
  // create folder if not there
  const path = `./technicalData/${filename}`;
  const data = Papa.unparse(technicalData);

  fs.writeFileSync(path, data, { flag: "a", encoding: "utf8" });
};

const calculateTechnicals = (currentQuote, prevQuotes) => {
  const prevQuote = _.last(prevQuotes);

  const FortyDayHigh = highOfLast(currentQuote, prevQuotes, 40);
  const TwentyDayLow = lowOfLast(currentQuote, prevQuotes, 20);
  const FortyDayMA = trimToDec(
    movingAverageOf(currentQuote, prevQuote?.FortyDayMA, 40)
  );
  const TwoHundredDayMA = trimToDec(
    movingAverageOf(currentQuote, prevQuote?.TwoHundredDayMA, 200)
  );
  const UpperWick = trimToDec(candleStick.calcUpperWickValue(currentQuote));
  const LowerWick = trimToDec(candleStick.calcLowerWickValue(currentQuote));
  const CandleBody = trimToDec(candleStick.calcCandleBodyValue(currentQuote));

  return {
    ...currentQuote,
    FortyDayHigh,
    TwentyDayLow,
    FortyDayMA,
    TwoHundredDayMA,
    UpperWick,
    LowerWick,
    CandleBody,
  };
};

const transformStockData = (filename) => {
  console.log("------>", filename);
  const stockData = parseQuotes(filename);
  const processedData = removeNulls(stockData);

  processedData.forEach((quote) => {
    quote.Close = trimToDec(quote.Close);
    quote.Open = trimToDec(quote.Open);
    quote.Low = trimToDec(quote.Low);
    quote.High = trimToDec(quote.High);
  });

  const technicalQuotes = addTechnicalData(processedData);
  writeTechnicalData(filename, technicalQuotes);

  return technicalQuotes;
};

export { transformStockData, calculateTechnicals };
