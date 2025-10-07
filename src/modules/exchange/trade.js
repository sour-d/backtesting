import dotenv from "dotenv";
import { getRestClient } from "./client.js";
dotenv.config();

class Trade {
  symbol;
  clientInstance;
  logger;

  constructor(symbol, loggerInstance = null) {
    this.symbol = symbol;

    // Use provided logger or create a default one
    this.logger = loggerInstance || {
      debug: console.log,
      info: console.log,
      warn: console.warn,
      error: console.error,
    };

    this.clientInstance = getRestClient();
  }

  modifyPosition = async (sl) => {
    return this.clientInstance
      .setTradingStop({
        category: "linear",
        stopLoss: sl.toString(),
        symbol: this.symbol,
        positionIdx: 0,
        tpslMode: "Full",
      })
      .then((response) => {
        if (response.retMsg !== "OK") {
          this.logger.error("Modifying Stop Loss failed", response);
          return;
        }
        return response;
      })
      .catch((error) => {
        this.logger.error("Modifying Stop Loss failed", error);
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
        this.logger.info("Order modified successfully", response);
      })
      .catch((error) => {
        this.logger.error("Error modifying order", error);
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
        this.logger.info("Order cancelled successfully", orderId);
        return response;
      })
      .catch((error) => {
        this.logger.error("Error cancelling order", error);
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
        this.logger.info("Trigger order placed successfully", {
          quantity,
          trigger,
          sl,
          side,
        });
        return response;
      })
      .catch((error) => {
        this.logger.error("Error placing trigger order", error);
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
        // this.logger.info("Open positions fetched successfully", response);
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
        this.logger.error("Error in fetching open positions", error);
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
        this.logger.error("Error fetching trade history", error);
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
        this.logger.error("Error in fetching active orders", error);
      });
  };

  placeOrder = async (quantity, price, tp, sl, side = "Buy") => {
    this.logger.info("Placing Order", {
      quantity,
      limitPrice: price,
      tpPrice: tp,
      stopLoss: sl,
      side,
      type: price ? "Limit" : "Market",
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
        if (!response || response.retMsg !== "OK") {
          this.logger.warn("New order failed", response);
        } else {
          this.logger.info("New order placed successfully", response);
        }
        return response;
      })
      .catch((error) => {
        this.logger.error("Error placing order", error);
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
        if (!response || response.retMsg !== "OK") {
          this.logger.warn("Position exit failed", response);
        } else {
          this.logger.info("Position forced exit successful", response);
        }
        return response;
      })
      .catch((error) => {
        this.logger.error("Error exiting position", error);
      });
  };
}

// const trade = new Trade("GALAUSDT");
// console.log(
//   await trade.placeOrder(1, 500.0482432892432, 0, 480.024275500000000002, "Buy")
// );
// console.log(await trade.modifyPosition(0.01367));
// console.log(await trade.openPositions());

export default Trade;
