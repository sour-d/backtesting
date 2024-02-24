import express from 'express';
import backtest from '../strategyRunner';
import { getFileName } from '../utils';
import { log } from 'console';
import path from 'path';

const router = express.Router();

router.get("/backtest", (_req, res) => res.sendFile(
  path.resolve("public", 'backtest/dashboard.html')
));

router.get("/backtest/outcome", (_req, res) => res.sendFile(
  path.resolve("public", 'backtest/outcomeOverview.html')
));

router.get("/api/backtest/result", (_req, res) => {
  res.sendFile(path.resolve("result", "backtest.json"));
});

router.post("/api/backtest", (req, res) => {
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

export default router;

