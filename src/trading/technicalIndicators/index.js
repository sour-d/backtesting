import _ from "lodash";
import { highOfLast } from "./nDaysHigh.js";
import { lowOfLast } from "./nDaysLow.js";
import { movingAverageOf } from "./nDayMA.js";
import calculateCandleProperty from "./candleStick.js";

const fixTwoDecimal = (obj) => {
  const result = {};
  Object.entries(obj).forEach(([key, value]) => {
    result[key] = +value.toFixed(2);
  });
  return result;
};

const Indicators = (quote, technicalQuotes) => {
  calculateCandleProperty(quote);

  movingAverageOf(quote, technicalQuotes, 20, "high");
  movingAverageOf(quote, technicalQuotes, 20, "low");
  movingAverageOf(quote, technicalQuotes, 60, "close");

  calculateATR(quote, technicalQuotes, 10);
  calculateSuperTrendForQuote(quote, technicalQuotes, 2);
  return quote;
};

export default Indicators;
