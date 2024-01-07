import { Request, Response, NextFunction } from "express";
import LiveStrategyManager from "../LiveStrategyManager";
const db = require("./db");

declare module "express-serve-static-core" {
  interface Request {
    db: any;
    strategyManager: LiveStrategyManager;
  }
}

export const addDbToRequest = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  req.db = db;
  next();
};

const strategyManager = new LiveStrategyManager();

export const addStrategyManager = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  req.strategyManager = strategyManager;
  next();
};
