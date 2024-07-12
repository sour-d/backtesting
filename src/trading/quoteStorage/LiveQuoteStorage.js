import dayjs from "dayjs";
import {
  addTechnicalIndicator,
  addTechnicalIndicatorToLastQuote,
} from "../parser/restructureData";
import ServiceProvider from "../../services/ServiceProvider";
import { ExistingQuoteStorage } from "./ExistingQuoteStorage";
import { fetchHistoricalData } from "../stock_data/downloader";
import logger from "../../server/logger";

const getTimeFrame = (timeFrame) => {
  return {
    1: "minutes",
    3: "minutes",
    5: "minutes",
    15: "minutes",
    30: "minutes",
    60: "hours",
    D: "days",
  }[timeFrame];
};

const fetchInitialData = async (symbol, timeFrame, startingQuoteDay) => {
  const end = dayjs();
  const start = end.subtract(startingQuoteDay, getTimeFrame(timeFrame));
  const data = await fetchHistoricalData(symbol, timeFrame, start, end);
  logger("fetched initial data", data.length);
  return addTechnicalIndicator(data);
};

export class LiveQuoteStorage extends ExistingQuoteStorage {
  listener;
  symbol;
  timeFrame;

  constructor(
    listener,
    startingQuoteDay = 1,
    symbol,
    timeFrame = 1,
    name = ""
  ) {
    super([], startingQuoteDay, name);
    this.currentQuoteIndex = -1;
    this.symbol = symbol;
    this.timeFrame = timeFrame;
    this.topic = `kline.${timeFrame}.${symbol}`;
    this.listener = listener;

    fetchInitialData(symbol, timeFrame, startingQuoteDay)
      .then((data) => {
        this.quotes = data;
        this.currentQuoteIndex = data.length - 1;
      })
      .then(() => {
        ServiceProvider.getInstance().liveQuoteProvider.subscribe(
          this.symbol,
          this.timeFrame
        );
        logger("subscribed to ", this.topic);

        ServiceProvider.getInstance().liveQuoteProvider.on(
          this.topic,
          this.onQuotes.bind(this)
        );
      });
  }

  onQuotes({ type, data, topic }) {
    if (topic !== this.topic) return;
    const technicalQuote = addTechnicalIndicatorToLastQuote(data, this.quotes);
    this.quotes.push(technicalQuote);
    this.currentQuoteIndex++;

    this.listener();
  }
}
