import { EventEmitter } from "events";

import { WebsocketClient } from "bybit-api";

export default class LiveQuoteProvider extends EventEmitter {
  timeFrameInMs;
  intervalId;
  onTimeout;

  constructor(onTimeout, testnet = true) {
    super();
    this.onTimeout = onTimeout;
    this.testnet = testnet;
    const wsClient = new WebsocketClient({
      market: "v5",
      testnet: this.testnet,
    });
    wsClient.on("update", ({ type, topic, data: quotes, ts, wsKey }) => {
      quotes.forEach((quote) => {
        if (!quote.confirm) return;
        const liveQuoteObj = {
          type: "quote",
          topic: topic,
          data: {
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
    wsClient.on("reconnected", (data) => {
      console.log("ws has reconnected ", data?.wsKey);
    });
    wsClient.on("close", (data) => {
      console.log("ws has been closed ", data?.wsKey);
      this.onTimeout();
    });

    this.wsClient = wsClient;
  }

  subscribe(symbol, timeFrame) {
    const topic = `kline.${timeFrame}.${symbol.toUpperCase()}`;
    this.wsClient.subscribeV5(topic, "linear");
  }
}

// const a = new LiveQuoteProvider(() => {}, true);
// a.subscribe("BTCUSDT", "1");
// a.on("kline.1.BTCUSDT", (data) => {
//   console.log(data);
// });
