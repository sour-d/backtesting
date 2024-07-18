import _ from "lodash";

const calculateTR = (quote, lastQuote) => {
  if (!lastQuote) return quote.high - quote.low;

  let previousClose = lastQuote.close;
  let highLow = quote.high - quote.low;
  let highClose = Math.abs(quote.high - previousClose);
  let lowClose = Math.abs(quote.low - previousClose);

  return Math.max(highLow, highClose, lowClose);
};

export default function calculateATR(quote, prevQuotes, range) {
  const lastQuote = _.last(prevQuotes);
  quote.trValue = calculateTR(quote, lastQuote);

  const trValues = _.slice(prevQuotes, -range + 1).map(
    (quote) => quote.trValue
  );
  const k = 2 / (range + 1);
  const lastAtr = _.last(prevQuotes)?.atr ?? 0;
  // const atr = (_.sum(trValues) + quote.trValue) / range;
  const atr = quote.trValue * k + lastAtr * (1 - k);
  quote.atr = atr;
}
