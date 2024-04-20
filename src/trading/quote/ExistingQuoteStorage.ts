import { TechnicalQuote } from "../parser/restructureData";

export class ExistingQuoteStorage {
  protected quotes: TechnicalQuote[];
  protected currentQuoteIndex: number;
  public name: string;

  constructor(
    quotes: TechnicalQuote[],
    startingQuoteDay: number = 1,
    name: string = ""
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

  dataOfLast(days: number): ExistingQuoteStorage {
    let data: TechnicalQuote[] = this.quotes.slice(0, this.currentQuoteIndex);

    if (days < this.currentQuoteIndex) {
      data = this.quotes.slice(0, this.currentQuoteIndex).slice(-days);
    }

    return new ExistingQuoteStorage(data);
  }

  highOfLast(days: number): TechnicalQuote {
    const stock: ExistingQuoteStorage = this.dataOfLast(days);

    let highestDay: any = stock.now();
    while (stock.move()) {
      if (stock.now().High > highestDay.High) {
        highestDay = stock.now();
      }
    }

    return highestDay;
  }

  lowOfLast(days: number): TechnicalQuote {
    const stock: ExistingQuoteStorage = this.dataOfLast(days);

    let lowestDay: TechnicalQuote = stock.now();
    while (stock.move()) {
      if (stock.now().Low < lowestDay.Low) {
        lowestDay = stock.now();
      }
    }

    return lowestDay;
  }

  simpleMovingAverage(days: number): number {
    const stock: ExistingQuoteStorage = this.dataOfLast(days);

    let sumOfDayCloses: number = this.now().Close;
    while (stock.move()) {
      sumOfDayCloses += stock.now().Close;
    }
    return sumOfDayCloses / days;
  }
}
