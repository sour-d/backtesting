const symbolList = require("../symbolList.json");

export const getProps = (obj: any) => {
  return {
    keys: Object.keys(obj),
    defaultValue: Object.values(obj),
  };
};

export const getFileName = (stockName: string): string => {
  let fileName = "";
  Object.keys(symbolList).forEach((category: string) => {
    symbolList[category].forEach(
      ({
        name,
        timeFrame = "1d",
        from = "2005-01-01",
        to = "2023-06-01",
      }: any) => {
        if (name == stockName) {
          fileName = `${name}_${timeFrame}_${from}_${to}`;
          return true;
        }
      }
    );
  });
  return fileName;
};
