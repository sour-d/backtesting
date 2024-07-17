const { RestClientV5 } = require("bybit-api");

const getInstrumentInfo = async (symbol) => {
  const client = new RestClientV5({
    testnet: true,
  });

  return await client
    .getInstrumentsInfo({
      category: "linear",
      symbol,
    })
    .then((response) => {
      if (response.retMsg !== "OK") return {};

      return response.result.list[0];
    });
};

export default getInstrumentInfo;
