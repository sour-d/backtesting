import express from "express";
import ws from "express-ws";
import morgan from "morgan";
import { STRATEGIES } from "./strategyRunner";
import path from "path";
import { injectDatabase, attachStrategyManager } from "./handlers/middlewares";
import * as dotenv from 'dotenv';
import staticRoutes from "./routes/static.routes";
import backtestRoutes from "./routes/backtest.routes";
import paperTradeRoutes from "./routes/paperTrade.routes";
import handleWebsocketRequest from './handlers/websocket';

declare module "express-serve-static-core" {
  interface Application {
    ws: (route: string, callback: (ws: any, req: any) => void) => void;
  }
}

const app: express.Application = express();

ws(app);
dotenv.config();

// middlewares
app.use(express.urlencoded());
app.use(express.json());
app.use(morgan("tiny"));
app.use(injectDatabase);
app.use(attachStrategyManager);

// routes
app.use(staticRoutes);
app.use(backtestRoutes);
app.use(paperTradeRoutes);

// common routes --------------------------------------------------
app.get("/api/strategies", (req, res) => res.json(STRATEGIES));

app.get("/api/downloaded-data", (req, res) => {
  res.header("Content-Type", "application/json");
  res.sendFile(path.resolve("", "symbolList.json"));
});
// common routes ends here ---------------------------------------

app.ws("/api/paper-trade/:id", handleWebsocketRequest);

app.use(express.static("public"));


const config = {
  port: Number(process.env.PORT) || 3000,
};

app.listen(config.port, () => {
  console.log(`Server running on http://localhost:${config.port}/`);
});
