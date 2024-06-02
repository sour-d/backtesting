import { RestClientV5 } from "bybit-api";
import dotenv from "dotenv";
dotenv.config();

const restClient = new RestClientV5({
  key: process.env.TESTNET_API_KEY,
  secret: process.env.TESTNET_API_SECRET,
  parseAPIRateLimits: true,
  testnet: true,
  // demoTrading: true,
});

const getBalance = async () => {
  const balResponse = await restClient
    .getWalletBalance({
      accountType: "UNIFIED",
    })
    .catch((e) => {
      return {
        success: false,
        error: e,
      };
    });
  const balance = {
    success: true,
    total: balResponse.result.list[0].totalEquity,
    accountType: balResponse.result.list[0].accountType,
    coins: {},
  };

  balResponse.result.list[0].coin.forEach((coin) => {
    balance.coins[coin.coin] = coin;
  });

  return balance;
};

export default getBalance;
