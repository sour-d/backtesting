export const prepareResponse = (message, error, rest) => {
  return {
    success: !error,
    message,
    ...rest,
  };
};
