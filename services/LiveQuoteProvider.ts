import { Request, Response, NextFunction } from "express";

import { EventEmitter } from "events";

import { WebsocketClient } from "bybit-api";
import { Quote } from "../trading/quote/IQuote";

export interface LiveQuoteObj {
  id: string;
  symbol: string;
  timeFrame: string;
  tick: Quote;
}

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

export default class LiveQuoteProvider extends EventEmitter {
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
        const liveQuoteObj: LiveQuoteObj = {
          id,
          symbol,
          timeFrame,
          tick: {
            Date: +quote.timestamp,
            Open: +quote.open,
            High: +quote.high,
            Low: +quote.low,
            Close: +quote.close,
            Volume: +quote.volume,
          },
        };
        this.emit("Quote", liveQuoteObj);
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
  //   const data = require("../quotes.json");
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

// declare module "express-serve-static-core" {
//   interface Request {
//     liveQuoteProvider: LiveQuoteProvider;
//   }
// }

// const liveQuoteProvider = new LiveQuoteProvider(() => {});

// export const attachLiveQuoteManager = (
//   req: Request,
//   _res: Response,
//   next: NextFunction
// ) => {
//   req.liveQuoteProvider = liveQuoteProvider;
//   next();
// };
