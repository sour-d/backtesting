import dayjs from "dayjs";
import downloader from "../trading/stock_data/downloader.js";
import fs from "fs";
import _ from "lodash";

const getDateFormat = (date = dayjs().utc()) => {
  return dayjs(date).format("YYYY-MM-DDTHH:mm:ss.SSS") + "Z";
};

const todaysDate = () => dayjs().utc().format("YYYY-MM-DD");

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
  if (process.argv.length > 2) {
    downloadFromStartEnd();
    return;
  }
  downloadFromLastDownloaded();
};

main();
