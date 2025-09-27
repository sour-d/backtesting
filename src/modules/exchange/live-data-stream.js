import { EventEmitter } from "events";

import dayjs from "dayjs";
import dotenv from "dotenv";
import { websocketClient } from "./client.js";
import logger from "../logger/index.js";
dotenv.config();

export default class LiveQuoteProvider extends EventEmitter {
  timeFrameInMs;
  intervalId;
  onTimeout;

  constructor(onTimeout, testnet = true) {
    super();

    this.log = logger ? logger({ component: 'Websocket connection' }) : console;
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
      this.log.info("WebSocket connection opened:", data.wsKey);
    });
    wsClient.on("response", (data) => {
      this.log.info("WebSocket response: ", JSON.stringify(data, null, 2));
    });
    wsClient.on("reconnect", ({ wsKey }) => {
      this.log.info("WebSocket automatically reconnecting.... ", wsKey);
    });
    wsClient.on("reconnected", (data) => {
      this.log.info("WebSocket has reconnected ", data?.wsKey);
    });
    wsClient.on("close", (data) => {
      this.log.info("WebSocket has been closed ", data?.wsKey);
      this.onTimeout();
    });

    wsClient.on("error", (err) => {
      this.log.error("WebSocket error", err);
    });

    this.wsClient = wsClient;
  }

  subscribe(symbol, timeFrame) {
    const topic = `kline.${timeFrame}.${symbol.toUpperCase()}`;
    this.wsClient.subscribeV5(topic, "linear");
    this.log.info(`Subscribed to ${topic}`);
  }

  unsubscribe(symbol, timeFrame) {
    const topic = `kline.${timeFrame}.${symbol.toUpperCase()}`;
    this.wsClient.unsubscribeV5(topic, "linear");
    this.log.info(`Unsubscribed from ${topic}`);
  }
}

// const a = new LiveQuoteProvider(() => {}, true);
// a.subscribe("BTCUSDT", "1");
// a.on("kline.1.BTCUSDT", (data) => {
//   console.log(data);
// });
