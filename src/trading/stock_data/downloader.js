import broker from "../../broker";
import dayjs from "dayjs";

const fetchHistoricalData = async (symbol, interval, start, end, logger) => {
  const startMs = start.valueOf();
  const endMs = end.valueOf();
  const OHCL = await broker.HistoricalKline(
    symbol,
    interval,
    startMs,
    endMs,
    logger
  );

  console.log(
    `${OHCL.length} records downloaded from ${dayjs(
      startMs
    ).toString()} to ${dayjs(
      endMs
    ).toString()} of ${symbol} with interval ${interval}`
  );

  return OHCL;
};

export { fetchHistoricalData };
