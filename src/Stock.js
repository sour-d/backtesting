class Stock {
  #pastData;
  #currentDayIndex;

  constructor(data, currentDay = 1) {
    this.#pastData = data;
    this.#currentDayIndex = currentDay - 1;
  }

  hasData() {
    return this.#pastData.length - 1 > this.#currentDayIndex;
  }

  today() {
    return this.#pastData[this.#currentDayIndex];
  }

  nextDay() {
    if (this.hasData()) {
      this.#currentDayIndex++;
      return this.today();
    }
  }

  dataOfLast(days) {
    const data = this.#pastData.slice(0, this.#currentDayIndex).slice(-days);
    return new Stock(data);
  }

  highOfLast(days) {
    const stock = this.dataOfLast(days);

    let highestDay = stock.today();
    while (stock.nextDay()) {
      if (stock.today().High > highestDay.High) {
        highestDay = stock.today();
      }
    }

    return highestDay;
  }

  lowOfLast(days) {
    const stock = this.dataOfLast(days);

    let lowestDay = stock.today();
    while (stock.nextDay()) {
      if (stock.today().Low < lowestDay.Low) {
        lowestDay = stock.today();
      }
    }

    return lowestDay;
  }
}

module.exports = { Stock };
