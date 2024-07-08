const upperWick = (quote) => {
  if (quote["open"] >= quote["close"]) {
    return quote["high"] - quote["open"];
  }

  return quote["high"] - quote["close"];
};

const lowerWick = (quote) => {
  if (quote["open"] <= quote["close"]) {
    return quote["open"] - quote["low"];
  }

  return quote["close"] - quote["low"];
};

const body = (quote) => {
  return quote["close"] - quote["open"];
};

const calculateCandleProperty = (quote) => ({
  body: body(quote),
  lowerWick: lowerWick(quote),
  upperWick: upperWick(quote),
});

export default calculateCandleProperty;
