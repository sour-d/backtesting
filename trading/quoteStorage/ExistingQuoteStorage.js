export class ExistingQuoteStorage {
  quotes;
  currentQuoteIndex;
  name;

  constructor(quotes, startingQuoteDay = 1, stockName = "") {
    this.quotes = quotes;
    this.currentQuoteIndex = startingQuoteDay - 1;
    this.name = stockName;
  }

  hasData() {
    return this.quotes.length - 1 > this.currentQuoteIndex;
  }

  now() {
    return this.quotes[this.currentQuoteIndex];
  }

  prev(quoteCount = 1) {
    return this.quotes[this.currentQuoteIndex - quoteCount];
  }

  move() {
    if (this.hasData()) {
      this.currentQuoteIndex++;
      return this.now();
    }
  }

  dataOfLast(days) {
    let data = this.quotes.slice(0, this.currentQuoteIndex);
    console.log(
      "dataOfLast",
      days,
      this.currentQuoteIndex,
      data.length,
      this.quotes.length,
      this.quotes,
      data
    );

    if (days < this.currentQuoteIndex) {
      data = this.quotes.slice(0, this.currentQuoteIndex).slice(-days);
    }
    console.log("dataOfLast", days, data.length, this.quotes.length);

    return new ExistingQuoteStorage(data);
  }

  highOfLast(days) {
    console.log("highOfLast", days);
    const stock = this.dataOfLast(days);
    console.log("stock", stock);

    let highestDay = stock.now();
    console.log("highestDay", highestDay);
    while (stock.move()) {
      if (stock.now().high > highestDay.high) {
        console.log("got one higher day", stock.now().high, highestDay.high);
        highestDay = stock.now();
      }
    }

    return highestDay;
  }

  lowOfLast(days) {
    const stock = this.dataOfLast(days);

    let lowestDay = stock.now();
    while (stock.move()) {
      if (stock.now().low < lowestDay.low) {
        lowestDay = stock.now();
      }
    }

    return lowestDay;
  }

  simpleMovingAverage(days) {
    const stock = this.dataOfLast(days);

    let sumOfDayCloses = this.now().close;
    while (stock.move()) {
      sumOfDayCloses += stock.now().close;
    }
    return sumOfDayCloses / days;
  }
}
