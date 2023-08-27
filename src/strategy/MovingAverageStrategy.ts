import { StockFeedSimulator } from "../StockFeedSimulator";
import { Strategy } from "../Strategy";
import { Trades } from "../Trades";
import { TechnicalQuote } from "../restructureData";
import { getProps } from "../utils";

interface Config {
  upperLimit: number;
  lowerLimit: number;
  capital: number;
  riskPercentage: number;
}

const movingAverageStrategyConfig: Config = {
  upperLimit: 20,
  lowerLimit: 10,
  capital: 100000,
  riskPercentage: 5,
};

class MovingAverageStrategy extends Strategy {
  config: Config;

  constructor(
    stock: StockFeedSimulator,
    persistTradesFn: Function,
    config: Config = movingAverageStrategyConfig
  ) {
    super(stock, persistTradesFn, config.capital, config.riskPercentage);
    this.config = config;
  }

  protected override checkForStopLossHit(): {
    sellingDay: TechnicalQuote | null;
    sellingPrice: number | null;
  } {
    const { upperLimit, lowerLimit } = this.config;

    while (this.stock.move()) {
      const today = this.stock.now();
      const lowerMA = this.stock.simpleMovingAverage(lowerLimit);
      const upperMA = this.stock.simpleMovingAverage(upperLimit);
      if (lowerMA >= today.Low) {
        return { sellingDay: today, sellingPrice: lowerMA };
      }
    }
    return { sellingDay: null, sellingPrice: null };
  }

  protected override trade(): void {
    const buyingDay = this.stock.now();
    const { upperLimit, lowerLimit } = this.config;
    const initialStopLoss = this.stock.simpleMovingAverage(lowerLimit);
    if (initialStopLoss >= buyingDay.Open) return;

    const riskForOneStock = buyingDay.Open - initialStopLoss;
    const totalStocks = this.getTotalStocks(riskForOneStock, buyingDay.Open);

    const { sellingDay, sellingPrice } = this.checkForStopLossHit();
    if (sellingDay && sellingPrice) {
      this.updateTrades(
        buyingDay,
        buyingDay.Open,
        sellingDay,
        sellingPrice,
        totalStocks
      );
    }
  }

  public override execute(): Trades {
    while (this.stock.move()) {
      const { upperLimit, lowerLimit } = this.config;
      const today = this.stock.now();

      const upperLimitMA = this.stock.simpleMovingAverage(upperLimit);
      const lowerLimitMA = this.stock.simpleMovingAverage(lowerLimit);
      if (lowerLimitMA >= upperLimitMA && today.Close > lowerLimitMA) {
        this.stock.move() && this.trade();
      }
    }
    this.persistTradesFn(this.trades);
    return this.trades;
  }
}

export default {
  _class: MovingAverageStrategy,
  _config: getProps(movingAverageStrategyConfig),
};
