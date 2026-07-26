import { Strategy } from "./Strategy.js";

// Note: Indicators computed globally via technicalIndicators/index.js:
// - ma50high, ma50low, ma200close
// - body (from candleStick)
// - superTrendDirection (from superTrend)

/**
 * MovingAverageStrategy_v2 implements a 50-period channel breakout strategy
 * with SMA200 trend filter, inspired by the backtesting-cli version.
 */
class MovingAverageStrategy_v2 extends Strategy {
  constructor(
    stockName,
    timeFrame,
    config = this.getDefaultConfig(),
    state
  ) {
    super(stockName, timeFrame, config, state);
    this.config = config;
    this.strategyName = "MovingAverageStrategy_v2";
  }

  static getDefaultConfig() {
    return {
      capital: 100000,
      riskPercentage: 5,
      maxAllocation: 0.8,
    };
  }

  async buy() {
    const today = this.stock.now();
    const yesterday = this.stock.prev();

    this.logger.info("buy condition", { 
      todayClose: today?.close, 
      todayMa50high: today?.ma50high, 
      todayBody: today?.body, 
      yesterdayBody: yesterday?.body, 
      todaySuperTrend: today?.superTrendDirection,
      todayMa200close: today?.ma200close
    });

    if (!today || !yesterday) return false;

    // SMA200 filter: require price above SMA200 for long entries
    if (today.ma200close !== undefined && today.close <= today.ma200close) {
      return false;
    }

    const today_body = today.body;
    const yesterday_body = yesterday.body;

    // Entry conditions:
    // - Price crosses above 50-period high channel (breakout)
    // - Both today and yesterday have bullish bodies (positive close - open)
    // - SuperTrend indicates Buy
    if (
      today.close > today.ma50high &&
      today_body > 0 &&
      yesterday_body > 0 &&
      today.superTrendDirection === "Buy"
    ) {
      const buyingPrice = today.close; // No price gap adjustment - match CLI v2
      // Fixed 4% stop loss below entry
      const initialStopLoss = buyingPrice * 0.96;
      if (initialStopLoss >= buyingPrice) return false;

      this.logger.info("------ Buy condition matched -------", {
        buyingPrice,
        initialStopLoss,
        ma50high: today.ma50high,
        superTrend: today.superTrendDirection,
      });

      const riskForOneStock = buyingPrice - initialStopLoss;
      // No take profit (0)
      await this.placeOrder(riskForOneStock, buyingPrice, 0, "Buy", true);
      return true;
    }
    return false;
  }

  async longSquareOff() {
    const today = this.stock.now();
    const yesterday = this.stock.prev();

    if (!today || !yesterday) return false;

    const ma50high_yesterday = yesterday.ma50high;
    // Exit and reverse when price penetrates below yesterday's 50-high AND body is negative
    if (ma50high_yesterday > today.low && today.body < 0) {
      this.logger.info("Long exit triggered (reversal)", {
        ma50high_yesterday,
        todayLow: today.low,
        todayBody: today.body,
      });
      // Exit long immediately
      await this.forceExit("Sell");
      // Attempt to enter short on the same bar (reversal)
      return this.sell();
    }
    return false;
  }

  async sell() {
    const today = this.stock.now();
    const yesterday = this.stock.prev();

    this.logger.info("sell condition", { today, yesterday });

    if (!today || !yesterday) return false;

    // SMA200 filter: require price below SMA200 for short entries
    if (today.ma200close !== undefined && today.close >= today.ma200close) {
      return false;
    }

    const today_body = today.body;
    const yesterday_body = yesterday.body;

    if (
      today.close < today.ma50low &&
      today_body < 0 &&
      yesterday_body < 0 &&
      today.superTrendDirection === "Sell"
    ) {
      const sellingPrice = today.close; // No price gap adjustment - match CLI v2
      const initialStopLoss = sellingPrice * 1.04; // 4% above entry
      if (initialStopLoss <= sellingPrice) return false;

      this.logger.info("------ Sell condition matched -------", {
        sellingPrice,
        initialStopLoss,
        ma50low: today.ma50low,
        superTrend: today.superTrendDirection,
      });

      const riskForOneStock = initialStopLoss - sellingPrice;
      await this.placeOrder(riskForOneStock, sellingPrice, 0, "Sell", true);
      return true;
    }
    return false;
  }

  async shortSquareOff() {
    const today = this.stock.now();
    const yesterday = this.stock.prev();

    if (!today || !yesterday) return false;

    const ma50low_yesterday = yesterday.ma50low;
    // Exit and reverse when price penetrates above yesterday's 50-low AND body is positive
    if (today.high > ma50low_yesterday && today.body > 0) {
      this.logger.info("Short exit triggered (reversal)", {
        ma50low_yesterday,
        todayHigh: today.high,
        todayBody: today.body,
      });
      // Exit short immediately
      await this.forceExit("Buy");
      // Attempt to enter long (reversal)
      return this.buy();
    }
    return false;
  }
}

export default MovingAverageStrategy_v2;
