import { HistoricalKline } from "broker";
import fs from "fs";
import dayjs from "dayjs";

const downloader = async (symbol, interval, start, end) => {
  const startMs = new Date(start).getTime();
  const endMs = new Date(end).getTime();
  const OHCL = await HistoricalKline(symbol, interval, startMs, endMs);

  console.log({ start, end, startMs, endMs });

  console.log(`${OHCL.length} records downloaded from ${start} to ${end}}`);

  let newData = OHCL;
  const filename = `./.output/data/${symbol}_${interval}.json`;
  if (fs.existsSync(filename)) {
    const data = JSON.parse(fs.readFileSync(filename));
    newData = [...data, ...OHCL];
  }
  fs.writeFileSync(filename, JSON.stringify(newData));
};

export default downloader;
