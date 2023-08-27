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

  transformedData.unshift({ sellingDate: "0000-00-00", totalProfitOrLoss: 0 });

  return transformedData;
};
