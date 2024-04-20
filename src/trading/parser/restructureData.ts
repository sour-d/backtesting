import { parseQuotes } from "./parser";
import { movingAverageOf } from "../technical/nDayMA";
import { highOfLast } from "../technical/nDaysHigh";
import { lowOfLast } from "../technical/nDaysLow";
import Papa from "papaparse";
import * as fs from "fs";
import candleStick from "../technical/candleStick";
import _ from "lodash";
import { Quote } from "../quote/IQuote";

interface TechnicalQuote extends Quote {
  FortyDayHigh: number;
  TwentyDayLow: number;
  FortyDayMA: number;
  TwoHundredDayMA: number;
  UpperWick: number;
  LowerWick: number;
  CandleBody: number;
}

const removeNulls = (quotes: Quote[]) => {
  return quotes.filter((quote) =>
    Object.entries(quote).every(([_, value]) =>
      value === "null" ? false : true
    )
  );
};

const trimToDec = (value: number) => +value.toFixed(2);

const addTechnicalData = (quotes: Quote[]): TechnicalQuote[] => {
  const technicalQuotes: TechnicalQuote[] = [];
  quotes.forEach((quote) => {
    const technicalQuote: TechnicalQuote = calculateTechnicals(
      quote,
      technicalQuotes
    );
    technicalQuotes.push(technicalQuote);
  });
  return technicalQuotes;
};

const writeTechnicalData = (filename: string, technicalData: Quote[]) => {
  const path = `./technicalData/${filename}`;
  const data = Papa.unparse(technicalData);

  fs.writeFileSync(path, data, { flag: "a", encoding: "utf8" });
};

const calculateTechnicals = (
  currentQuote: Quote,
  prevQuotes: TechnicalQuote[]
): TechnicalQuote => {
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

const transformStockData = (filename: string): TechnicalQuote[] => {
  const stockData = parseQuotes(filename);
  const processedData = removeNulls(stockData);

  processedData.forEach((quote: Quote) => {
    quote.Close = trimToDec(quote.Close);
    quote.Open = trimToDec(quote.Open);
    quote.Low = trimToDec(quote.Low);
    quote.High = trimToDec(quote.High);
  });

  const technicalQuotes = addTechnicalData(processedData);
  writeTechnicalData(filename, technicalQuotes);

  return technicalQuotes;
};

export { transformStockData, TechnicalQuote, calculateTechnicals };
