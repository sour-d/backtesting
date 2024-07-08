import { RestClientV5 } from "bybit-api";
import dotenv from "dotenv";
dotenv.config();

const testnet = process.env.USE_TESTNET === "true";

class Trade {
  symbol;
  clientInstance;

  constructor(symbol) {
    this.symbol = symbol;

    const client = (testnet) => {
      const args = {
        testnet: testnet,
        key: testnet ? process.env.TESTNET_API_KEY : process.env.API_KEY,
        secret: testnet
          ? process.env.TESTNET_API_SECRET
          : process.env.API_SECRET,
      };

      return new RestClientV5(args);
    };
    this.clientInstance = client(testnet);
  }

  modifyPosition = async (sl) => {
    return this.clientInstance
      .setTradingStop({
        category: "linear",
        stopLoss: sl.toString(),
        symbol: this.symbol,
      })
      .then((response) => {
        return response;
      })
      .catch((error) => {
        console.error(error);
      });
  };

  modifyOrder = async (orderId, quantity, trigger, sl, side = "Buy") => {
    return this.clientInstance
      .submitOrder({
        category: "linear",
        orderType: "Market",
        side: side,
        symbol: this.symbol,
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

  cancelOrder = async (orderId) => {
    return this.clientInstance
      .cancelOrder({
        category: "linear",
        symbol: this.symbol,
        orderId: orderId,
      })
      .then((response) => {
        return response;
      })
      .catch((error) => {
        console.error(error);
      });
  };

  placeTriggerOrder = async (quantity, trigger, sl, side = "Buy") => {
    return this.clientInstance
      .submitOrder({
        category: "linear",
        symbol: this.symbol,
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

  openPositions = async () => {
    return this.clientInstance
      .getPositionInfo({
        category: "linear",
        symbol: this.symbol,
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

  tradeHistory = async () => {
    return this.clientInstance
      .getHistoricOrders({
        category: "linear",
        symbol: this.symbol,
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

  activeOrders = async () => {
    return this.clientInstance
      .getActiveOrders({
        category: "linear",
        symbol: this.symbol,
        openOnly: 0,
      })
      .then((response) => {
        return response.result.list;
      })
      .catch((error) => {
        console.error(error);
      });
  };

  placeTpMarketOrder = async (quantity, tpPrice, sl, side = "Buy") => {
    return this.clientInstance
      .submitOrder({
        category: "linear",
        symbol: this.symbol,
        side: side,
        qty: quantity.toString(),
        orderType: "Market",
        timeInForce: "PostOnly",
        takeProfit: tpPrice.toString(),
        stopLoss: sl.toString(),
      })
      .then((response) => {
        return response;
      })
      .catch((error) => {
        console.error(error);
      });
  };

  exitPosition = async (side) => {
    return this.clientInstance
      .submitOrder({
        category: "linear",
        symbol: this.symbol,
        orderType: "Market",
        closeOnTrigger: true,
        reduceOnly: true,
        qty: "0",
        side,
      })
      .then((response) => {
        return response;
      })
      .catch((error) => {
        console.error(error);
      });
  };
}

// const trade = new Trade("GALAUSDT");
// console.log(await trade.placeTpMarketOrder(100, 0.6, 0.02, "Buy"));

export default Trade;
