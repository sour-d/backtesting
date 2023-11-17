import express from "express";
import morgan from "morgan";
import strategyRunner, { STRATEGIES } from "./strategyRunner";
import path from "path";
import { getFileName } from "./utils";
import { log } from "console";

const app: express.Application = express();
app.use(express.urlencoded());
app.use(express.json());

app.use(morgan("tiny"));

app.get("/", (_req, _res) => {
  _res.redirect(302, "index.html");
});

app.get("/api/strategies", (req, res) => {
  res.json(STRATEGIES);
});

app.post("/api/strategies", (req, res) => {
  try {
    const fileName: string = getFileName(req.body.stock);
    strategyRunner(fileName, req.body);
  } catch (e) {
    log(e);
    res.json({});
    return;
  }
  res.json({ status: "OK" });
});

app.get("/api/result", (req, res) => {
  res.header("Content-Type", "application/json");
  res.sendFile(path.resolve("result", `result.json`));
});

app.get("/api/downloaded-data", (req, res) => {
  res.header("Content-Type", "application/json");
  res.sendFile(path.resolve("", "symbolList.json"));
});

app.post("/api/re-download-data", (req, res) => {});

app.use(express.static("public"));

const port: number = 3000;
app.listen(port, () => {
  console.log(`TypeScript with Express
         http://localhost:${port}/`);
});
