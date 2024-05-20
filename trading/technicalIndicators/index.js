import _ from "lodash";
import { highOfLast } from "./nDaysHigh.js";
import { lowOfLast } from "./nDaysLow.js";
import { movingAverageOf } from "./nDayMA.js";
import calculateCandleProperty from "./candleStick.js";

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

  return { ...quote, indictors };
};

export default Indicators;
