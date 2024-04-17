import { Request, Response, NextFunction } from "express";

import { EventEmitter } from "events";
import WebSocket from "ws";

import { DefaultLogger, WS_KEY_MAP, WebsocketClient } from "bybit-api";
import { log } from "console";

const timeFrameMap: { [key: string]: string } = {
  "1m": "1",
  "3m": "3",
  "5m": "5",
  "15m": "15",
  "30m": "30",

  "1h": "60",
  "2h": "120",
  "4h": "240",
  "6h": "360",
  "12h": "720",

  "1d": "D",
  "1w": "W",
  "1M": "M",
};

export default class LiveQuote extends EventEmitter {
  timeFrameInMs: number | undefined;
  intervalId: any;
  onTimeout: Function;

  constructor(onTimeout: Function) {
    super();
    this.onTimeout = onTimeout;
  }

  subscribe(symbol: string, timeFrame: string, id: string) {
    const wsClient = new WebsocketClient({ market: "v5" });

    wsClient.on("update", ({ type, topic, data: quotes, ts, wsKey }: any) => {
      quotes.forEach((quote: any) => {
        if (!quote.confirm) return;
        this.emit("Quote", {
          id,
          Date: +quote.timestamp,
          Open: +quote.open,
          High: +quote.high,
          Low: +quote.low,
          Close: +quote.close,
          Volume: +quote.volume,
        });
      });
    });
    wsClient.on("open", (data: any) => {
      console.log("connection opened open:", data.wsKey);
    });
    wsClient.on("response", (data: any) => {
      console.log("log response: ", JSON.stringify(data, null, 2));
    });
    wsClient.on("reconnect", ({ wsKey }: { wsKey: any }) => {
      console.log("ws automatically reconnecting.... ", wsKey);
    });
    wsClient.on("reconnected", (data: any) => {
      console.log("ws has reconnected ", data?.wsKey);
    });
    wsClient.on("close", (data: any) => {
      console.log("ws has been closed ", data?.wsKey);
      this.onTimeout();
    });

    const topics = `kline.${timeFrameMap[timeFrame]}.${symbol.toUpperCase()}`;

    console.log("subscribing to ", topics);
    wsClient.subscribeV5(topics, "spot");
  }

  // subscribe(symbol: string, timeFrame: string, id: string) {
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

declare module "express-serve-static-core" {
  interface Request {
    liveQuote: LiveQuote;
  }
}

const liveQuote = new LiveQuote(() => {});

export const attachLiveQuoteManager = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  req.liveQuote = liveQuote;
  next();
};
