import dotenv from "dotenv";
import { getRestClient } from "./client.js";

dotenv.config();

const getInstrumentInfo = async (symbol, loggerInstance) => {
  // Create a logger if not provided
  const log = loggerInstance || {
    info: console.log,
    error: console.error
  };

  const client = getRestClient();
  log.info('Fetching symbol info');

  return await client
    .getInstrumentsInfo({
      category: "linear",
      symbol,
    })
    .then((response) => {
      if (response.retMsg !== "OK") {
        log.warn('Failed to get symbol info', { symbol, response });
        return {};
      }

      return response.result.list[0];
    })
    .catch((error) => {
      log.warn('Failed to get symbol info', { symbol, error });
      return {};
    });
};

export default getInstrumentInfo;
