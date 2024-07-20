import { RestClientV5 } from "bybit-api";
import dotenv from "dotenv";
dotenv.config();

const testnet = process.env.USE_TESTNET === "true";

const restClient = new RestClientV5({
  key: testnet ? process.env.TESTNET_API_KEY : process.env.API_KEY,
  secret: testnet ? process.env.TESTNET_API_SECRET : process.env.API_SECRET,
  // parseAPIRateLimits: true,
  testnet: testnet,
  // demoTrading: true,
});

const getBalance = async (logger) => {
  const balResponse = await restClient
    .getWalletBalance({
      accountType: "CONTRACT",
    })
    .catch((e) => {
      return {
        success: false,
        error: e,
      };
    });

  const balance = {
    success: true,
    accountType: balResponse.result.list[0].accountType,
  };

  balResponse.result.list[0].coin.forEach((coin) => {
    balance.bal = {
      available: coin.availableToWithdraw,
      total: coin.equity,
    };
  });

  return balance;
};

export default getBalance;
// console.log(JSON.stringify(await getBalance(), null, 2));
