export class ExistingQuoteStorage {
  quotes;
  currentQuoteIndex;
  name;
  logger;

  constructor(quotes, startingQuoteDay = 1, stockName = "", loggerInstance = null) {
    this.quotes = quotes;
    this.currentQuoteIndex = startingQuoteDay - 1;
    this.name = stockName;
    this.logger = loggerInstance;
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
    
    // Use logger if available, otherwise fallback to console.log
    const log = this.logger || {
      debug: console.log,
      info: console.log,
      warn: console.warn,
      error: console.error
    };
    
    log.debug(
      `dataOfLast: days=${days}, currentIndex=${this.currentQuoteIndex}, dataLength=${data.length}, quotesLength=${this.quotes.length}`
    );

    if (days < this.currentQuoteIndex) {
      data = this.quotes.slice(0, this.currentQuoteIndex).slice(-days);
    }
    log.debug(`dataOfLast result: days=${days}, dataLength=${data.length}, quotesLength=${this.quotes.length}`);

    return new ExistingQuoteStorage(data);
  }

  highOfLast(days) {
    // Use logger if available, otherwise fallback to console.log
    const log = this.logger || {
      debug: console.log,
      info: console.log,
      warn: console.warn,
      error: console.error
    };
    
    log.debug(`Finding highest day in last ${days} days`);
    const stock = this.dataOfLast(days);
    
    let highestDay = stock.now();
    log.debug(`Initial highest day: ${highestDay.date} with high ${highestDay.high}`);
    
    while (stock.move()) {
      if (stock.now().high > highestDay.high) {
        log.debug(`New highest day found: ${stock.now().date} with high ${stock.now().high} (previous: ${highestDay.high})`);
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
