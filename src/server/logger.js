import fs from "fs";

export function clearLog() {
  fs.writeFileSync("log.txt", "", {
    flag: "w",
    encoding: "utf-8",
  });
}

export default function logger() {
  const args = Array.from(arguments).map((arg) => JSON.stringify(arg));
  fs.appendFileSync(
    "log.txt",
    new Date().toISOString() + " -----> " + args.join(", ") + "\n\n",
    {
      flag: "a",
      encoding: "utf-8",
    }
  );
  console.log("DEBUG ----->", ...arguments);
}
