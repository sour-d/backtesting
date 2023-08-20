import express from "express";
import morgan from "morgan";
import runStrategy from "./runStrategy";
import bodyParser from "body-parser";
import path from "path";

const app: express.Application = express();

app.use(morgan("tiny"));
app.use(bodyParser.text());

app.get("/", (_req, _res) => {
  _res.redirect(302, "index.html");
});

app.get("/api/strategies", (req, res) => {
  res.json([
    "FortyTwentyStrategy",
    "MovingAverageStrategy",
    "TwoBreakingCandle",
  ]);
});

app.post("/api/strategies", (req, res) => {
  console.log("request came");
  const { strategy } = JSON.parse(req.body);
  console.log(req.body, strategy);

  let result;
  try {
    result = runStrategy("Nifty", strategy);
  } catch (e) {
    console.log(e);

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
