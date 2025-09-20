import { EventEmitter } from "events";

import dayjs from "dayjs";
import dotenv from "dotenv";
import { websocketClient } from "./Client.js";
dotenv.config();

export default class LiveQuoteProvider extends EventEmitter {
  timeFrameInMs;
  intervalId;
  onTimeout;

  constructor(onTimeout, testnet = true) {
    super();
    this.onTimeout = onTimeout;
    this.testnet = testnet;
    const wsClient = websocketClient();
    wsClient.on("update", ({ type, topic, data: quotes, ts, wsKey }) => {
      quotes.forEach((quote) => {
        if (!quote.confirm) return;
        const liveQuoteObj = {
          type: "quote",
          topic: topic,
          data: {
            date: dayjs(+quote.timestamp)
              .tz("Asia/Kolkata")
              .format("YYYY-MM-DD"),
            time: dayjs(+quote.timestamp)
              .tz("Asia/Kolkata")
              .format("HH:mm:ss"),
            dateUnix: +quote.end,
            open: +quote.open,
            close: +quote.close,
            high: +quote.high,
            low: +quote.low,
            volume: +quote.volume,
          },
        };
        this.emit(topic, liveQuoteObj);
      });
    });
    wsClient.on("open", (data) => {
      console.log("connection opened open:", data.wsKey);
    });
    wsClient.on("response", (data) => {
      console.log("log response: ", JSON.stringify(data, null, 2));
    });
    wsClient.on("reconnect", ({ wsKey }) => {
      console.log("ws automatically reconnecting.... ", wsKey);
    });

    // Note: This class still uses console.log for WebSocket events
    // as these are system-level events that occur before any strategy-specific
    // logger would be available. In a future update, we could inject a logger
    // instance for these events.
    wsClient.on("reconnected", (data) => {
      console.log("ws has reconnected ", data?.wsKey);
    });
    wsClient.on("close", (data) => {
      console.log("ws has been closed ", data?.wsKey);
      this.onTimeout();
    });

    wsClient.on("error", (err) => {
      console.error("error", err);
    });

    this.wsClient = wsClient;
  }

  subscribe(symbol, timeFrame) {
    const topic = `kline.${timeFrame}.${symbol.toUpperCase()}`;
    this.wsClient.subscribeV5(topic, "linear");
  }

  unsubscribe(symbol, timeFrame) {
    const topic = `kline.${timeFrame}.${symbol.toUpperCase()}`;
    this.wsClient.unsubscribeV5(topic, "linear");
  }
}

// const a = new LiveQuoteProvider(() => {}, true);
// a.subscribe("BTCUSDT", "1");
// a.on("kline.1.BTCUSDT", (data) => {
//   console.log(data);
// });
