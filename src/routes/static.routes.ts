import express from 'express';
import backtest from '../strategyRunner';
import { getFileName } from '../utils';
import { log } from 'console';
import path from 'path';

const router = express.Router();

router.get(["/", "/index", "/index.html"], (req, res) =>
  res.sendFile(path.resolve("public", "index.html"))
);

// router.get("/:type", (req, res, next) => {
//   const type: string = req.params.type;
//   if (type === 'backtest' || type === 'paper-trade') {
//     return res.sendFile(path.resolve("public", `${type}/trade.html`));
//   }
//   next();
// });

router.get("/:type/result", (req, res) => {
  const type: string = req.params.type;
  res.sendFile(path.resolve("public", `${type}/result.html`));
});

export default router;

