import { TechnicalQuote } from "./restructureData";

interface Quote {
  Open: number;
  High: number;
  Low: number;
  Close: number;
  Date: string;
  Volume: number;
  "Adj Close": number;
}

class StockFeedSimulator {
  #quotes: TechnicalQuote[];
  #currentQuoteIndex: number;
  name: string;

  constructor(
    data: TechnicalQuote[],
    startingQuoteDay: number = 1,
    name: string = ""
  ) {
    if (data.length < 1) {
      throw new Error("Data must be at least 1 day long for stock simulator");
    }
    this.#quotes = data;
    this.#currentQuoteIndex = startingQuoteDay - 1;
    this.name = name;
  }

  hasData(): boolean {
    return this.#quotes.length - 1 > this.#currentQuoteIndex;
  }

  now(): TechnicalQuote {
    return this.#quotes[this.#currentQuoteIndex];
  }

  move(): TechnicalQuote | undefined {
    if (this.hasData()) {
      this.#currentQuoteIndex++;
      return this.now();
    }
  }

  dataOfLast(days: number): StockFeedSimulator {
    let data: any[] = this.#quotes.slice(0, this.#currentQuoteIndex);

    if (days < this.#currentQuoteIndex) {
      data = this.#quotes.slice(0, this.#currentQuoteIndex).slice(-days);
    }

    return new StockFeedSimulator(data);
  }

  highOfLast(days: number): TechnicalQuote {
    const stock: StockFeedSimulator = this.dataOfLast(days);

    let highestDay: any = stock.now();
    while (stock.move()) {
      if (stock.now().High > highestDay.High) {
        highestDay = stock.now();
      }
    }

    return highestDay;
  }

  lowOfLast(days: number): TechnicalQuote {
    const stock: StockFeedSimulator = this.dataOfLast(days);

    let lowestDay: TechnicalQuote = stock.now();
    while (stock.move()) {
      if (stock.now().Low < lowestDay.Low) {
        lowestDay = stock.now();
      }
    }

    return lowestDay;
  }

  simpleMovingAverage(days: number): number {
    const stock: StockFeedSimulator = this.dataOfLast(days);

    let sumOfDayCloses: number = this.now().Close;
    while (stock.move()) {
      sumOfDayCloses += stock.now().Close;
    }
    return sumOfDayCloses / days;
  }
}

export { StockFeedSimulator, Quote };
