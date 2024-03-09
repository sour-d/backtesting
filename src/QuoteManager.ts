import { log } from "console";
import LiveQuote from "./LiveQuote";
import { TechnicalQuote, calculateTechnicals } from "./restructureData";

export interface Quote {
  Open: number;
  High: number;
  Low: number;
  Close: number;
  Date: string;
  Volume: number;
}

export class ExistingQuoteManager {
  protected quotes: TechnicalQuote[];
  protected currentQuoteIndex: number;
  public name: string;

  constructor(
    quotes: TechnicalQuote[],
    startingQuoteDay: number = 1,
    name: string = "",
  ) {
    this.quotes = quotes;
    this.currentQuoteIndex = startingQuoteDay - 1;
    this.name = name;
  }

  hasData(): boolean {
    return this.quotes.length - 1 > this.currentQuoteIndex;
  }

  now(): TechnicalQuote {
    return this.quotes[this.currentQuoteIndex];
  }

  prev(quoteCount: number = 1): TechnicalQuote {
    return this.quotes[this.currentQuoteIndex - quoteCount];
  }

  move(): TechnicalQuote | undefined {
    if (this.hasData()) {
      this.currentQuoteIndex++;
      return this.now();
    }
  }

  dataOfLast(days: number): ExistingQuoteManager {
    let data: TechnicalQuote[] = this.quotes.slice(0, this.currentQuoteIndex);

    if (days < this.currentQuoteIndex) {
      data = this.quotes.slice(0, this.currentQuoteIndex).slice(-days);
    }

    return new ExistingQuoteManager(data);
  }

  highOfLast(days: number): TechnicalQuote {
    const stock: ExistingQuoteManager = this.dataOfLast(days);

    let highestDay: any = stock.now();
    while (stock.move()) {
      if (stock.now().High > highestDay.High) {
        highestDay = stock.now();
      }
    }

    return highestDay;
  }

  lowOfLast(days: number): TechnicalQuote {
    const stock: ExistingQuoteManager = this.dataOfLast(days);

    let lowestDay: TechnicalQuote = stock.now();
    while (stock.move()) {
      if (stock.now().Low < lowestDay.Low) {
        lowestDay = stock.now();
      }
    }

    return lowestDay;
  }

  simpleMovingAverage(days: number): number {
    const stock: ExistingQuoteManager = this.dataOfLast(days);

    let sumOfDayCloses: number = this.now().Close;
    while (stock.move()) {
      sumOfDayCloses += stock.now().Close;
    }
    return sumOfDayCloses / days;
  }
}

export class LiveQuoteManager extends ExistingQuoteManager {
  protected listeners: Function[] = [];

  constructor(
    quotes: LiveQuote,
    startingQuoteDay: number = 1,
    name: string = "",
  ) {
    super([], startingQuoteDay, name);
    this.currentQuoteIndex = -1;

    quotes.on("Quote", (quote: Quote) => {
      const technicalQuote = calculateTechnicals(quote, this.quotes);
      this.quotes.push(technicalQuote);
      this.currentQuoteIndex++;

      if (startingQuoteDay > this.currentQuoteIndex) return;

      this.listeners.forEach((listener) => listener());
      log("got a quote at ", new Date().toLocaleTimeString());
    });
  }

  subscribe(listener: Function): void {
    this.listeners.push(listener);
  }
}
