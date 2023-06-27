interface Day {
  High: number;
  Low: number;
  Close: number;
  Date: Date;
  Volume: number;
}

class StockSimulator {
  #pastData: Day[];
  #currentDayIndex: number;

  constructor(data: Day[], currentDay: number = 1) {
    if (data.length < 1) {
      throw new Error("Data must be at least 1 day long for stock simulator");
    }
    this.#pastData = data;
    this.#currentDayIndex = currentDay - 1;
  }

  hasData(): boolean {
    return this.#pastData.length - 1 > this.#currentDayIndex;
  }

  today(): Day {
    return this.#pastData[this.#currentDayIndex];
  }

  nextDay(): Day | undefined {
    if (this.hasData()) {
      this.#currentDayIndex++;
      return this.today();
    }
  }

  dataOfLast(days: number): StockSimulator {
    const data: any[] = this.#pastData
      .slice(0, this.#currentDayIndex)
      .slice(-days);
    return new StockSimulator(data);
  }

  highOfLast(days: number): Day {
    const stock: StockSimulator = this.dataOfLast(days);

    let highestDay: any = stock.today();
    while (stock.nextDay()) {
      if (stock.today().High > highestDay.High) {
        highestDay = stock.today();
      }
    }

    return highestDay;
  }

  lowOfLast(days: number): Day {
    const stock: StockSimulator = this.dataOfLast(days);

    let lowestDay: Day = stock.today();
    while (stock.nextDay()) {
      if (stock.today().Low < lowestDay.Low) {
        lowestDay = stock.today();
      }
    }

    return lowestDay;
  }

  simpleMovingAverage(days: number): number {
    const stock: StockSimulator = this.dataOfLast(days);

    let sumOfDayCloses: number = this.today().Close;
    while (stock.nextDay()) {
      sumOfDayCloses += stock.today().Close;
    }
    return sumOfDayCloses / days;
  }
}

export { StockSimulator, Day };
