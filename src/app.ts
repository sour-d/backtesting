import express from "express";
import morgan from "morgan";
import backtest, { STRATEGIES, paperTrade } from "./strategyRunner";
import path from "path";
import { getFileName } from "./utils";
import { log } from "console";

const app: express.Application = express();
app.use(express.urlencoded());
app.use(express.json());

app.use(morgan("tiny"));

app.get("/", (req, res) => res.redirect(302, "index.html"));

app.get("/backtest", (req, res) =>
  res.sendFile(path.resolve("public", "backtest.html"))
);
app.get("/paper-trade", (req, res) =>
  res.sendFile(path.resolve("public", "paper-trade.html"))
);
app.get("/:type/result", (req, res) => {
  res.sendFile(path.resolve("public", "result.html"));
});

app.get("/api/:type/result", (req, res) => {
  const type: string = req.params.type;
  const fileName = type === "backtest" ? "backtest.json" : "paper-trade.json";
  res.sendFile(path.resolve("result", fileName));
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

app.post("/api/start-paper-trade", (req, res) => {
  try {
    paperTrade(req.body);
  } catch (e) {
    log(e);
    res.json({});
    return;
  }
  res.json({ status: "OK" });
});

app.use(express.static("public"));

const port: number = 3000;
app.listen(port, () => {
  console.log(`TypeScript with Express
         http://localhost:${port}/`);
});
