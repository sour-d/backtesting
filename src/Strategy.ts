import { ExistingQuoteManager, LiveQuoteManager } from "./QuoteManager";
import { Trades } from "./Trades";
import { TechnicalQuote } from "./restructureData";

interface CurrentTradeInfo {
  buyingDay: TechnicalQuote;
  buyingPrice: number;
  position: number;
  risk: number;
}

class Strategy {
  stock: ExistingQuoteManager | LiveQuoteManager;
  capital: number;
  riskPercentage: number;
  trades: Trades;
  persistTradesFn: Function;
  protected bought: boolean;
  protected currentTradeInfo: CurrentTradeInfo | null;
  protected risk: number;
  protected fractionBuy: boolean;

  protected constructor(
    stock: ExistingQuoteManager | LiveQuoteManager,
    persistTradesFn: Function,
    capital: number = 100000,
    riskPercentage: number = 5,
    fractionBuy: boolean = false
  ) {
    this.stock = stock;
    this.capital = capital;
    this.riskPercentage = riskPercentage;
    this.trades = new Trades(
      this.capital,
      this.riskPercentage,
      this.stock.name
    );
    this.persistTradesFn = persistTradesFn;
    this.bought = false;
    this.currentTradeInfo = null;
    this.risk = this.capital * (this.riskPercentage / 100);

    this.fractionBuy = fractionBuy;
  }

  protected stocksCanBeBought(
    riskForOneStock: number,
    buyingPrice: number
  ): number {
    const maxStocksByCapital = this.capital / buyingPrice;
    const maxStocksByRisk = this.risk / riskForOneStock;

    const totalCost = maxStocksByRisk * buyingPrice;
    const affordableStocks: number =
      totalCost <= this.capital ? maxStocksByRisk : maxStocksByCapital;

    if (this.fractionBuy) {
      return +affordableStocks.toFixed(2) - 0.01;
    }

    return Math.floor(affordableStocks);
  }

  persistTrades(): void {
    this.persistTradesFn(JSON.stringify(this.trades));
  }

  protected updateTrades(
    buyingDay: TechnicalQuote,
    buyingPrice: number,
    sellingDay: TechnicalQuote,
    sellingPrice: number,
    totalStocks: number,
    risk: number
  ): void {
    this.trades.addTradeResult(
      buyingDay,
      buyingPrice,
      sellingDay,
      sellingPrice,
      totalStocks,
      risk
    );
  }

  protected buy(): void {
    throw new Error("Method not implemented.");
  }

  protected sell(): void {
    throw new Error("Method not implemented.");
  }

  protected alreadyTookPosition(): boolean {
    return this.bought && !!this.currentTradeInfo?.position;
  }

  protected takePosition(risk: number, buyingPrice: number): void {
    const position = this.stocksCanBeBought(risk, buyingPrice);
    this.capital -= position * buyingPrice;
    this.bought = true;
    this.currentTradeInfo = {
      buyingDay: this.stock.now(),
      buyingPrice,
      position,
      risk,
    };
  }

  protected exitPosition(sellingPrice: number): void {
    if (!this.currentTradeInfo) return;

    this.capital += this.currentTradeInfo.position * sellingPrice;
    this.currentTradeInfo &&
      this.updateTrades(
        this.currentTradeInfo.buyingDay,
        this.currentTradeInfo.buyingPrice,
        this.stock.now(),
        sellingPrice,
        this.currentTradeInfo.position,
        this.currentTradeInfo.risk * this.currentTradeInfo.position
      );

    this.bought = false;
    this.currentTradeInfo = null;
  }

  protected trade(): void {
    if (this.alreadyTookPosition()) this.sell();
    else this.buy();
  }

  public execute(): void {
    if (this.stock instanceof ExistingQuoteManager) {
      while (this.stock.hasData() && this.stock.move()) {
        this.trade();
      }
      this.persistTradesFn(this.trades);
    }

    if (this.stock instanceof LiveQuoteManager) {
      this.stock.subscribe(() => this.trade());
      const intervalId = setInterval(() => {
        this.persistTradesFn(this.trades.flush());
      }, 5000);
    }
  }
}

export { Strategy };
