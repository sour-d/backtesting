import { ITradeOutcome } from "./ITradeOutcome";

export class TradeOutcomes {
  tradeResults: ITradeOutcome[];

  constructor(tradeResult: ITradeOutcome[]) {
    this.tradeResults = tradeResult;
  }

  totalProfitLoss(): number {
    return this.tradeResults.reduce(
      (result, { totalProfitOrLoss }) => result + totalProfitOrLoss,
      0
    );
  }

  averageExpectancy(): number {
    return this.totalProfitLoss() / this.tradeResults.length;
  }

  averageReturn(): number {
    const totalReturn = this.tradeResults.reduce(
      (result, { returnPercentage }) => result + returnPercentage,
      0
    );

    return totalReturn / this.tradeResults.length;
  }
}
