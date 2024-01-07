import { log } from "console";
import { ExistingQuoteManager, LiveQuoteManager } from "./QuoteManager";
import { Trades } from "./Trades";
import { TechnicalQuote } from "./restructureData";
import EventEmitter from "events";
const { exec } = require("child_process");

interface CurrentTradeInfo {
  buyingDay: TechnicalQuote;
  buyingPrice: number;
  position: number;
  risk: number;
}

class Strategy extends EventEmitter {
  stock: ExistingQuoteManager | LiveQuoteManager;
  capital: number;
  riskPercentage: number;
  trades: Trades;
  persistTradesFn: Function;
  protected bought: boolean;
  protected currentTradeInfo: CurrentTradeInfo | null;
  protected risk: number;
  protected fractionBuy: boolean;
  protected isLive: boolean;

  protected constructor(
    stock: ExistingQuoteManager | LiveQuoteManager,
    persistTradesFn: Function,
    capital: number = 100000,
    riskPercentage: number = 5,
    fractionBuy: boolean = false
  ) {
    super();
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
    this.isLive = stock instanceof LiveQuoteManager;
  }

  protected stocksCanBeBought(
    riskForOneStock: number,
    buyingPrice: number
  ): number {
    log({ riskForOneStock, buyingPrice });
    const maxStocksByCapital = this.capital / buyingPrice;
    const maxStocksByRisk = this.risk / riskForOneStock;

    const totalCost = maxStocksByRisk * buyingPrice;
    const affordableStocks: number =
      totalCost <= this.capital ? maxStocksByRisk : maxStocksByCapital;
    log({ affordableStocks, totalCost, maxStocksByRisk, maxStocksByCapital });

    if (this.fractionBuy) {
      return +affordableStocks.toFixed(2) - 0.01;
    }

    return Math.floor(affordableStocks);
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

    this.emit("buy", {
      quantity: position,
      price: buyingPrice,
      risk,
      time: this.stock.now().Date,
    });
    // this.isLive && exec("afplay ./public/start.mp3", () => {});
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

    this.emit("sell", {
      quantity: this.currentTradeInfo.position,
      price: sellingPrice,
      time: this.stock.now().Date,
    });

    this.bought = false;
    this.currentTradeInfo = null;

    // this.isLive && exec("afplay ./public/end.mp3", () => {});
  }

  protected trade(): void {
    if (this.alreadyTookPosition()) this.sell();
    else this.buy();
    console.log("will emit now");

    this.emit("data", this.stock.now());
  }

  public execute(): void {
    if (this.stock instanceof LiveQuoteManager) {
      this.stock.subscribe(() => this.trade());
      const intervalId = setInterval(() => {
        const trades = this.trades.flush();
        if (trades) this.persistTradesFn(trades);
      }, 5000);
      return;
    }

    if (this.stock instanceof ExistingQuoteManager) {
      while (this.stock.hasData() && this.stock.move()) {
        this.trade();
      }
      this.persistTradesFn(this.trades);
    }
  }
}

export { Strategy };
