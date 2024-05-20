import { HistoricalKline } from "broker";
import fs from "fs";
import dayjs from "dayjs";

const downloader = async (symbol, interval, start, end, filename) => {
  const startMs = new Date(start).getTime();
  const endMs = new Date(end).getTime();
  const OHCL = await HistoricalKline(symbol, interval, startMs, endMs);

  console.log({ start, end, startMs, endMs });

  console.log(`${OHCL.length} records downloaded from ${start} to ${end}}`);

  let newData = OHCL;
  const filenamePath = filename
    ? `./.output/data/${filename}.json`
    : `./.output/data/${symbol}_${interval}.json`;
  if (fs.existsSync(filenamePath)) {
    const data = JSON.parse(fs.readFileSync(filenamePath));
    newData = [...data, ...OHCL];
  }
  fs.writeFileSync(filenamePath, JSON.stringify(newData));
};

export default downloader;
