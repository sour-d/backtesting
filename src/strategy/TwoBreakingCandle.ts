import { StockFeedSimulator } from "../StockFeedSimulator";
import { Strategy } from "../Strategy";
import { Trades } from "../Trades";
import { TechnicalQuote } from "../restructureData";

class TwoBreakingCandle extends Strategy {
  constructor(
    stock: StockFeedSimulator,
    capital: number,
    riskPercentage: number,
    persistTradesFn: Function
  ) {
    super(stock, capital, riskPercentage, persistTradesFn);
  }

  protected override checkForStopLossHit(): TechnicalQuote {
    let yesterday = this.stock.now();
    while (this.stock.move()) {
      const today = this.stock.now();
      if (today.Low <= yesterday.Low) {
        return today;
      }
    }
    return this.stock.now();
  }

  protected override trade(): void {
    const breakingDay = this.stock.now();
    this.stock.move();
    const buyingDay = this.stock.now();
    const initialStopLoss = breakingDay.Low;
    const riskForOneStock = buyingDay.High - initialStopLoss;
    
    if (riskForOneStock <= 0) {
      return;
    }

    const sellingDay = this.checkForStopLossHit();
    const totalStocks = this.getTotalStocks(riskForOneStock, buyingDay.High);

    // store result
    this.updateTrades(buyingDay, sellingDay, initialStopLoss, totalStocks);
  }

  private isGreenCandle(quote: TechnicalQuote): boolean {
    return quote["CandleBody"] > 0;
  }

  public override execute(): Trades {
    let yesterday = this.stock.now();
    while (this.stock.move()) {
      const today = this.stock.now();

      if (this.isGreenCandle(yesterday) && this.isGreenCandle(today)) this.trade();
      yesterday = today;
    }
    this.persistTradesFn(this.trades.toCSV());
    return this.trades;
  }
}

export { TwoBreakingCandle };
