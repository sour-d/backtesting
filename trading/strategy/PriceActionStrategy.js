import { Strategy } from "./Strategy.js";

class PriceActionStrategy extends Strategy {
  config;
  demandZones;

  constructor(stockName, persistTradesFn, config = this.getDefaultConfig()) {
    super(stockName, persistTradesFn, config);
    this.config = config;
    this.demandZones = Array(15).fill(null);
  }

  static getDefaultConfig() {
    return {
      capital: 100000,
      riskPercentage: 2,
    };
  }

  isProfessionalCandle(candle, prevCandle) {
    const prevCandleTotalHeight = prevCandle.High - prevCandle.Low;
    const isBodyLarge = candle.Close - candle.Open > prevCandleTotalHeight;

    return isBodyLarge;
  }

  squareOff() {
    const sellingPrice = this.stock.lowOfLast(4).Low;
    if (this.stock.now().Low < sellingPrice) {
      this.exitPosition(sellingPrice);
    }
  }

  sell() {}

  anyZoneTested(today) {
    return (
      this.demandZones.reverse().find((zone) => {
        if (!zone) return false;
        return today.Low < zone?.High && today.Low > zone?.Low;
      }) || null
    );
  }

  buyIfAnyZoneTested = (today) => {
    const zone = this.anyZoneTested(today);

    if (zone && !this.currentTradeInfo?.position) {
      const buyingPrice = zone.High;
      const riskForOneStock = buyingPrice - zone.Low;
      this.takePosition(riskForOneStock, buyingPrice);
      return;
    }
  };

  addIfNewZoneCreated = (today, prev) => {
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

  buy() {
    const prev = this.stock.prev();
    const today = this.stock.now();

    // buying if any zone has been tested
    this.buyIfAnyZoneTested(today);

    // checking and adding new demand zones
    this.addIfNewZoneCreated(today, prev);
  }
}

export default PriceActionStrategy;
