import express from "express";
// import ws from "express-ws";
import morgan from "morgan";
import path from "path";
import * as dotenv from "dotenv";
// import staticRoutes from "./routes/static.routes";
// import backtestRoutes from "./routes/backtest.routes";
// import paperTradeRoutes from "./routes/paperTrade.routes";
import fs from "fs";
import startPingInInterval from "./ping";
import { StrategyList } from "./api/strategyList";
import { Trade } from "./api/trade";
import { Result } from "./api/result";

const app = express();

dotenv.config();

// middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan("tiny"));

// routes
// app.use(staticRoutes);
// app.use(backtestRoutes);
// app.use(paperTradeRoutes);

// common routes --------------------------------------------------
app.get("/api/strategy-list", StrategyList);
app.post("/api/live/trade", Trade);
app.get("/api/live/result", Result);

// web ---------------
app.get("/live", (_req, res) => {
  res.sendFile(path.resolve("", "public", "live/index.html"));
});

app.get("/live/result", (_req, res) => {
  res.sendFile(path.resolve("", "public", "live/result.html"));
});

app.use(express.static("public/live/js"));

// app.get("/api/available-data", (_req, res) => {
//   res.header("Content-Type", "application/json");
//   res.sendFile(path.resolve("", "symbolList.json"));
// });
// common routes ends here ---------------------------------------

// app.ws("/api/paper-trade/:id", handleWebsocketRequest);

app.get("/ping-status", (req, res) => {
  if (!fs.existsSync("ping-log.txt")) fs.writeFileSync("ping-log.txt", "");
  fs.readFile("ping-log.txt", "utf8", (err, data) => {
    if (err) {
      res.send("Error reading ping file");
    } else {
      res.send(data);
    }
  });
});

app.get("/ping", (req, res) => res.send("pong"));

// app.use(express.static("public"));

const config = {
  port: Number(process.env.PORT) || 3000,
};

app.listen(config.port, () => {
  process.env.KeepAlive && startPingInInterval();
  console.log(`Server running on http://localhost:${config.port}/`);
});
