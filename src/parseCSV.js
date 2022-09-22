const Papa = require('papaparse');
const fs = require('fs');

const parseCSVString = () => {
  const config = {
    delimiter: ",",	// auto-detect
    newline: "",	// auto-detect
    quoteChar: '"',
    escapeChar: '"',
    header: true,
    transformHeader: undefined,
    dynamicTyping: true,
    preview: 0,
    encoding: "",
    worker: false,
    comments: false,
    step: undefined,
    complete: undefined,
    error: undefined,
    download: false,
    downloadRequestHeaders: undefined,
    downloadRequestBody: undefined,
    skipEmptyLines: false,
    chunk: undefined,
    chunkSize: undefined,
    fastMode: undefined,
    beforeFirstChunk: undefined,
    withCredentials: undefined,
    transform: undefined,
    delimitersToGuess: [',', '\t', '|', ';', Papa.RECORD_SEP, Papa.UNIT_SEP]
  };

  const CSVString = fs.readFileSync('./data/BAJFINANCE.csv', 'utf8');

  return Papa.parse(CSVString, config);
}

const tcsData = parseCSVString().data;

// const tcsParsedData = tcsData.map((data) => {
//   data.Date = dayjs(data.Date,"YYYY-MM-DD");
//   return data;
// });

// const fortyDayData = tcsParsedData.slice(-40);

const fortyDayHigh = (fortyDayData) =>
  fortyDayData.reduce((currentHigh, data) => { 
  if (currentHigh.High < data.High) {
    return data;
  }

  return currentHigh;
  });

// const findFortyDayBreakout = (data) => {
//   for (let index = 0; index < data.length - 40; index++) {
//     const fortyDayData = data.slice(index, index + 40);
//     const lastHigh = data[index + 40];
//     const fortyDayHighValue = fortyDayHigh(fortyDayData);
//     if (lastHigh.High >= fortyDayHighValue.High) {
//       return lastHigh;
//     }
//   }
//   return data.slice(-1);
// }

const calcTwentyDaysLow = (lastTwentyDaysData) =>
  lastTwentyDaysData.reduce((currentLow, data) => {
    if (currentLow.Low > data.Low) {
      return data;
    }
  
    return currentLow;
  });


const findFortyDayBreakout = (data,from) => {
  for (let index = from; index < data.length; index++) {
    const today = data[index];
    const fortyDayData = data.slice(index - 39, index);
    const fortyDayHighValue = fortyDayHigh(fortyDayData);

    if (today.High >= fortyDayHighValue.High) {
      const low = calcTwentyDaysLow(data.slice(index - 19, index + 1));
      return {high: today, low};
    }
  }
  return data.slice(-1);
}

const oneTrade = (high, data) => {
  const highIndex = data.indexOf(high);

  for (let index = highIndex; index < data.length; index++) {
    const last20DayLow = calcTwentyDaysLow(data.slice(index - 19, index));
    const today = data[index];
    if (today.Low <= last20DayLow.Low) {
      return {sellingDay:today,stopLoss : last20DayLow.Low};
    }
  }
  return { sellingDay: data.slice(-1), stopLoss: data.slice(-1).Low };
}

const multipleTrades = (data) => {
  let trades = 20;
  let startOfNextTrade = 40;
  const expectancies = [];
  while (trades > 0 && startOfNextTrade < data.length) {
    const { high, low } = findFortyDayBreakout(data,startOfNextTrade);
    const {sellingDay,stopLoss} = oneTrade(high, data);
    const risk = high.High - low.Low;
    const profitOrLoss = stopLoss - high.High;
    const riskMultiple = profitOrLoss / risk;
    expectancies.push({riskMultiple,risk});
    startOfNextTrade = data.indexOf(sellingDay);
    trades--;
  }
  return expectancies;
}

// const { high, low } = findFortyDayBreakout(tcsData,40);
// const risk = high.High - low.Low;
// const profitOrLoss = oneTrade(high, tcsData);

// console.log("Risk ", risk);
// console.log(profitOrLoss);
// console.log("Risk Ratio : ", profitOrLoss/risk);

const expectancies = multipleTrades(tcsData.slice(-3000));
const avg = expectancies.reduce((avg, trade) => {
  avg += trade.riskMultiple;
  return avg;
}, 0);

console.log(expectancies);
console.log(avg/ expectancies.length);