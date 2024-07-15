import fs from "fs";

export function clearLog() {
  fs.writeFileSync("log.txt", "", {
    flag: "w",
    encoding: "utf-8",
  });
}

export default function logger() {
  const args = Array.from(arguments).map((arg) => {
    if (typeof arg === "string") return arg;
    if (typeof arg === "number") return arg;
    return JSON.stringify(arg);
  });
  const content = fs.readFileSync("log.txt", "utf-8");
  fs.appendFileSync(
    "log.txt",
    "<p>" +
      new Date().toISOString() +
      " -----> " +
      args.join(", ") +
      "</p>" +
      content,
    {
      flag: "w",
      encoding: "utf-8",
    }
  );
  console.log("DEBUG ----->", ...arguments);
}
