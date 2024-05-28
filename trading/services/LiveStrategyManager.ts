import { Request, Response, NextFunction } from "express";
import { Strategy } from "../strategy/Strategy";
import { TechnicalQuote } from "../parser/restructureData";

// declare module "express-serve-static-core" {
//   interface Request {
//     strategyManager: StrategyManager;
//   }
// }

interface LiveStrategy {
  strategy: Strategy;
  activeTrade: any;
  lastData: TechnicalQuote | null;
}

export default class StrategyManager {
  protected strategies: Map<string, LiveStrategy> = new Map();
  constructor() {}

  public manage(id: string, strategy: Strategy) {
    this.strategies.set(id, { strategy, activeTrade: null, lastData: null });

    strategy.on("data", (data: any) => {
      const liveStrategy = this.strategies.get(id);
      if (!liveStrategy) return;
      this.strategies.set(id, {
        ...liveStrategy,
        lastData: data,
      });
    });

    strategy.on("buy", (data: any) => {
      const liveStrategy = this.strategies.get(id);
      if (!liveStrategy) return;
      this.strategies.set(id, {
        ...liveStrategy,
        activeTrade: data,
      });
    });

    strategy.on("sell", (data: any) => {
      const liveStrategy = this.strategies.get(id);
      if (!liveStrategy) return;
      this.strategies.set(id, {
        ...liveStrategy,
        activeTrade: null,
      });
    });
  }

  public stop(id: string) {
    // this.strategies.get(id)?.stop();
    this.strategies.delete(id);
  }

  public restart(id: string) {
    // this.strategies.get(id)?.restart();
  }

  public channelLiveActivity(id: string, webSocket: any): boolean {
    const liveStrategy = this.strategies.get(id);
    if (!liveStrategy) return false;

    const { strategy, activeTrade, lastData } = liveStrategy;
    webSocket.sendText({ type: "data", data: lastData });
    activeTrade && webSocket.sendText({ type: "buy", data: activeTrade });

    const sendBuyData = (data: any) =>
      webSocket.sendText({ type: "buy", data });
    const sendSellData = (data: any) =>
      webSocket.sendText({ type: "sell", data });
    const sendStockData = (data: any) =>
      webSocket.sendText({ type: "data", data });

    strategy.on("buy", sendBuyData);
    strategy.on("sell", sendSellData);
    strategy.on("data", sendStockData);

    webSocket.on("close", () => {
      strategy.removeListener("buy", sendBuyData);
      strategy.removeListener("sell", sendSellData);
      strategy.removeListener("data", sendStockData);
    });

    return true;
  }
}

// const strategyManager = new StrategyManager();

// export const attachStrategyManager = (
//   req: Request,
//   _res: Response,
//   next: NextFunction
// ) => {
//   req.strategyManager = strategyManager;
//   next();
// };
