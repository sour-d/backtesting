import { log } from "console";

import { EventEmitter } from "events";
import WebSocket from "ws";

const getTimeFrameInMs = (timeFrame: string) => {
  switch (timeFrame) {
    case "1m":
      return 60000;
    case "3m":
      return 180000;
    case "5m":
      return 300000;
    case "15m":
      return 900000;
    case "30m":
      return 1800000;
    case "1h":
      return 3600000;
    case "2h":
      return 7200000;
    case "4h":
      return 14400000;
    case "6h":
      return 21600000;
    case "1d":
      return 1 * 1000 * 60 * 60 * 24;
  }
};

class LiveQuote extends EventEmitter {
  listeners: any;
  isWsOpen: boolean;
  timeFrameInMs: number | undefined;
  intervalId: any;
  id: string;
  onTimeout: Function;

  constructor(
    symbol: string,
    timeFrame: string,
    id: string,
    onTimeout: Function
  ) {
    super();
    this.listeners = [];
    this.timeFrameInMs = getTimeFrameInMs(timeFrame);
    this.isWsOpen = false;
    this.intervalId = undefined;
    this.id = id;
    this.onTimeout = onTimeout;

    this.start(symbol, timeFrame, id);
  }

  start(symbol: string, timeFrame: string, id: string) {
    const ws = new WebSocket("wss://stream.binance.com:9443/ws");

    const subscribeMsg = {
      method: "SUBSCRIBE",
      params: [`${symbol.toLowerCase()}@kline_${timeFrame}`],
      id: 1,
    };

    let prevCandle: any;

    ws.on("open", () => {
      ws.send(JSON.stringify(subscribeMsg));
    });

    ws.on("message", (data: any) => {
      this.isWsOpen = true;
      const message = JSON.parse(data);
      log("LiveQuotes got quote at ", new Date().toLocaleTimeString());
      const quote = prevCandle?.k;
      prevCandle = message;
      if (!quote) return;
      if (quote.T >= Date.now()) return;
      log("emitting a quote at ", new Date().toLocaleTimeString());

      this.emit("Quote", {
        Date: +quote.T,
        Open: +quote.o,
        High: +quote.h,
        Low: +quote.l,
        Close: +quote.c,
        Volume: +quote.v,
      });
    });

    this.intervalId = setInterval(() => {
      if (!this.isWsOpen) {
        console.log("WebSocket connection timeout", { symbol, timeFrame });
        ws.close();
        clearInterval(this.intervalId);
        this.onTimeout();
        this.emit("closed");
      }
      this.isWsOpen = false;
    }, this.timeFrameInMs);

    ws.on("error", (err: any) => {
      console.error(`WebSocket error: ${err}`);
    });

    ws.on("close", () => {
      console.log("WebSocket connection closed");
      this.emit("closed");
    });
  }

  // start(symbol: string, timeFrame: string, id: string) {
  //   const data = [
  //     {
  //       e: "kline",
  //       E: 123456789,
  //       s: symbol,
  //       k: {
  //         t: 123400000,
  //         T: 123460000,
  //         s: symbol,
  //         i: timeFrame,
  //         f: 100,
  //         L: 200,
  //         o: 2,
  //         c: 2.5,
  //         h: 3,
  //         l: 1.5,
  //         v: "1000",
  //         n: 100,
  //         x: false,
  //         q: "1.0000",
  //         V: "500",
  //         Q: "0.500",
  //         B: "123456",
  //       },
  //     },
  //     {
  //       e: "kline",
  //       E: 123456789,
  //       s: symbol,
  //       k: {
  //         t: 123400000,
  //         T: 123460000,
  //         s: symbol,
  //         i: timeFrame,
  //         f: 100,
  //         L: 200,
  //         o: 2.5,
  //         c: 3,
  //         h: 3.5,
  //         l: 2,
  //         v: "1000",
  //         n: 100,
  //         x: false,
  //         q: "1.0000",
  //         V: "500",
  //         Q: "0.500",
  //         B: "123456",
  //       },
  //     },
  //     {
  //       e: "kline",
  //       E: 123456789,
  //       s: symbol,
  //       k: {
  //         t: 123400000,
  //         T: 123460000,
  //         s: symbol,
  //         i: timeFrame,
  //         f: 100,
  //         L: 200,
  //         o: 3,
  //         c: 3.5,
  //         h: 4,
  //         l: 2.5,
  //         v: "1000",
  //         n: 100,
  //         x: false,
  //         q: "1.0000",
  //         V: "500",
  //         Q: "0.500",
  //         B: "123456",
  //       },
  //     },
  //     {
  //       e: "kline",
  //       E: 123456789,
  //       s: symbol,
  //       k: {
  //         t: 123400000,
  //         T: 123460000,
  //         s: symbol,
  //         i: timeFrame,
  //         f: 100,
  //         L: 200,
  //         o: 3.5,
  //         c: 4,
  //         h: 4.5,
  //         l: 3,
  //         v: "1000",
  //         n: 100,
  //         x: false,
  //         q: "1.0000",
  //         V: "500",
  //         Q: "0.500",
  //         B: "123456",
  //       },
  //     },
  //     {
  //       e: "kline",
  //       E: 123456789,
  //       s: symbol,
  //       k: {
  //         t: 123400000,
  //         T: 123460000,
  //         s: symbol,
  //         i: timeFrame,
  //         f: 100,
  //         L: 200,
  //         o: 4,
  //         c: 4.5,
  //         h: 5,
  //         l: 3.5,
  //         v: "1000",
  //         n: 100,
  //         x: false,
  //         q: "1.0000",
  //         V: "500",
  //         Q: "0.500",
  //         B: "123456",
  //       },
  //     },
  //     {
  //       e: "kline",
  //       E: 123456789,
  //       s: symbol,
  //       k: {
  //         t: 123400000,
  //         T: 123460000,
  //         s: symbol,
  //         i: timeFrame,
  //         f: 100,
  //         L: 200,
  //         o: 4.5,
  //         c: 1,
  //         h: 4.6,
  //         l: 0.5,
  //         v: "1000",
  //         n: 100,
  //         x: false,
  //         q: "1.0000",
  //         V: "500",
  //         Q: "0.500",
  //         B: "123456",
  //       },
  //     },
  //   ];

  //   let i = 0;

  //   setInterval(() => {
  //     if (i >= data.length) return;
  //     const quote = data[i]?.k;
  //     log("emitting a quote at ", new Date().toLocaleTimeString());
  //     this.emit("Quote", {
  //       Date: quote.T,
  //       Open: quote.o,
  //       High: quote.h,
  //       Low: quote.l,
  //       Close: quote.c,
  //       Volume: quote.v,
  //     });
  //     i++;
  //   }, 3000);
  // }
}

export default LiveQuote;
