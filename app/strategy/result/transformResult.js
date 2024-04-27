import dayjs from "dayjs";
import _ from "lodash";

// const getResult = async () => {
//   const type = window.location.pathname.split("/")[1];
//   return await fetch(`/api/${type}/result${window.location.search}`)
//     .then((res) => (res.status !== 200 ? alert("Data not found") : res))
//     .then((response) => response.json())
//     .then((response) => {
//       const trades = Papa.parse(response.trades, {
//         header: true,
//         dynamicTyping: true,
//       });
//       return { tradeInfo: response.report, trades: trades.data };
//     });
// };

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

const aggregateLog = (trades) => {
  const result = [];

  trades.forEach((trade) => {
    if (trade["Transaction Type"] === "buy") {
      result.push({
        buyingDate: trade["Transaction Date"],
        buyingPrice: trade["Price"],
        quantity: trade["Quantity"],
        risk: trade["Risk"],
      });
    }
    if (trade["Transaction Type"] === "sell") {
      result.push({
        sellingDate: trade["Transaction Date"],
        sellingPrice: trade["Price"],
        quantity: trade["Quantity"],
        risk: trade["Risk"],
      });
    }

    if (trade["Transaction Type"] === "square-off") {
      const lastTrade = _.last(result);

      if (lastTrade.buyingDate && lastTrade.buyingPrice) {
        lastTrade.sellingDate = trade["Transaction Date"];
        lastTrade.sellingPrice = trade["Price"];
        lastTrade.stockLeft = lastTrade.quantity - trade["Quantity"];
        return;
      }

      if (lastTrade.sellingDate && lastTrade.sellingPrice) {
        lastTrade.buyingDate = trade["Transaction Date"];
        lastTrade.buyingPrice = trade["Price"];
        lastTrade.stockLeft = lastTrade.totalStocks - trade["Quantity"];
        return;
      }
    }
  });

  return result;
};

export const transformTradesData = (trades, timeFrame) => {
  const aggregatedLog = aggregateLog(trades);
  const transformedData = aggregatedLog.map((trade, i) => {
    const duration = calculateDuration(
      trade.sellingDate,
      trade.buyingDate,
      timeFrame
    );
    const profitOrLoss =
      (trade.sellingPrice - trade.buyingPrice) * trade.quantity;
    return {
      duration,
      profitOrLoss,
      id: i + 1,
      buyingDate: dayjs(trade.buyingDate).format("DD-MM-YY  HH:mm:ss"),
      sellingDate: dayjs(trade.sellingDate).format("DD-MM-YY  HH:mm:ss"),
      buyingDateObj: dayjs(trade.buyingDate),
      sellingDateObj: dayjs(trade.sellingDate),
      transactionAmount: trade.quantity * trade.buyingPrice,
      reward: profitOrLoss ? profitOrLoss / trade.risk : 0,
      risk: trade.risk,
      result: profitOrLoss > 0 ? "Profit" : "Loss",
      quantity: trade.quantity,
    };
  });

  transformedData.reduce(
    (
      { totalProfitOrLoss, totalReward, currentCapital, highestCapital },
      trade
    ) => {
      trade.totalProfitOrLoss = trade.profitOrLoss + totalProfitOrLoss;
      trade.totalReward = trade.reward + totalReward;
      trade.currentCapital = currentCapital + trade.profitOrLoss;
      trade.highestCapital = Math.max(highestCapital, trade.currentCapital);

      return trade;
    },
    {
      totalProfitOrLoss: 0,
      totalReward: 0,
      currentCapital: 100000,
      highestCapital: 100000,
    }
  );

  addDrawDown(transformedData);

  return transformedData;
};

const addDrawDown = (tradeResults) => {
  for (let i = 0; i < tradeResults.length; i++) {
    const trade = tradeResults[i];
    const currentCapital = trade.currentCapital;
    const highestCapital = trade.highestCapital;

    let drawDownPercentage =
      ((highestCapital - currentCapital) / highestCapital) * 100;
    trade.drawDown = -1 * drawDownPercentage;
  }
};
