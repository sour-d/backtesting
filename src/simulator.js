class Simulator {
  #pastData;
  #currentDay;

  constructor(data, currentDay = 1) {
    this.#pastData = data;
    this.#currentDay = currentDay - 1;
  }

  hasData() {
    return this.#pastData.length - 1 > this.#currentDay;
  }

  today() {
    return this.#pastData[this.#currentDay];
  }

  nextDay() {
    this.#currentDay++;
    // return this.today();
  }

  dataOfLast(days) {
    const data = this.#pastData.slice(0, this.#currentDay + 1).slice(-days);
    return new Simulator(data);
  }

  highOfLast(days) {
    const stock = this.dataOfLast(days);

    let highestDay = stock.today();
    while (stock.hasData()) {
      stock.nextDay();
      if (stock.today().High > highestDay.High) {
        highestDay = stock.today();
      }
    }

    return highestDay;
  }

  lowOfLast(days) {
    const stock = this.dataOfLast(days);

    let lowestDay = stock.today();
    while (stock.hasData()) {
      stock.nextDay();
      if (stock.today().Low < lowestDay.Low) {
        lowestDay = stock.today();
      }
    }

    return lowestDay;
  }
}

module.exports = { Simulator };