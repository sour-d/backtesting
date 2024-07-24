import dotenv from "dotenv";
import { getRestClient } from "./Client";
dotenv.config();

const restClient = getRestClient();

const testnetOrDemo = !!process.env.DEMO_TRADING || !!process.env.TESTNET;

const getBalance = async (logger) => {
  const balResponse = await restClient
    .getWalletBalance({
      accountType: testnetOrDemo ? "UNIFIED" : "CONTRACT",
      coin: "USDT",
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
