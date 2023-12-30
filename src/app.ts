import fs from "fs";
import express from "express";
import morgan from "morgan";
import backtest, { STRATEGIES } from "./strategyRunner";
import path from "path";
import { getFileName } from "./utils";
import { log } from "console";
import { restartPaperTrade, startPaperTrade } from "./handlers/paperTrade";
import { addDbToRequest } from "./handlers/middlewares";

const app: express.Application = express();

app.use(express.urlencoded());
app.use(express.json());
app.use(morgan("tiny"));
app.use(addDbToRequest);

app.get(["/", "/index", "/index.html"], (req, res) =>
  res.sendFile(path.resolve("public", "index.html"))
);

app.get("/:type", (req, res) => {
  const type: string = req.params.type;
  res.sendFile(path.resolve("public", `${type}/trade.html`));
});

app.get("/:type/result", (req, res) => {
  const type: string = req.params.type;
  res.sendFile(path.resolve("public", `${type}/result.html`));
});

app.get("/api/backtest/result", (req, res) => {
  res.sendFile(path.resolve("result", "backtest.json"));
});

app.get("/api/paper-trade/result", (req, res) => {
  const { db } = req;
  const id = req.query.id;

  const quoteInfo = db.find(id);
  const trades = fs.readFileSync(`result/${id}.csv`, "utf8");

  res.json({ trades, tradeInfo: quoteInfo });
});

app.get("/api/strategies", (req, res) => res.json(STRATEGIES));

app.get("/api/downloaded-data", (req, res) => {
  res.header("Content-Type", "application/json");
  res.sendFile(path.resolve("", "symbolList.json"));
});

app.post("/api/backtest", (req, res) => {
  try {
    const fileName: string = getFileName(req.body.stock);
    backtest(fileName, req.body);
  } catch (e) {
    log(e);
    res.json({});
    return;
  }
  res.json({ status: "OK" });
});

app.post("/api/paper-trade", startPaperTrade);

app.post("/api/paper-trade/:id/restart", restartPaperTrade);

app.post("/api/paper-trade/:id/delete", (req, res) => {
  const id = req.params.id;

  // db.remove({ id }, {}, function (err: any, numRemoved: any) {
  //   if (err) {
  //     res.status(500).send(err);
  //     return;
  //   }
  //   res.json({ status: "OK", removedCount: numRemoved });
  // });
});

// app.post("/api/paper-trade", (req, res) => restartPaperTrade);

app.get("/api/paper-trade/list", (req, res) => {
  res.json(req.db.liveQuotes);
});

app.use(express.static("public"));

const port: number = 3000;

app.listen(port, () => {
  console.log(`TypeScript with Express
         http://localhost:${port}/`);
});
