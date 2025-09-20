import { RestClientV5, WebsocketClient } from "bybit-api";
import dotenv from "dotenv";

dotenv.config();

const testnet = process.env.TESTNET === "true";
const demoTrading = process.env.DEMO_TRADING === "true";
const key = testnet ? process.env.TESTNET_API_KEY : process.env.API_KEY;
const secret = testnet
  ? process.env.TESTNET_API_SECRET
  : process.env.API_SECRET;

const getRestClient = () => {
  return new RestClientV5({
    market: "v5",
    key,
    secret,
    testnet,
    demoTrading,
  });
};

const websocketClient = () => {
  return new WebsocketClient({
    market: "v5",
    // key,
    // secret,
    testnet,
    // demoTrading,
  });
};
export { websocketClient, getRestClient };
