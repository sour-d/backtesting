import dotenv from "dotenv";
import { getRestClient } from "./Client";
dotenv.config();

class Trade {
  symbol;
  clientInstance;
  logger;

  constructor(symbol, logger = console.log) {
    this.symbol = symbol;
    this.logger = logger;

    this.clientInstance = getRestClient();
  }

  modifyPosition = async (sl) => {
    this.logger("-------- Modifying Stop Loss ---------", sl);
    return this.clientInstance
      .setTradingStop({
        category: "linear",
        stopLoss: sl.toString(),
        symbol: this.symbol,
        positionIdx: 0,
      })
      .then((response) => {
        this.logger("-------- Modified Stop Loss Response ---------", res);
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
        this.logger(response);
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
        this.logger(
          "-------- Error in fetching Open Positions ---------",
          error
        );
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
        this.logger(
          "-------- Error in fetching Active Orders ---------",
          error
        );
      });
  };

  placeOrder = async (quantity, price, tp, sl, side = "Buy") => {
    this.logger("------ Placing New Order ------", {
      quantity,
      ...(price ? { price: price.toString() } : {}),
      ...(tp ? { takeProfit: tp.toString() } : {}),
      ...(sl ? { stopLoss: sl.toString() } : {}),
      side,
    });
    return this.clientInstance
      .submitOrder({
        category: "linear",
        symbol: this.symbol,
        side: side,
        qty: quantity.toString(),
        timeInForce: "GTC",
        orderType: !price ? "Market" : "Limit",
        ...(price ? { price: price.toString() } : {}),
        ...(tp ? { takeProfit: tp.toString() } : {}),
        ...(sl ? { stopLoss: sl.toString() } : {}),
      })
      .then((response) => {
        let message = "------ New Order Placed ------";
        if (!response || response.retMsg !== "OK") {
          message = "------ New Order Failed ------";
        }
        this.logger(message, response);
        return response;
      })
      .catch((error) => {
        this.logger(error);
      });
    ``;
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
        if (!response || response.retMsg !== "OK")
          return this.logger("-------- Position Exit Failed ---------", response);

        this.logger("-------- Position Forced Exit ---------", response);
        return response;
      })
      .catch((error) => {
        this.logger(error);
      });
  };
}

// const trade = new Trade("SOLUSDT");
// console.log(
//   await trade.placeOrder(1, 500.0482432892432, 0, 480.024275500000000002, "Buy")
// );
// console.log(await trade.modifyPosition(2700));

export default Trade;
