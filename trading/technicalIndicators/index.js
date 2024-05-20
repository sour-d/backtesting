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
  const { FortyDayMA, TwoHundredDayMA } = _.last(technicalQuotes)
    ?.indictors || { FortyDayMA: 0, TwoHundredDayMA: 0 };

  const indictors = {
    FortyDayHigh: highOfLast(quote, technicalQuotes, 40),
    TwentyDayLow: lowOfLast(quote, technicalQuotes, 20),
    FortyDayMA: movingAverageOf(quote, FortyDayMA, 40),
    TwoHundredDayMA: movingAverageOf(quote, TwoHundredDayMA, 200),
    ...calculateCandleProperty(quote),
  };

  return { ...quote, ...fixTwoDecimal(indictors) };
};

export default Indicators;
