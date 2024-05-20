import fs from "fs";
import strategies from "../trading/strategy/index.js";

const findStrategy = (strategy, name) => {
  return strategy.find((s) => s.name === name);
};

const persistResult = (filename) => (result) => {
  const path = "./.output/result/";
  fs.writeFileSync(`${path}${filename}`, JSON.stringify(result, null, 2));
  console.log(`Saved data in ${path}${filename}`);
};

const main = () => {
  if (process.argv.length < 3) return console.log("Please provide a filename");

  const filename = process.argv[2];
  const strategyName = process.argv[3];
  const strategy = findStrategy(strategies, strategyName);

  if (!strategy) return console.log("Strategy not found");

  console.log("Running Strategy!!");

  const strategyObj = new strategy(
    filename,
    persistResult(`${filename}.json`),
    strategy.getDefaultConfig()
  );
  strategyObj.execute();

  console.log("Strategy ran !!");
};

main();
