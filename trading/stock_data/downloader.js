import { HistoricalKline } from "broker";
import dayjs from "dayjs";

const fetchHistoricalData = async (symbol, interval, start, end, filename) => {
  const startMs = start.valueOf();
  const endMs = end.valueOf();
  const OHCL = await HistoricalKline(
    symbol,
    interval,
    startMs,
    endMs,
    !!process.env.TESTNET
  );

  console.log(
    `${OHCL.length} records downloaded from ${dayjs(
      startMs
    ).toString()} to ${dayjs(endMs).toString()}`
  );

  return OHCL;
};

export { fetchHistoricalData };
