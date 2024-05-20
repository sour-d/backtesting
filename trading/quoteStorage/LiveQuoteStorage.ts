import LiveQuoteProvider, {
  LiveQuoteObj,
} from "../../services/LiveQuoteProvider";
import { calculateTechnical } from "../parser/restructureData";
import { ExistingQuoteStorage } from "./ExistingQuoteStorage";

export class LiveQuoteStorage extends ExistingQuoteStorage {
  protected listeners: Function[] = [];
  protected id: string;
  protected symbol: string;
  protected timeFrame: string;

  constructor(
    quotes: LiveQuoteProvider,
    startingQuoteDay: number = 1,
    id: string,
    symbol: string,
    timeFrame: string,
    name: string = ""
  ) {
    super([], startingQuoteDay, name);
    this.currentQuoteIndex = -1;
    this.id = id;
    this.symbol = symbol;
    this.timeFrame = timeFrame;

    quotes.on("Quote", ({ id, symbol, timeFrame, tick }: LiveQuoteObj) => {
      if (symbol !== this.symbol || timeFrame !== this.timeFrame) return;
      const technicalQuote = calculateTechnical(tick, this.quotes);
      this.quotes.push(technicalQuote);
      this.currentQuoteIndex++;

      if (startingQuoteDay > this.currentQuoteIndex) return;

      this.listeners.forEach((listener) => listener());
    });
  }

  subscribe(listener: Function): void {
    this.listeners.push(listener);
  }
}
