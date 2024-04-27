const calcUpperWickValue = (quote) => {
  if (quote["Open"] >= quote["Close"]) {
    return quote["High"] - quote["Open"];
  }

  return quote["High"] - quote["Close"];
};

const calcLowerWickValue = (quote) => {
  if (quote["Open"] <= quote["Close"]) {
    return quote["Open"] - quote["Low"];
  }

  return quote["Close"] - quote["Low"];
};

const calcCandleBodyValue = (quote) => {
  return quote["Close"] - quote["Open"];
};

export default { calcCandleBodyValue, calcLowerWickValue, calcUpperWickValue };
