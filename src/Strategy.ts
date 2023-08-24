import { StockFeedSimulator } from "./StockFeedSimulator";
import { Trades } from "./Trades";
import { TechnicalQuote } from "./restructureData";

class Strategy {
  stock: StockFeedSimulator;
  capital: number;
  riskPercentage: number;
  trades: Trades;
  persistTradesFn: Function;

  protected constructor(
    stock: StockFeedSimulator,
    persistTradesFn: Function,
    capital: number = 100000,
    riskPercentage: number = 0.05
  ) {
    this.stock = stock;
    this.capital = capital;

    this.riskPercentage = riskPercentage;
    this.trades = new Trades();
    this.persistTradesFn = persistTradesFn;
  }

  protected getTotalStocks(
    riskForOneStock: number,
    buyingPrice: number
  ): number {
    const risk = this.getRisk();
    const numberOfStocksUnderRisk = Math.floor(risk / riskForOneStock);
    const totalCost = numberOfStocksUnderRisk * buyingPrice;
    if (totalCost <= this.capital) {
      return numberOfStocksUnderRisk;
    }

    return Math.floor(this.capital / buyingPrice);
  }

  persistTrades(): void {
    this.persistTradesFn(JSON.stringify(this.trades));
  }

  getRisk(): number {
    return this.capital * this.riskPercentage;
  }

  protected updateTrades(
    buyingDay: TechnicalQuote,
    sellingDay: TechnicalQuote,
    sellingPrice: number,
    totalStocks: number
  ): void {
    this.trades.addTradeResult(
      buyingDay,
      sellingDay,
      sellingPrice,
      totalStocks,
      this.getRisk(),
      this.capital
    );
  }

  // needs to implement
  // trade(),
  // checkForStopLossHit() and
  // execute()

  protected trade(): void {
    throw new Error("Method not implemented.");
  }

  protected checkForStopLossHit(): {
    sellingDay: TechnicalQuote | null;
    sellingPrice: number | null;
  } {
    throw new Error("Method not implemented.");
  }

  execute(): Trades {
    throw new Error("Method not implemented.");
  }
}

// const strategies = {
//   FortyTwentyStrategy: FortyTwentyStrategy.config,
//   // "MovingAverageStrategy",
//   // "TwoBreakingCandle",
// };

export { Strategy };
