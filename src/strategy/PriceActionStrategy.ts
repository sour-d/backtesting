import { log } from "console";
import { Quote, ExistingQuoteManager, LiveQuoteManager } from "../QuoteManager";
import { Strategy } from "../Strategy";
import { getProps } from "../utils";
import { TechnicalQuote } from "../restructureData";

interface Config {
  capital: number;
  riskPercentage: number;
}
const priceActionStrategyConfig: Config = {
  capital: 100000,
  riskPercentage: 2,
};

interface DemandZone {
  professionalCandle: Quote;
  High: number;
  Low: number;
}

class PriceActionStrategy extends Strategy {
  config: Config;
  demandZones: Array<DemandZone | null>;

  constructor(
    stock: ExistingQuoteManager | LiveQuoteManager,
    persistTradesFn: Function,
    config: Config = priceActionStrategyConfig,
  ) {
    super(stock, persistTradesFn, config.capital, config.riskPercentage);
    this.config = config;
    this.demandZones = Array(15).fill(null);
  }

  private isProfessionalCandle(candle: Quote, prevCandle: Quote): boolean {
    const prevCandleTotalHeight = prevCandle.High - prevCandle.Low;
    const isBodyLarge = candle.Close - candle.Open > prevCandleTotalHeight;

    return isBodyLarge;
  }

  protected override sell(): void {
    const sellingPrice = this.stock.lowOfLast(4).Low;
    if (this.stock.now().Low < sellingPrice) {
      this.exitPosition(sellingPrice);
    }
  }

  protected anyZoneTested(today: TechnicalQuote): DemandZone | null {
    return (
      this.demandZones.reverse().find((zone) => {
        if (!zone) return false;
        return today.Low < zone?.High && today.Low > zone?.Low;
      }) || null
    );
  }

  protected buyIfAnyZoneTested = (today: TechnicalQuote): void => {
    const zone = this.anyZoneTested(today);

    if (zone && !this.currentTradeInfo?.position) {
      const buyingPrice = zone.High;
      const riskForOneStock = buyingPrice - zone.Low;
      this.takePosition(riskForOneStock, buyingPrice);
      return;
    }
  };

  protected addIfNewZoneCreated = (
    today: TechnicalQuote,
    prev: TechnicalQuote,
  ): void => {
    let newZone = null;
    if (this.isProfessionalCandle(today, prev)) {
      newZone = {
        professionalCandle: today,
        High: this.stock.highOfLast(3).High,
        Low: this.stock.lowOfLast(3).Low,
      };
    }
    this.demandZones.push(newZone);
    this.demandZones = this.demandZones.slice(-20);
  };

  protected override buy(): void {
    const prev = this.stock.prev();
    const today = this.stock.now();

    // buying if any zone has been tested
    this.buyIfAnyZoneTested(today);

    // checking and adding new demand zones
    this.addIfNewZoneCreated(today, prev);
  }
}

export default {
  _class: PriceActionStrategy,
  _config: getProps(priceActionStrategyConfig),
};
