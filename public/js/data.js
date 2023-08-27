const getTrades = async () => {
  const response = await fetch(`api/result/Nifty`);
  const rawTrades = await response.text();
  const trades = Papa.parse(rawTrades, {
    header: true,
    dynamicTyping: true,
  });
  return trades.data;
};

const transformData = (trades) => {
  const transformedData = trades.map((trade, i) => {
    const timeDiff = dayjs(trade["Selling Date"]).diff(
      dayjs(trade["Buying Date"]),
      "day"
    );
    const profitOrLoss =
      (trade["Selling Price"] - trade["Buying Price"]) * trade["Total Stocks"];
    return {
      time: timeDiff,
      profitOrLoss,
      id: i + 1,
      buyingDate: dayjs(trade["Buying Date"]).format("YYYY-MM-DD"),
      sellingDate: dayjs(trade["Selling Date"]).format("YYYY-MM-DD"),
      transactionAmount: trade["Total Stocks"] * trade["Buying Price"],
    };
  });

  transformedData.reduce((totalProfitOrLoss, trade) => {
    trade.totalProfitOrLoss = trade.profitOrLoss + totalProfitOrLoss;
    return trade.totalProfitOrLoss;
  }, 0);

  transformedData.unshift();
  return transformedData;
};
