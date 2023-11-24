const { EventEmitter } = require("events");
const WebSocket = require("ws");

class LiveQuote extends EventEmitter {
  constructor() {
    super();
    this.listeners = [];
    this.broadcaster = new EventEmitter();

    this.start();
  }

  start() {
    const ws = new WebSocket("wss://stream.binance.com:9443/ws");

    const subscribeMsg = {
      method: "SUBSCRIBE",
      params: ["btcusdt@kline_1m"],
      id: 1,
    };

    let prevCandle: any;

    ws.on("open", () => {
      ws.send(JSON.stringify(subscribeMsg));
    });

    ws.on("message", (data: any) => {
      const message = JSON.parse(data);
      const quote = prevCandle?.k;
      prevCandle = message;
      if (!quote) return;
      if (quote.T >= Date.now()) return;

      this.emit("Quote", {
        Date: quote.T,
        Open: quote.o,
        High: quote.h,
        Low: quote.l,
        Close: quote.c,
        Volume: quote.v,
      });
    });

    ws.on("error", (err: any) => {
      console.error(`WebSocket error: ${err}`);
    });

    ws.on("close", () => {
      console.log("WebSocket connection closed");
      this.emit("closed");
    });
  }
}

export default LiveQuote;
