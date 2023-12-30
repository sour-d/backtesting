import { log } from "console";
import { v4 as uuidv4 } from "uuid";
import LiveQuote from "../LiveQuote";
import { LiveQuoteManager } from "../QuoteManager";
import { STRATEGIES } from "../strategyRunner";
import fs, { WriteFileOptions } from "fs";
import { Request, Response } from "express";

const setTimeEnd = (db: any, id: string) => () => {
  return () => {
    db.update(id, "endTime", new Date().getTime());
  };
};

export const startPaperTrade = (req: Request, res: Response) => {
  const { db } = req;
  const symbol: string = req.body.symbol;
  const strategy: string = req.body.strategy;
  const timeFrame: string = req.body.timeFrame;

  if (!symbol || !strategy || !timeFrame)
    return res.status(400).json({ error: "Missing required fields" });

  const id = uuidv4();

  try {
    paperTrade(symbol, timeFrame, strategy, id, setTimeEnd(db, id));
    log("started paper trade", "id: ", id);
    const startTime = new Date().getTime();
    const endTime = null;
    db.add({ id, symbol, strategy, timeFrame, startTime, endTime });
    return res.json({ id, status: "OK" });
  } catch (e) {
    log(e);
    return res.status(500).json({ error: e, messsage: "something went wrong" });
  }
};

export const restartPaperTrade = (req: any, res: any) => {
  const { db } = req;
  const id: string = req.body.id;

  // db.findOne({ id }, (err: any, entry: any) => {
  //   const symbol: string = entry?.symbol;
  //   const timeFrame: string = entry?.symbol;
  //   const strategy: string = entry?.strategy;

  //   if (!symbol || !strategy || !timeFrame || err) {
  //     res.status(500).send({ message: "something went wrong", err });
  //   }

  //   try {
  //     paperTrade(symbol, timeFrame, strategy, id);
  //   } catch (e) {
  //     log(e);
  //     return res.status(500).json({ error: e });
  //   }
  // });
};

const persistTradeResult = (fileName: string) => {
  const filePath = `result/${fileName}.csv`;
  const header =
    "Buying Date,Buying Price,Selling Date,Selling Price,Total Stocks,Risk";

  if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, header, "utf-8");

  return (trade: any) => {
    if (!trade) return;
    const row = "\r\n" + trade;
    const options: WriteFileOptions = { encoding: "utf-8", flag: "a" };
    fs.writeFile(filePath, row, options, () => {});
  };
};

const paperTrade = (
  symbol: string,
  timeFrame: string,
  strategyName: string,
  id: string,
  onTimeout: Function
) => {
  const startingDay = 2;
  const liveQuote = new LiveQuote(symbol, timeFrame, id, onTimeout);
  const stock = new LiveQuoteManager(liveQuote, startingDay);

  const strategyClass = STRATEGIES[strategyName]._class;

  const strategy = new strategyClass(stock, persistTradeResult(id));

  strategy.execute();
};
