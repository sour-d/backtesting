import _ from "lodash";
import { movingAverageOf } from "./nDayMA.js";
import calculateCandleProperty from "./candleStick.js";
import calculateATR from "./atr.js";
import calculateSuperTrendForQuote from "./superTrend.js";

const fixTwoDecimal = (obj) => {
  const result = {};
  Object.entries(obj).forEach(([key, value]) => {
    result[key] = +value.toFixed(2);
  });
  return result;
};

const Indicators = (quote, technicalQuotes) => {
  calculateCandleProperty(quote);

  // Channel indicators (for MovingAverage strategies)
  movingAverageOf(quote, technicalQuotes, 20, "high");   // ma20high
  movingAverageOf(quote, technicalQuotes, 20, "low");    // ma20low
  movingAverageOf(quote, technicalQuotes, 20, "close");  // ma20close (for Upgraded)
  movingAverageOf(quote, technicalQuotes, 50, "high");   // ma50high (for v2)
  movingAverageOf(quote, technicalQuotes, 50, "low");    // ma50low (for v2)
  movingAverageOf(quote, technicalQuotes, 200, "close"); // ma200close (for v2 trend filter)

  calculateATR(quote, technicalQuotes, 10);
  calculateSuperTrendForQuote(quote, technicalQuotes, 2);
  return quote;
};

export default Indicators;
