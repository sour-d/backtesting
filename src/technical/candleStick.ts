import { Quote } from "../QuoteManager";

const calcUpperWickValue = (quote: Quote): number => {
  if (quote["Open"] >= quote["Close"]) {
    return quote["High"] - quote["Open"];
  }

  return quote["High"] - quote["Close"];
};

const calcLowerWickValue = (quote: Quote): number => {
  if (quote["Open"] <= quote["Close"]) {
    return quote["Open"] - quote["Low"];
  }

  return quote["Close"] - quote["Low"];
};

const calcCandleBodyValue = (quote: Quote): number => {
  return quote["Close"] - quote["Open"];
};

export = { calcCandleBodyValue, calcLowerWickValue, calcUpperWickValue };
