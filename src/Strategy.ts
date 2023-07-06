import { ITradeOutcome } from "./ITradeOutcome";
import { Quote, StockFeedSimulator } from "./StockFeedSimulator";
import { Trades } from "./Trades";

class Strategy {
  stock: StockFeedSimulator;
  capital: number;
  riskPercentage: number;
  trades: Trades;
  persistTradesFn: Function;

  constructor(
    stock: StockFeedSimulator,
    capital: number,
    riskPercentage: number,
    persistTradesFn: Function
  ) {
    this.stock = stock;
    this.capital = capital;

    this.riskPercentage = riskPercentage; // riskPercentage stored as fraction like 2/100, not 2%
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
    buyingDay: Quote,
    sellingDay: Quote,
    initialStopLoss: number,
    totalStocks: number
  ): void {
    this.trades.addTradeResult(
      buyingDay,
      sellingDay,
      initialStopLoss,
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

  protected checkForStopLossHit(): Quote {
    throw new Error("Method not implemented.");
  }

  execute(): Trades {
    throw new Error("Method not implemented.");
  }
}

export { Strategy };
