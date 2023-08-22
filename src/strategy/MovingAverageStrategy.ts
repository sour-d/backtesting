import { StockFeedSimulator } from "../StockFeedSimulator";
import { Strategy } from "../Strategy";
import { Trades } from "../Trades";
import { TechnicalQuote } from "../restructureData";

interface Config {
  upperLimit: number;
  lowerLimit: number;
  capital: number;
  riskPercentage: number;
}

export const movingAverageStrategyConfig: Config = {
  upperLimit: 200,
  lowerLimit: 40,
  capital: 100000,
  riskPercentage: 0.5,
};

class MovingAverageStrategy extends Strategy {
  config: Config;

  constructor(
    stock: StockFeedSimulator,
    persistTradesFn: Function,
    config: Config = movingAverageStrategyConfig
  ) {
    super(stock, config.capital, config.riskPercentage, persistTradesFn);
    this.config = config;
  }

  protected override checkForStopLossHit(): TechnicalQuote {
    while (this.stock.move()) {
      const today = this.stock.now();
      const fortyDayMA = this.stock.simpleMovingAverage(this.config.lowerLimit);
      const twoHundredDayMA = this.stock.simpleMovingAverage(
        this.config.upperLimit
      );
      if (today.Low <= fortyDayMA || twoHundredDayMA >= fortyDayMA) {
        return today;
      }
    }
    return this.stock.now();
  }

  protected override trade(): void {
    const buyingDay = this.stock.now();
    const initialStopLoss = this.stock.simpleMovingAverage(
      this.config.lowerLimit
    );
    const sellingDay = this.checkForStopLossHit();

    const riskForOneStock = buyingDay.High - initialStopLoss;
    const totalStocks = this.getTotalStocks(riskForOneStock, buyingDay.High);

    this.updateTrades(buyingDay, sellingDay, initialStopLoss, totalStocks);
  }

  public override execute(): Trades {
    while (this.stock.hasData()) {
      const previousDayUpperLimitMA = this.stock.simpleMovingAverage(
        this.config.upperLimit
      );
      const previousDayLowerLimitMA = this.stock.simpleMovingAverage(
        this.config.lowerLimit
      );
      const today = this.stock.move();
      if (previousDayUpperLimitMA > previousDayLowerLimitMA) {
        const upperLimitMA = this.stock.simpleMovingAverage(
          this.config.upperLimit
        );
        const lowerLimitMA = this.stock.simpleMovingAverage(
          this.config.lowerLimit
        );
        if (lowerLimitMA >= upperLimitMA) this.trade();
      }
    }
    this.persistTradesFn(this.trades.toCSV());
    return this.trades;
  }
}

export { MovingAverageStrategy };
