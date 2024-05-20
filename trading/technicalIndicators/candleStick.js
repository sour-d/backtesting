const upperWick = (quote) => {
  if (quote["Open"] >= quote["Close"]) {
    return quote["High"] - quote["Open"];
  }

  return quote["High"] - quote["Close"];
};

const lowerWick = (quote) => {
  if (quote["Open"] <= quote["Close"]) {
    return quote["Open"] - quote["Low"];
  }

  return quote["Close"] - quote["Low"];
};

const body = (quote) => {
  return quote["Close"] - quote["Open"];
};

const calculateCandleProperty = (quote) => ({
  Body: body(quote),
  LowerWick: lowerWick(quote),
  UpperWick: upperWick(quote),
});

export default calculateCandleProperty;
