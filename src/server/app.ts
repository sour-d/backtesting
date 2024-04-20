import express from "express";
import ws from "express-ws";
import morgan from "morgan";
import path from "path";
import * as dotenv from "dotenv";
import staticRoutes from "./routes/static.routes";
import backtestRoutes from "./routes/backtest.routes";
import paperTradeRoutes from "./routes/paperTrade.routes";
import handleWebsocketRequest from "../services/websocket";
import fs from "fs";
import startPingInInterval from "./ping";
import { STRATEGIES } from "../trading/strategy";

declare module "express-serve-static-core" {
  interface Application {
    ws: (route: string, callback: (ws: any, req: any) => void) => void;
  }
}

const app: express.Application = express();

ws(app);
dotenv.config();

// middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan("tiny"));

// routes
app.use(staticRoutes);
app.use(backtestRoutes);
app.use(paperTradeRoutes);

// common routes --------------------------------------------------
app.get("/api/strategies", (_req, res) => res.json(STRATEGIES));

app.get("/api/available-data", (_req, res) => {
  res.header("Content-Type", "application/json");
  res.sendFile(path.resolve("", "symbolList.json"));
});
// common routes ends here ---------------------------------------

app.ws("/api/paper-trade/:id", handleWebsocketRequest);

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

app.use(express.static("public"));

const config = {
  port: Number(process.env.PORT) || 3000,
};

app.listen(config.port, () => {
  process.env.KeepAlive && startPingInInterval();
  console.log(`Server running on http://localhost:${config.port}/`);
});
