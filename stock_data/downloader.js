import { HistoricalKline } from "broker";
import fs from "fs";

const downloader = async (symbol, interval, start, end) => {
  const startMs = new Date(start + "T00:00:00.000Z").getTime();
  const endMs = new Date(end + "T23:59:59.999Z").getTime();
  const OHCL = await HistoricalKline(symbol, interval, startMs, endMs);

  fs.writeFileSync(
    `./.output/data/${symbol}_${interval}.json`,
    JSON.stringify(OHCL)
  );
};

export default downloader;

if (process.argv.length > 0) {
  const symbol = process.argv[2];
  const interval = process.argv[3];
  const start = process.argv[4];
  let end = process.argv[5];
  if (!end) {
    end = start;
  }

  downloader(symbol, interval, start, end);
}
