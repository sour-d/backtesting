import express from "express";
// import ws from "express-ws";
import morgan from "morgan";
import path from "path";
import * as dotenv from "dotenv";
// import staticRoutes from "./routes/static.routes";
// import backtestRoutes from "./routes/backtest.routes";
// import paperTradeRoutes from "./routes/paperTrade.routes";
import fs from "fs";
import startPingInInterval from "./api/ping.js";
import { StrategyList } from "./api/routes/strategyList.js";
import { Trade } from "./api/routes/trade.js";
import { Result } from "./api/routes/result.js";
import liveStrategiesList from "./api/routes/liveStrategiesList.js";
import logsRouter from "./api/routes/logs.js";
import logger from "./modules/logger/index.js";
import ServiceProvider from "./modules/core-services/service-provider.js";

const app = express();

// Initialize error logger
const serverLogger = logger ? logger({ component: 'Server' }) : console;

// Global error handlers to prevent server crashes
process.on('uncaughtException', (error) => {
  serverLogger.error('Uncaught Exception - Server crash prevented', {
    error: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString()
  });
  console.error('Uncaught Exception:', error);
  // In production, you might want to exit gracefully
  // process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  serverLogger.error('Unhandled Promise Rejection - Server crash prevented', {
    reason: reason instanceof Error ? reason.message : String(reason),
    stack: reason instanceof Error ? reason.stack : undefined,
    promise: promise,
    timestamp: new Date().toISOString()
  });
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // In production, you might want to exit gracefully
  // process.exit(1);
});

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
app.get("/api/live-strategies-list", liveStrategiesList);
app.post("/api/live/trade", Trade);
app.get("/api/live/result", Result);

// logs API
app.use("/api/logs", logsRouter);

// web ---------------
app.get("/", (_req, res) => {
  res.sendFile(path.resolve("", "public", "index.html"));
});
app.get("/live", (_req, res) => {
  res.sendFile(path.resolve("", "public", "live/index.html"));
});

// app.get("/live/result", (_req, res) => {
//   res.sendFile(path.resolve("", "public", "live/result.html"));
// });

app.get("/live/quotes", (req, res) => {
  const { file } = req.query;
  if (file) {
    const content = fs.readFileSync(path.resolve("", ".output", file), "utf8");
    res.json(JSON.parse(content).reverse());
    return;
  }
  const files = fs.readdirSync(".output");
  res.send(
    files
      .map(
        (file) =>
          `<li><a href="/live/quotes?file=${file}" target="_blank">${file}</a></li>`
      )
      .join("")
  );
});

app.use(express.static("public/live/js"));

// app.get("/api/available-data", (_req, res) => {
//   res.header("Content-Type", "application/json");
//   res.sendFile(path.resolve("", "symbolList.json"));
// });
// common routes ends here ---------------------------------------

// app.ws("/api/paper-trade/:id", handleWebsocketRequest);

app.get("/log/ping", (req, res) => {
  if (!fs.existsSync("ping-log.txt")) fs.writeFileSync("ping-log.txt", "");
  fs.readFile("ping-log.txt", "utf8", (err, data) => {
    if (err) {
      res.send("Error reading ping file");
    } else {
      res.json(JSON.parse(data));
    }
  });
});

app.get("/live/log", (req, res) => {
  const { strategy } = req.query;
  if (!strategy) {
    res.send("No strategy provided");
    return;
  }

  const logFileName = `.log/${strategy}.txt`;

  if (!fs.existsSync(logFileName)) {
    res.send("No log file found");
    return;
  }

  fs.readFile(logFileName, "utf8", (err, data) => {
    if (err) {
      res.send("Error reading log file");
    } else {
      res.send(data);
    }
  });
});

app.get("/ping", (req, res) => res.send("pong"));

// Global error handling middleware - must be added after all routes
app.use((error, req, res, next) => {
  serverLogger.error('Express route error caught', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    timestamp: new Date().toISOString()
  });

  console.error('Express Error:', error);

  // Send error response to client
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// app.use(express.static("public"));

const config = {
  port: Number(process.env.PORT) || 3005,
};

// Wrap server startup in try-catch to handle initialization errors
try {
  app.listen(config.port, () => {
    try {
      process.env.KEEP_ALIVE && startPingInInterval();
      ServiceProvider.getInstance().liveStrategyManager.loadStrategies();

      serverLogger.info(`Server running on http://localhost:${config.port}/`);
    } catch (initError) {
      serverLogger.error('Server initialization error', {
        error: initError.message,
        stack: initError.stack,
        timestamp: new Date().toISOString()
      });
      console.error('Server initialization failed:', initError);
    }
  });
} catch (serverError) {
  errorLogger.error('Server startup error', {
    error: serverError.message,
    stack: serverError.stack,
    port: config.port,
    timestamp: new Date().toISOString()
  });
  console.error('Failed to start server:', serverError);
  process.exit(1);
}