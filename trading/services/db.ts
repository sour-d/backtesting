import { Request, Response, NextFunction } from "express";

const fs = require("fs");

const filePath = "data/liveQuotesDB.json";
const data = read();

const intervalId = setInterval(write, 5000);

process.on("SIGINT", () => {
  clearInterval(intervalId);
  updateEndTime();
  write();
  process.exit(0);
});

function read() {
  try {
    if (!fs.existsSync(filePath)) return [];

    const data = fs.readFileSync(filePath, "utf-8");
    return data ? JSON.parse(data) : [];
  } catch (err) {
    console.error("Error reading file:", err);
    return [];
  }
}

function write() {
  try {
    const jsonData = JSON.stringify(data);
    fs.writeFileSync(filePath, jsonData, "utf-8");
  } catch (err) {
    console.error("Error writing to file:", err);
  }
}

function update(id: string, key: string, value: any) {
  data.forEach((item: any) => {
    if (item.id === id) {
      item[key] = value;
    }
  });
}

function updateAll(ids: string[], key: string, value: any) {
  ids.forEach((id) => update(id, key, value));
}

function updateAllWhere(condition: string[], key: string, value: any) {
  const filteredData = data.filter(condition);
  filteredData.forEach((data: any) => {
    data[key] = value;
  });
}

function remove(id: string) {
  data.filter((item: any) => item.id !== id);
}

function add(item: any) {
  data.push(item);
}

function updateEndTime() {
  const unfinishedQuotes = data
    .filter((item: any) => !item.endTime)
    .map((item: any) => item.id);

  if (!unfinishedQuotes) return;
  updateAll(unfinishedQuotes, "endTime", new Date().getTime());
}

function find(id: string) {
  return data.find((item: any) => item.id === id);
}

const db = {
  update,
  updateAll,
  updateAllWhere,
  remove,
  add,
  find,
  liveQuotes: data,
};

export default db;

// declare module "express-serve-static-core" {
//   interface Request {
//     db: any;
//   }
// }

// export const injectDatabase = (
//   req: Request,
//   _res: Response,
//   next: NextFunction
// ) => {
//   req.db = db;
//   next();
// };
