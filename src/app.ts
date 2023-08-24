import express from "express";
import morgan from "morgan";
import strategyRunner, { STRATEGIES } from "./strategyRunner";
import path from "path";

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
  let result;
  try {
    result = strategyRunner("Nifty", req.body);
  } catch (e) {
    res.json({});
    return;
  }
  res.json({ status: "OK", result });
});

app.get("/api/result/:symbol", (req, res) => {
  res.sendFile(path.resolve("result", `${req.params.symbol}.csv`));
});

app.use(express.static("public"));

const port: number = 3000;
app.listen(port, () => {
  console.log(`TypeScript with Express
         http://localhost:${port}/`);
});
