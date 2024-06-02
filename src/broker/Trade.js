import { RestClientV5 } from "bybit-api";
import dotenv from "dotenv";
dotenv.config();

const testnet = process.env.USE_TESTNET === "true";
const symbol = process.env.DEFAULT_SYMBOL;

const client = (testnet) => {
  const args = {
    testnet: testnet,
    key: testnet ? process.env.TESTNET_API_KEY : process.env.API_KEY,
    secret: testnet ? process.env.TESTNET_API_SECRET : process.env.API_SECRET,
  };

  return new RestClientV5(args);
};

const modifyPosition = async (sl) => {
  const clientInstance = client(testnet);
  return clientInstance
    .setTradingStop({
      category: "linear",
      stopLoss: sl.toString(),
      symbol: symbol,
    })
    .then((response) => {
      return response;
    })
    .catch((error) => {
      console.error(error);
    });
};

const modifyOrder = async (orderId, quantity, trigger, sl, side = "Buy") => {
  const clientInstance = client(testnet);
  return clientInstance
    .submitOrder({
      category: "linear",
      orderType: "Market",
      side: side,
      symbol: symbol,
      orderId: orderId,
      qty: quantity.toString(),
      triggerPrice: trigger.toString(),
      triggerDirection: "1",
      stopLoss: sl.toString(),
      timeInForce: "PostOnly",
    })
    .then((response) => {
      console.log(response);
    })
    .catch((error) => {
      console.error(error);
    });
};

const cancelOrder = async (orderId) => {
  const clientInstance = client(testnet);
  return clientInstance
    .cancelOrder({
      category: "linear",
      symbol: symbol,
      orderId: orderId,
    })
    .then((response) => {
      return response;
    })
    .catch((error) => {
      console.error(error);
    });
};

const placeOrder = async (quantity, trigger, sl, side = "Buy") => {
  const clientInstance = client(testnet);

  return clientInstance
    .submitOrder({
      category: "linear",
      symbol: symbol,
      side: side,
      qty: quantity.toString(),
      orderType: "Market",
      timeInForce: "PostOnly",
      triggerPrice: trigger.toString(),
      triggerDirection: "1",
      stopLoss: sl.toString(),
    })
    .then((response) => {
      return response;
    })
    .catch((error) => {
      console.error(error);
    });
};

const openPositions = async () => {
  const clientInstance = client(testnet);

  return clientInstance
    .getPositionInfo({
      category: "linear",
      symbol: symbol,
    })
    .then((response) => {
      const data = response.result.list[0];
      return {
        symbol: data.symbol,
        side: data.side,
        size: +data.size,
        entryPrice: +data.avgPrice,
        leverage: +data.leverage,
        // margin: data.position_margin,
        amount: +data.positionValue,
        unrealizedPnl: +data.unrealisedPnl,
        realizedPnl: +data.curRealisedPnl,
        // riskId: data.riskId,
        // positionId: data.position_idx,
        takeProfit: +data.takeProfit,
        stopLoss: +data.stopLoss,
        trailingStop: +data.trailingStop,
      };
    })
    .catch((error) => {
      console.error(error);
    });
};

const tradeHistory = async () => {
  const clientInstance = client(testnet);

  return clientInstance
    .getHistoricOrders({
      category: "linear",
      symbol: symbol,
      limit: 10,
    })
    .then((response) => {
      return response.result.list.map((order) => {
        return {
          symbol: order.symbol,
          side: order.side,
          orderType: order.orderType,
          orderId: order.orderId,
          orderStatus: order.orderStatus,
          takeProfit: order.takeProfit,
          createdTime: order.createdTime,
          updatedTime: order.updatedTime,
          triggerPrice: order.triggerPrice,
          tpTriggerBy: order.tpTriggerBy,
          positionIdx: order.positionIdx,
          quantity: +order.qty,
          stopLoss: order.stopLoss,
          slTriggerBy: order.slTriggerBy,
          price: order.avgPrice,
          orderStatus: order.orderStatus,
          cancelType: order.cancelType,
        };
      });
    })
    .catch((error) => {
      console.error(error);
    });
};

const activeOrders = async () => {
  const clientInstance = client(testnet);

  return clientInstance
    .getActiveOrders({
      category: "linear",
      symbol: symbol,
      openOnly: 0,
    })
    .then((response) => {
      return response.result.list;
    })
    .catch((error) => {
      console.error(error);
    });
};

// console.log(await activeOrderHistory());
// console.log(
//   await modifyOrder("d7b0589d-940a-460a-bab4-bf1b2b592ab2", 100, 0.044, 0.04)
// );
// console.log(await placeOrder(100, 0.05, 0.03, "Buy"));

const trade = {
  activeOrders,
  openPositions,
  placeOrder,
  cancelOrder,
  modifyPosition,
  tradeHistory,
};

export default trade;
