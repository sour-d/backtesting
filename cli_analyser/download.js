import dayjs from "dayjs";
import downloader from "../trading/stock_data/downloader.js";
import fs from "fs";
import _ from "lodash";

const getDateFormat = (date = dayjs().utc()) => {
  return dayjs(date).toISOString();
};

const todaysDate = () => dayjs().utc().format("YYYY-MM-DD");
const getFilename = (symbol, interval) =>
  `./.output/data/${symbol}_${interval}.json`;

const downloadDefaultData = async () => {
  const symbol = process.env.DEFAULT_SYMBOL;
  const interval = process.env.DEFAULT_INTERVAL;
  const startDateString = process.env.DEFAULT_START_DATE + "T00:00:00.000Z";
  const endDateString = process.env.DEFAULT_END_DATE + "T23:59:59.999Z";
  console.log({
    symbol,
    interval,
    startDateString,
    endDateString,
  });

  const start = getDateFormat(startDateString);
  const end = getDateFormat(endDateString);

  downloader(symbol, interval, start, end, `${symbol}_${interval}_DEFAULT`);
};

const downloadFromLastDownloaded = async () => {
  const symbol = "BTCUSDT";
  const interval = "1";

  let start = getDateFormat(todaysDate());
  const end = getDateFormat();

  const filename = `./.output/data/${symbol}_${interval}.json`;
  if (fs.existsSync(filename)) {
    const data = JSON.parse(fs.readFileSync(filename));
    if (_.last(data)?.DateUnix) {
      start = getDateFormat(dayjs.utc(_.last(data).DateUnix).add(1, "minute"));
    }
  }

  downloader(symbol, interval, start, end);
};

const downloadFromStartEnd = () => {
  const filename = process.argv[6];
  const symbol = process.argv[2];
  const interval = process.argv[3];
  const start = process.argv[4] + "T00:00:00.000Z";
  let end = process.argv[5] + "T23:59:59.999Z";
  if (!end) {
    end = start;
  }

  downloader(symbol, interval, start, end, filename);
};

const main = () => {
  if (process.argv[2] === "--default") {
    if (!process.env.DEFAULT_START_DATE) throw "need env";
    return downloadDefaultData();
  }
  if (process.argv[2] === "--continue") {
    return downloadFromLastDownloaded();
  }
  if (process.argv.length > 2) {
    return downloadFromStartEnd();
  }
};

main();
