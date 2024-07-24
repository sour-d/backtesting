import { RestClientV5 } from "bybit-api";
import dotenv from "dotenv";
import _ from "lodash";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
import { getRestClient } from "./Client";

dotenv.config();
dayjs.extend(utc);
dayjs.extend(timezone);


const getTimeFrame = (timeFrame) => {
  return {
    1: "hour",
    3: "hour",
    5: "hour",
    15: "hour",
    30: "hour",
    60: "day",
    D: "month",
  }[timeFrame];
};

const getNewEnd = (start, end, interval, addOneSecond = false) => {
  let newStart = start;
  if (addOneSecond) {
    newStart = dayjs(start).add(1, "second").valueOf();
  }
  const timeFrame = getTimeFrame(interval);
  const newEnd = dayjs(newStart)
    .add(10, timeFrame)
    .subtract(1, "second")
    .valueOf();
  if (newEnd > end) {
    return end;
  }
  return newEnd;
};

const formatResponse = (response) => {
  return response.result.list
    .map((kline) => {
      return {
        date: dayjs(+kline[0])
          .tz("Asia/Kolkata")
          .format("YYYY-MM-DD"),
        time: dayjs(+kline[0])
          .tz("Asia/Kolkata")
          .format("HH:mm:ss"),
        dateUnix: +kline[0],
        open: +kline[1],
        high: +kline[2],
        low: +kline[3],
        close: +kline[4],
        volume: +kline[5],
      };
    })
    .reverse();
};

const HistoricalKline = async (
  symbol,
  interval,
  start,
  end,
  logger
) => {
  let allData = [];
  let fetchTill = getNewEnd(start, end, interval);

  while (end >= fetchTill) {
    logger({ start, fetchTill });
    await getRestClient()
      .getKline({ symbol, interval, start, end: fetchTill, limit: 1000 })
      .then((response) => {
        const data = formatResponse(response);
        allData = allData.concat(data);
        start = fetchTill;
        fetchTill = getNewEnd(start, end, interval, true);
        if (fetchTill === start) {
          fetchTill += 1;
          return;
        }
      })
      .catch((error) => {
        logger("error", JSON.stringify(error));
      });
  }
  return allData;
};

export default HistoricalKline;

// const startMs = new Date("2024-05-09T00:00:00.000Z").getTime();
// const endMs = new Date("2024-05-09T23:59:59.999Z").getTime();

// console.log(startMs, endMs);

// const data = await HistoricalKline("BTCUSD", "1", startMs, endMs);
// fs.writeFileSync("data.json", JSON.stringify(data));
