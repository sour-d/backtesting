export const camelCaseToStr = (camelCase) => {
  const str = camelCase
    .replace(/([A-Z])/g, " $1")
    .toLowerCase()
    .trim();
  return str[0].toUpperCase() + str.slice(1);
};

export const trimToDec = (value) => +value.toFixed(2);
