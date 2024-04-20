import express from "express";
import path from "path";
import fs from "fs";
import { restartPaperTrade, startPaperTrade } from "../handlers/paperTrade";
import ServiceProvider from "../../services/ServiceProvider";

const router = express.Router();

router.get("/paper-trade", (req, res) =>
  res.sendFile(path.resolve("public", "paper-trade/dashboard.html"))
);

router.get("/paper-trade/outcome", (_req, res) =>
  res.sendFile(path.resolve("public", "paper-trade/outcomeOverview.html"))
);

router.get("/api/paper-trade/result", (req, res) => {
  const db = ServiceProvider.getInstance().db;
  const id = req.query.id;

  const quoteInfo = db.find(id);
  const trades = fs.readFileSync(`result/${id}.csv`, "utf8");

  res.json({ trades, tradeInfo: quoteInfo });
});

router.post("/api/paper-trade", startPaperTrade);

router.post("/api/paper-trade/:id/restart", restartPaperTrade);

router.post("/api/paper-trade/:id/delete", (req, res) => {
  const id = req.params.id;

  // db.remove({ id }, {}, function (err: any, numRemoved: any) {
  //   if (err) {
  //     res.status(500).send(err);
  //     return;
  //   }
  //   res.json({ status: "OK", removedCount: numRemoved });
  // });
});

// router.post("/api/paper-trade", (req, res) => restartPaperTrade);

router.get("/api/paper-trade/list", (req, res) => {
  res.json(ServiceProvider.getInstance().db.liveQuotes);
});

export default router;
