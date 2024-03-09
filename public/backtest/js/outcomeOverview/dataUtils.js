const getResult = async () => {
  const type = window.location.pathname.split("/")[1];
  return await fetch(`/api/${type}/result${window.location.search}`)
    .then((res) => (res.status !== 200 ? alert("Data not found") : res))
    .then((response) => response.json())
    .then((response) => {
      const trades = Papa.parse(response.trades, {
        header: true,
        dynamicTyping: true,
      });
      return { tradeInfo: response.report, trades: trades.data };
    });
};

const calculateDuration = (buyingDate, sellingDate, timeframe) => {
  switch (timeframe) {
    case "1d":
      return dayjs(sellingDate).diff(dayjs(buyingDate), "day");
    case "1h":
      return dayjs(sellingDate).diff(dayjs(buyingDate), "hour");
    case "1m":
      return dayjs(sellingDate).diff(dayjs(buyingDate), "minute");
  }
};

const transformTradesData = (trades, timeframe) => {
  const transformedData = trades.map((trade, i) => {
    const duration = dayjs(trade["Selling Date"]).diff(
      dayjs(trade["Buying Date"]),
      "day",
    );
    const profitOrLoss =
      (trade["Selling Price"] - trade["Buying Price"]) * trade["Total Stocks"];
    return {
      duration,
      profitOrLoss,
      id: i + 1,
      buyingDate: dayjs(trade["Buying Date"]).format("DD-MM-YY  HH:mm:ss"),
      sellingDate: dayjs(trade["Selling Date"]).format("DD-MM-YY  HH:mm:ss"),
      buyingDateObj: dayjs(trade["Buying Date"]),
      sellingDateObj: dayjs(trade["Selling Date"]),
      transactionAmount: trade["Total Stocks"] * trade["Buying Price"],
      reward: profitOrLoss ? profitOrLoss / trade["Risk"] : 0,
      risk: trade["Risk"],
      result: profitOrLoss > 0 ? "Profit" : "Loss",
      quantity: trade["Total Stocks"],
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
    { totalProfitOrLoss: 0, totalReward: 0 },
  );

  addDrawDown(transformedData);

  return transformedData;
};

const addDrawDown = (tradeResults) => {
  const money = 100000;
  let highestProfitLoss = 0;

  for (let i = 0; i < tradeResults.length; i++) {
    const trade = tradeResults[i];
    const profitOrLoss = trade.profitOrLoss;
    const totalProfitLoss = trade.totalProfitOrLoss;

    if (totalProfitLoss > highestProfitLoss) {
      trade.drawDown = 0;
      highestProfitLoss = totalProfitLoss;
    } else {
      const total = money + highestProfitLoss;
      let drawDownFromPeak = total - Math.abs(profitOrLoss);
      let drawDownPercentage = (drawDownFromPeak / total) * 100;
      trade.drawDown = drawDownPercentage - 100;
    }
  }
};
