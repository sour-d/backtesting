interface Quote {
  High: number;
  Low: number;
  Close: number;
  Date: Date;
  Volume: number;
}

class StockFeedSimulator {
  #quotes: Quote[];
  #currentDayIndex: number;

  constructor(data: Quote[], startingQuoteDay: number = 1) {
    if (data.length < 1) {
      throw new Error("Data must be at least 1 day long for stock simulator");
    }
    this.#quotes = data;
    this.#currentDayIndex = startingQuoteDay - 1;
  }

  hasData(): boolean {
    return this.#quotes.length - 1 > this.#currentDayIndex;
  }

  today(): Quote {
    return this.#quotes[this.#currentDayIndex];
  }

  nextDay(): Quote | undefined {
    if (this.hasData()) {
      this.#currentDayIndex++;
      return this.today();
    }
  }

  dataOfLast(days: number): StockFeedSimulator {
    const data: any[] = this.#quotes
      .slice(0, this.#currentDayIndex)
      .slice(-days);
    return new StockFeedSimulator(data);
  }

  highOfLast(days: number): Quote {
    const stock: StockFeedSimulator = this.dataOfLast(days);

    let highestDay: any = stock.today();
    while (stock.nextDay()) {
      if (stock.today().High > highestDay.High) {
        highestDay = stock.today();
      }
    }

    return highestDay;
  }

  lowOfLast(days: number): Quote {
    const stock: StockFeedSimulator = this.dataOfLast(days);

    let lowestDay: Quote = stock.today();
    while (stock.nextDay()) {
      if (stock.today().Low < lowestDay.Low) {
        lowestDay = stock.today();
      }
    }

    return lowestDay;
  }

  simpleMovingAverage(days: number): number {
    const stock: StockFeedSimulator = this.dataOfLast(days);

    let sumOfDayCloses: number = this.today().Close;
    while (stock.nextDay()) {
      sumOfDayCloses += stock.today().Close;
    }
    return sumOfDayCloses / days;
  }
}

export { StockFeedSimulator, Quote };
