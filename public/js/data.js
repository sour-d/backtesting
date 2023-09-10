const getResult = async () => {
  return await fetch(`api/result`)
    .then((response) => response.json())
    .then((response) => {
      const trades = Papa.parse(response.trades, {
        header: true,
        dynamicTyping: true,
      });
      return { report: response.report, trades: trades.data };
    });
};

const transformTradesData = (trades) => {
  const transformedData = trades.map((trade, i) => {
    const duration = dayjs(trade["Selling Date"]).diff(
      dayjs(trade["Buying Date"]),
      "day"
    );
    const profitOrLoss =
      (trade["Selling Price"] - trade["Buying Price"]) * trade["Total Stocks"];
    return {
      duration,
      profitOrLoss,
      id: i + 1,
      buyingDate: dayjs(trade["Buying Date"]).format("YYYY-MM-DD"),
      sellingDate: dayjs(trade["Selling Date"]).format("YYYY-MM-DD"),
      transactionAmount: trade["Total Stocks"] * trade["Buying Price"],
      reward: profitOrLoss / trade["Risk"],
      risk: trade["Risk"],
      result: profitOrLoss > 0 ? "Profit" : "Loss",
    };
  });

  transformedData.reduce(
    ({ totalProfitOrLoss, totalReward }, trade) => {
      trade.totalProfitOrLoss = trade.profitOrLoss + totalProfitOrLoss;
      trade.totalReward = trade.reward + totalReward;
      return {
        totalProfitOrLoss: trade.totalProfitOrLoss,
        totalReward: trade.totalReward,
      };
    },
    { totalProfitOrLoss: 0, totalReward: 0 }
  );

  addDrawDown(transformedData);

  return transformedData;
};

const addDrawDown = (tradeResults) => {
  const money = 100000;
  let highestProfitLoss = 0;

  for (let i = 0; i < tradeResults.length; i++) {
    const tradeResult = tradeResults[i];
    const totalProfitLoss = tradeResult.totalProfitOrLoss;
    const total = money + highestProfitLoss;
    let afterDrawDown = money + highestProfitLoss - Math.abs(totalProfitLoss);
    let drawDownPercentage = (afterDrawDown / total) * 100;

    if (totalProfitLoss > highestProfitLoss) {
      drawDownPercentage = 100;
      highestProfitLoss = totalProfitLoss;
    }

    tradeResult.drawDown = drawDownPercentage - 100;
  }
};