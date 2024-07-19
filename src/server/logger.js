import fs from "fs";
import { logFileName, logFilePath } from "../utils";

export function clearLog() {
  fs.writeFileSync("log.txt", "", {
    flag: "w",
    encoding: "utf-8",
  });
}

const formatContent = (contents, identifier) => {
  return (
    "<p>" +
    new Date().toISOString() +
    " -----> " +
    identifier +
    " : " +
    contents.join(", ") +
    "</p>\n"
  );
};

export default function logger({ stockName, timeFrame, strategyName }) {
  const identifier = logFileName(stockName, timeFrame, strategyName);
  const path = logFilePath(stockName, timeFrame, strategyName);
  let content = "";

  return (...rawArgs) => {
    const args = Array.from(rawArgs).map((arg) => {
      if (typeof arg === "string") return arg;
      if (typeof arg === "number") return arg;
      return JSON.stringify(arg);
    });

    content = formatContent(args, identifier) + content;
    fs.appendFileSync(path, content, {
      flag: "w",
      encoding: "utf-8",
    });
    console.log("DEBUG ----->", ...rawArgs);
  };
}
