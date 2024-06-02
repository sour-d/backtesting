import Client from "./Client.js";

const getBalance = async () => {
  const balResponse = await Client.getClient()
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
  };

  balResponse.result.list[0].coin.forEach((coin) => {
    balance[coin.coin] = coin;
  });

  return balance;
};

export default getBalance;
