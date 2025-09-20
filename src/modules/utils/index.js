export const prepareResponse = (message, error, rest) => {
  return {
    success: !error,
    message,
    ...rest,
  };
};

export const logFileName = (symbol, timeFrame, strategyName) => {
  return `${symbol}_${timeFrame}_${strategyName}`;
};

export const logFilePath = (symbol, timeFrame, strategyName) => {
  return `.log/${logFileName(symbol, timeFrame, strategyName)}.txt`;
};
