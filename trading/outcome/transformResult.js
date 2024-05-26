import dayjs from "dayjs";
import _ from "lodash";

const calculateDuration = (buyingDate, sellingDate, timeframe) => {
  switch (timeframe) {
    case "1d":
      return dayjs(buyingDate).diff(dayjs(sellingDate), "day");
    case "60":
      return dayjs(buyingDate).diff(dayjs(sellingDate), "hour");
    case "1":
      return dayjs(buyingDate).diff(dayjs(sellingDate), "minute");
  }
};

const trimToTwoDecimal = (value) => {
  if (typeof value === "string" || typeof value === "object") return value;
  return +value.toFixed(2);
};

const aggregateLog = (trades) => {
  const result = [];

  trades.forEach((trade) => {
    if (trade.transactionType === "buy") {
      if (trade.risk === 0) return;
      result.push({
        buyingDate: trade.transactionDate,
        buyingPrice: trade.price,
        quantity: trade.quantity,
        risk: trade.risk,
      });
    }
    if (trade.transactionType === "sell") {
      if (trade.risk === 0) return;
      result.push({
        sellingDate: trade.transactionDate,
        sellingPrice: trade.price,
        quantity: trade.quantity,
        risk: trade.Risk,
      });
    }

    if (trade.transactionType === "square-off") {
      const lastTrade = _.last(result);

      if (lastTrade.buyingDate && lastTrade.buyingPrice) {
        lastTrade.sellingDate = trade.transactionDate;
        lastTrade.sellingPrice = trade.price;
        lastTrade.stockLeft = lastTrade.quantity - trade.quantity;
        return;
      }

      if (lastTrade.sellingDate && lastTrade.sellingPrice) {
        lastTrade.buyingDate = trade.transactionDate;
        lastTrade.buyingPrice = trade.price;
        lastTrade.stockLeft = lastTrade.totalStocks - trade.quantity;
        return;
      }
    }
  });

  return _.last(result).sellingDate ? result : result.slice(0, -1);
};

export const transformTradesData = (trades, timeFrame) => {
  const aggregatedLog = aggregateLog(trades);
  const transformedData = aggregatedLog.map((trade, i) => {
    const duration = calculateDuration(
      trade.sellingDate.DateUnix,
      trade.buyingDate.DateUnix,
      timeFrame
    );
    const profitOrLoss =
      (trade.sellingPrice - trade.buyingPrice) * trade.quantity;
    return {
      duration,
      profitOrLoss,
      id: i + 1,
      buyingDate: dayjs(trade.buyingDate.DateUnix).format("DD-MM-YY  HH:mm:ss"),
      sellingDate: dayjs(trade.sellingDate.DateUnix).format(
        "DD-MM-YY  HH:mm:ss"
      ),
      buyingDateObj: dayjs(trade.buyingDate.DateUnix),
      sellingDateObj: dayjs(trade.sellingDate.DateUnix),
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

  return transformedData.map((trade) => {
    const trimmedTrade = {};
    Object.keys(trade).forEach((key) => {
      trimmedTrade[key] = trimToTwoDecimal(trade[key]);
    });
    return trimmedTrade;
  });
};

const addDrawDown = (tradeResults) => {
  for (let i = 0; i < tradeResults.length; i++) {
    const trade = tradeResults[i];
    const currentCapital = trade.currentCapital;
    const highestCapital = trade.highestCapital;

    let drawDownPercentage =
      ((highestCapital - currentCapital) / highestCapital) * 100;
    trade.drawDown = -1 * drawDownPercentage;

    const previousDrawDownDuration = tradeResults[i - 1]?.drawDownDuration || 0;
    trade.drawDownDuration =
      trade.drawDown < 0 ? previousDrawDownDuration + 1 : 0;
  }
};
