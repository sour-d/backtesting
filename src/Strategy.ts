import { ITradeOutcome } from "./ITradeOutcome";
import { Quote, StockFeedSimulator } from "./StockFeedSimulator";
import { TradeOutcomes } from "./TradeOutcome";

class Strategy {
  stock: StockFeedSimulator;
  capital: number;
  riskPercentage: number;
  trades: TradeOutcomes;
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
    this.trades = new TradeOutcomes();
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

  getExpectancy(): { averageExpectancy: number; averageReturn: number } {
    const tradeOutcomes = this.execute();
    const totalCount = tradeOutcomes.length;
    const aggregateExpectancy = tradeOutcomes.reduce(
      (result, tradeOutcome) => {
        result.totalExpectancy += tradeOutcome.riskMultiple;
        result.totalReturn += tradeOutcome.returnPercentage;
        return result;
      },
      { totalExpectancy: 0, totalReturn: 0 } as {
        totalExpectancy: number;
        totalReturn: number;
      }
    );
    return {
      averageExpectancy: aggregateExpectancy.totalExpectancy / totalCount,
      averageReturn: aggregateExpectancy.totalReturn / totalCount,
    };
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

  execute(): ITradeOutcome[] {
    throw new Error("Method not implemented.");
  }
}

export { Strategy };
