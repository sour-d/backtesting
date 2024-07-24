import dotenv from "dotenv";
import { getRestClient } from "./Client";

dotenv.config();

const getInstrumentInfo = async (symbol) => {
  const client = getRestClient();

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
