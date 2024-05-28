import dayjs from "dayjs";
import {
  addTechnicalIndicator,
  addTechnicalIndicatorToLastQuote,
} from "../parser/restructureData";
import ServiceProvider from "../services/ServiceProvider";
import { ExistingQuoteStorage } from "./ExistingQuoteStorage";
import { fetchHistoricalData } from "../stock_data/downloader";

const fetchInitialData = async (symbol, timeFrame, startingQuoteDay) => {
  const end = dayjs();
  const start = end.subtract(startingQuoteDay, "minutes");
  const data = await fetchHistoricalData(symbol, timeFrame, start, end);
  console.log("fetched initial data", data.length);
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

        ServiceProvider.getInstance().liveQuoteProvider.on(
          this.topic,
          this.onQuotes.bind(this)
        );
      });
  }

  onQuotes({ type, data, topic }) {
    console.log(
      "got a data inside LiveQuoteStorage",
      JSON.stringify(data, null, 2)
    );
    if (topic !== this.topic) return;
    const technicalQuote = addTechnicalIndicatorToLastQuote(data, this.quotes);
    console.log({ technicalQuote });
    this.quotes.push(technicalQuote);
    this.currentQuoteIndex++;

    this.listener();
  }
}
