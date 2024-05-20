import { addTechnicalIndicator } from "../trading/parser/restructureData.js";
import fs from "fs";
import _ from "lodash";
import { start } from "repl";

const INPUT_FOLDER = "./.output/data/";
const OUTPUT_FOLDER = "./.output/dataWithTechnicalIndicators/";

const isRangeInvalid = (data, technicalData) => {
  if (technicalData.length === 0) return false;

  const lastTechnicalData = _.last(technicalData);
  const lastData = _.last(data);
  return (
    lastTechnicalData.DateUnix > lastData.DateUnix ||
    technicalData[0].DateUnix > data[0].DateUnix
  );
};

const main = () => {
  if (process.argv[2]) {
    const filename = process.argv[2];
    const data = JSON.parse(fs.readFileSync(`${INPUT_FOLDER}${filename}`));
    let technicalData = [];
    if (fs.existsSync(`${OUTPUT_FOLDER}${filename}`)) {
      technicalData = JSON.parse(
        fs.readFileSync(`${OUTPUT_FOLDER}${filename}`, "utf-8")
      );
    }

    console.log(
      `adding total ${data.length - technicalData.length} indicators`
    );
    console.log(data.length, technicalData.length);
    if (isRangeInvalid(data, technicalData)) throw "some thing went wrong";

    const dataWithIndicators = addTechnicalIndicator(
      data,
      technicalData.length
    );
    const path = `./.output/dataWithTechnicalIndicators/${filename}`;

    fs.writeFileSync(
      path,
      JSON.stringify([...technicalData, ...dataWithIndicators]),
      {
        encoding: "utf8",
      }
    );
  }
};

main();
