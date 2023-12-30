import { Request, Response, NextFunction } from "express";
const db = require("./db");

declare module "express-serve-static-core" {
  interface Request {
    db: any;
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
