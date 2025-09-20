import dayjs from "dayjs";
import {
  addTechnicalIndicator,
  addTechnicalIndicatorToLastQuote,
} from "../parser/restructureData.js";
import ServiceProvider from "../../services/ServiceProvider.js";
import { ExistingQuoteStorage } from "./ExistingQuoteStorage.js";
import { fetchHistoricalData } from "../stock_data/downloader.js";
import fs from "fs";

const getTimeFrame = (timeFrame) => {
  return {
    1: "minutes",
    3: "minutes",
    5: "minutes",
    15: "minutes",
    30: "minutes",
    60: "hours",
    240: "hours",
    D: "days",
  }[timeFrame];
};

const fetchInitialData = async (
  symbol,
  timeFrame,
  startingQuoteDay,
  loggerInstance
) => {
  // Create a logger if not provided
  const log = loggerInstance || {
    info: console.log,
    error: console.error
  };

  timeFrame = isNaN(Number(timeFrame)) ? timeFrame : Number(timeFrame);
  if (typeof timeFrame === "number" && timeFrame < 60)
    startingQuoteDay *= timeFrame;
  const end = dayjs();
  const start = end.subtract(startingQuoteDay, getTimeFrame(timeFrame));
  log.info(`Fetching historical data for ${symbol} ${timeFrame}`);
  const data = await fetchHistoricalData(symbol, timeFrame, start, end, loggerInstance);
  log.info(`Fetched initial data: ${data.length} records`);
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
    name = "",
    loggerInstance
  ) {
    super([], startingQuoteDay, name);
    this.currentQuoteIndex = -1;
    this.symbol = symbol;
    this.timeFrame = timeFrame;
    this.topic = `kline.${timeFrame}.${symbol}`;
    this.listener = listener;
    this.boundOnQuotes = this.onQuotes.bind(this);

    // Create a logger if not provided
    this.logger = loggerInstance || {
      debug: console.log,
      info: console.log,
      warn: console.warn,
      error: console.error
    };

    fetchInitialData(symbol, timeFrame, startingQuoteDay, this.logger)
      .then((data) => {
        this.quotes = data;
        this.currentQuoteIndex = data.length - 1;
      })
      .then(() => {
        ServiceProvider.getInstance().liveQuoteProvider.subscribe(
          this.symbol,
          this.timeFrame
        );
        this.logger.info(`Subscribed to ${this.topic}`);

        ServiceProvider.getInstance().liveQuoteProvider.on(
          this.topic,
          this.boundOnQuotes
        );
      });
  }

  onQuotes({ type, data, topic }) {
    if (topic !== this.topic) return;

    try {
      const technicalQuote = addTechnicalIndicatorToLastQuote(data, this.quotes);
      this.quotes.push(technicalQuote);

      fs.writeFileSync(`.output/${topic}.json`, JSON.stringify(this.quotes), {
        flag: "w",
        encoding: "utf-8",
      });
      this.currentQuoteIndex++;

      this.logger.info(`Received new live quote for ${this.symbol} on time frame ${this.timeFrame} at ${data.time}`);
      this.listener();
    } catch (error) {
      this.logger.error(`Error processing quote for ${topic}`, error);
    }
  }

  stop() {
    ServiceProvider.getInstance().liveQuoteProvider.unsubscribe(
      this.symbol,
      this.timeFrame
    );
    ServiceProvider.getInstance().liveQuoteProvider.off(
      this.topic,
      this.boundOnQuotes
    );
    this.logger.info(`Unsubscribed from ${this.topic}`);
  }
}
