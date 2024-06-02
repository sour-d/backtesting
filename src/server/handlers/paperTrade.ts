import { log } from "console";
import { v4 as uuidv4 } from "uuid";
import LiveQuoteProvider from "../../services/LiveQuoteProvider";
import fs, { WriteFileOptions } from "fs";
import { Request, Response } from "express";
import { LiveQuoteStorage } from "../../trading/quote/LiveQuoteStorage";
import ServiceProvider from "../../services/ServiceProvider";
import { STRATEGIES } from "../../trading/strategy";

const setTimeEnd = (db: any, id: string) => () => {
  return () => {
    db.update(id, "endTime", new Date().getTime());
  };
};

export const startPaperTrade = (req: Request, res: Response) => {
  const {
    body: { symbol, strategy, timeFrame },
  } = req;
  const db = ServiceProvider.getInstance().db;
  const liveQuoteProvider = ServiceProvider.getInstance().liveQuoteProvider;

  if (!symbol || !strategy || !timeFrame)
    return res.status(400).json({ error: "Missing required fields" });

  const id = uuidv4();

  try {
    const strategyInstance = paperTrade(
      symbol,
      timeFrame,
      strategy,
      id,
      liveQuoteProvider,
      setTimeEnd(db, id)
    );
    ServiceProvider.getInstance().strategyManager.manage(id, strategyInstance);
    log("started paper trade", "id: ", id);
    const startTime = new Date().getTime();
    const endTime = null;
    db.add({
      id,
      symbol,
      strategy: strategy,
      timeFrame,
      startTime,
      endTime,
    });
    return res.json({ id, status: "OK" });
  } catch (e) {
    log(e);
    return res.status(500).json({ error: e, messsage: "something went wrong" });
  }
};

export const restartPaperTrade = (req: any, res: any) => {
  const { db } = req;
  const id: string = req.body.id;
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
  liveQuoteProvider: LiveQuoteProvider,
  onTimeout: Function
) => {
  // need to change this
  const startingDay = 2;
  liveQuoteProvider.subscribe(symbol, timeFrame, id);
  const stock = new LiveQuoteStorage(
    liveQuoteProvider,
    startingDay,
    id,
    symbol,
    timeFrame
  );

  const strategyClass = STRATEGIES[strategyName]._class;

  const strategy = new strategyClass(stock, persistTradeResult(id));

  strategy.execute();

  return strategy;
};
