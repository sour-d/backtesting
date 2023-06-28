import { ITradeOutcome } from "../ITradeOutcome";
import { Quote, StockFeedSimulator } from "../StockFeedSimulator";
import { Strategy } from "../Strategy";

const LOWER_LIMIT = 40;
const UPPER_LIMIT = 200;

class MovingAverageStrategy extends Strategy {
  constructor(
    stock: StockFeedSimulator,
    capital: number,
    riskPercentage: number,
    persistTradesFn: Function
  ) {
    super(stock, capital, riskPercentage, persistTradesFn);
  }

  protected override checkForStopLossHit(): Quote {
    while (this.stock.nextDay()) {
      const today = this.stock.today();
      const fortyDayMA = this.stock.simpleMovingAverage(LOWER_LIMIT);
      const twoHundredDayMA = this.stock.simpleMovingAverage(UPPER_LIMIT);
      if (today.Low <= fortyDayMA || twoHundredDayMA >= fortyDayMA) {
        return today;
      }
    }
    return this.stock.today();
  }

  protected override trade(): void {
    const buyingDay = this.stock.today();
    const initialStopLoss = this.stock.simpleMovingAverage(LOWER_LIMIT);
    const sellingDay = this.checkForStopLossHit();

    const riskForOneStock = buyingDay.High - initialStopLoss;
    const totalStocks = this.getTotalStocks(riskForOneStock, buyingDay.High);

    this.updateTrades(buyingDay, sellingDay, initialStopLoss, totalStocks);
  }

  public override execute(): ITradeOutcome[] {
    const tradeOutcomes: ITradeOutcome[] = [];
    while (this.stock.hasData()) {
      const previousDayUpperLimitMA =
        this.stock.simpleMovingAverage(UPPER_LIMIT);
      const previousDayLowerLimitMA =
        this.stock.simpleMovingAverage(LOWER_LIMIT);
      const today = this.stock.nextDay();
      if (previousDayUpperLimitMA > previousDayLowerLimitMA) {
        const upperLimitMA = this.stock.simpleMovingAverage(UPPER_LIMIT);
        const lowerLimitMA = this.stock.simpleMovingAverage(LOWER_LIMIT);
        if (lowerLimitMA >= upperLimitMA) this.trade();
      }
    }
    this.persistTradesFn(JSON.stringify(this.trades));
    return tradeOutcomes;
  }
}

export { MovingAverageStrategy };
