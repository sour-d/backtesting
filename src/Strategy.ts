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
    this.trades = new Trades(
      this.capital,
      this.riskPercentage,
      this.stock.name
    );
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
    return this.capital * (this.riskPercentage / 100);
  }

  // risk should calculated properly, eg, not have enough money to buy all stock
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

  // needs to implement
  //    trade(),
  //    checkForStopLossHit(),
  //    execute()

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

interface CurrentTradeInfo {
  buyingDay: TechnicalQuote;
  buyingPrice: number;
  position: number;
  risk: number;
}

class _Strategy {
  stock: StockFeedSimulator;
  capital: number;
  riskPercentage: number;
  trades: Trades;
  persistTradesFn: Function;
  protected bought: boolean;
  protected currentTradeInfo: CurrentTradeInfo | null;
  protected risk: number;

  protected constructor(
    stock: StockFeedSimulator,
    persistTradesFn: Function,
    capital: number = 100000,
    riskPercentage: number = 0.05
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
  }

  protected stocksCanBeBought(
    riskForOneStock: number,
    buyingPrice: number
  ): number {
    const numberOfStocksUnderRisk = Math.floor(this.risk / riskForOneStock);
    const totalCost = numberOfStocksUnderRisk * buyingPrice;

    if (totalCost <= this.capital) {
      return numberOfStocksUnderRisk;
    }

    return Math.floor(this.capital / buyingPrice);
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

  public execute(): Trades {
    while (this.stock.hasData() && this.stock.move()) {
      if (this.alreadyTookPosition()) this.sell();
      else this.buy();
    }
    this.persistTradesFn(this.trades);
    return this.trades;
  }
}

export { Strategy, _Strategy };
