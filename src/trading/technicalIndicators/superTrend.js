const calculateSuperTrendForQuote = (quote, prevQuotes, multiplier) => {
  const src = (quote.high + quote.low) / 2; // hl2 equivalent
  let atr = quote.atr; // Assuming ATR is pre-calculated for the quote

  let upperBand = src + multiplier * atr;
  let lowerBand = src - multiplier * atr;

  // Initialize previous bands and superTrend from the last quote if available
  const lastQuote =
    prevQuotes.length > 0 ? prevQuotes[prevQuotes.length - 1] : null;
  const prevLowerBand = lastQuote ? lastQuote.finalLowerBand : lowerBand;
  const prevUpperBand = lastQuote ? lastQuote.finalUpperBand : upperBand;
  const prevSuperTrend = lastQuote ? lastQuote.superTrend : null;
  const prevClose = lastQuote ? lastQuote.close : quote.close;

  // lowerBand := lowerBand > prevLowerBand or close[1] < prevLowerBand ? lowerBand : prevLowerBand
  //   upperBand := upperBand < prevUpperBand or close[1] > prevUpperBand ? upperBand : prevUpperBand

  // Update bands based on conditions
  lowerBand =
    lowerBand > prevLowerBand || prevClose < prevLowerBand
      ? lowerBand
      : prevLowerBand;
  upperBand =
    upperBand < prevUpperBand || prevClose > prevUpperBand
      ? upperBand
      : prevUpperBand;

  // Determine trend direction
  let direction;
  if (!lastQuote) {
    direction = 1; // Default to 'Buy' on first calculation
  } else if (prevSuperTrend === prevUpperBand) {
    direction = quote.close > upperBand ? -1 : 1;
  } else {
    direction = quote.close < lowerBand ? 1 : -1;
  }

  // Calculate SuperTrend
  let superTrend = direction === -1 ? lowerBand : upperBand;

  // Assign calculated values to the quote
  quote.superTrend = superTrend;
  quote.finalUpperBand = upperBand;
  quote.finalLowerBand = lowerBand;
  quote.superTrendDirection = direction === -1 ? "Buy" : "Sell";
};

export default calculateSuperTrendForQuote;
