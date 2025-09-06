import { Trades } from "../outcome/Trades.js";
import { LiveQuoteStorage } from "../quoteStorage/LiveQuoteStorage.js";
import broker from "../../broker";
import logger from "../../server/logger.js";
import getInstrumentInfo from "../../broker/instrument.js";
import { createOrder as storeOrderDetails } from "../../db/orders.js";

function float2int(value) {
  return value | 0;
}

function removeExtraZeroInFloat(float) {
  return Number(float.toFixed(8));
}

function roundLikeSize(value, size = 0.00001) {
  size = Number(size);
  return removeExtraZeroInFloat(value - removeExtraZeroInFloat(value % size));
}

class Strategy {
  stock;
  capital;
  riskPercentage;
  trades;
  persistTradesFn;
  currentPosition;
  risk;
  stockName;
  broker;
  symbolInfo;
  logger;
  strategyName;
  id;

  constructor(
    stockName,
    timeFrame,
    strategyName,
    persistTradesFn,
    config = Strategy.getDefaultConfig(),
    state = {}
  ) {
    this.id = state.id;
    this.stockName = stockName;
    this.strategyName = strategyName;
    this.capital = parseInt(config.capital);
    this.riskPercentage = parseFloat(config.riskPercentage);
    this.precise = parseInt(config.precise) || 0;
    this.risk = this.capital * (this.riskPercentage / 100);
    this.timeFrame = timeFrame;

    this.trades = state.trades ? Trades.fromJSON(state.trades) : new Trades(this);
    this.broker = new broker.Trade(this.stockName, this.logger);
    this.logger = logger(this);
    this.stock = new LiveQuoteStorage(
      () => this.trade(),
      200,
      stockName,
      timeFrame,
      stockName,
      this.logger
    );

    this.currentPosition = state.currentPosition || null;
    this.persistTradesFn = persistTradesFn;
    this.symbolInfo = state.symbolInfo || null;
  }

  toJSON() {
    return {
      id: this.id,
      trades: this.trades.toJSON(),
      currentPosition: this.currentPosition,
      symbolInfo: this.symbolInfo,
    };
  }

  static getDefaultConfig() {
    return {
      // capital: 100000,
      riskPercentage: 5,
    };
  }

  updateCapital() {
    broker.getBalance().then((res) => {
      this.capital = res?.bal?.available ?? 0;
      this.logger("-------- Fetched Capital ---------", res);
    });
    return this.capital;
  }

  stocksCanBeBought(riskForOneStock, buyingPrice) {
    const maxStocksByCapital = this.capital / buyingPrice;
    const maxStocksByRisk = this.risk / riskForOneStock;

    const totalCost = maxStocksByRisk * buyingPrice;
    const affordableStocks =
      totalCost <= this.capital ? maxStocksByRisk : maxStocksByCapital;

    this.logger("-------- Calculating Stocks to Buy ---------", {
      risk: riskForOneStock,
      price: buyingPrice,
      capital: this.capital,
      risk: this.risk,
      quantity: +affordableStocks.toFixed(this.precise),
      quantity_raw: affordableStocks
    });

    return +affordableStocks.toFixed(this.precise);
  }

  // updateTrades(
  //   transactionDate,
  //   price,
  //   quantity,
  //   risk,
  //   transactionType = "buy"
  // ) {
  //   this.trades.addTradeResult(
  //     transactionDate,
  //     price,
  //     quantity,
  //     risk,
  //     transactionType
  //   );
  // }

  async buy() {
    throw new Error("Method not implemented.");
  }

  async sell() {
    throw new Error("Method not implemented.");
  }

  async longSquareOff() {
    throw new Error("Method not implemented.");
  }

  async shortSquareOff() {
    throw new Error("Method not implemented.");
  }

  async isLastOrderFilled() {
    const { orderId, status } = this.currentPosition || {};
    if (status === "Filled") return true;

    return await this.broker.activeOrders().then(async (res) => {
      const currentOrderInfo = res.find(
        (orderInfo) => orderInfo.orderId === orderId
      );
      if (!currentOrderInfo?.orderId) {
        this.currentPosition.status = "Filled";
        await updateOrderStatus(orderId, "Filled");
        this.logger("------ Last Order Filled ------", this.currentPosition);
        return true;
      }
    });
  }

  cancelLastOrder() { }

  async placeOrder(risk, price, tpPrice, side = "Buy", isLimitOrder = false) {
    if (await this.isLastOrderFilled()) return;
    await this.updateCapital();

    price = roundLikeSize(price, this.symbolInfo?.priceFilter?.tickSize);
    tpPrice = roundLikeSize(tpPrice, this.symbolInfo?.priceFilter?.tickSize);

    if (this.currentPosition) {
      const { price: pastPrice, risk: pastRisk } = this.currentPosition;
      if (pastPrice === price && pastRisk === risk) return;
      this.cancelLastOrder();
      this.currentPosition = null;
    }

    let stopLoss = side === "Buy" ? price - risk : price + risk;
    stopLoss = roundLikeSize(stopLoss, this.symbolInfo?.priceFilter?.tickSize);

    let quantity = this.stocksCanBeBought(risk, price);
    quantity = roundLikeSize(quantity, this.symbolInfo?.lotSizeFilter?.qtyStep);

    const limitPrice = isLimitOrder ? price : 0;
    return await this.broker
      .placeOrder(quantity, limitPrice, tpPrice, stopLoss, side)
      .then((res) => {
        if (!res || res.retMsg !== "OK") return;

        const orderDetails = {
          orderId: res.result.orderId,
          strategyId: this.id,
          price,
          timestamp: this.stock.now(),
          quantity: quantity,
          risk,
          stoploss: stopLoss,
          takeprofit: tpPrice,
          orderType: isLimitOrder ? "Limit" : "Market",
          side,
          status: "Pending",
        };

        this.currentPosition = orderDetails;
        storeOrderDetails(orderDetails);

        this.updateCapital();
        return true;
      });
  }

  async updateStopLoss(stopLoss) {
    if (!this.currentPosition) return;

    stopLoss = roundLikeSize(stopLoss, this.symbolInfo?.priceFilter?.tickSize);

    if (this.currentPosition.stopLoss === stopLoss) return;

    return await this.broker.modifyPosition(stopLoss).then((res) => {
      if (!res) return;
      this.currentPosition.stopLoss = stopLoss;
    });
  }

  async checkPosition() {
    return await this.broker.openPositions().then((res) => {
      if (res.size === 0) {
        const { stopLoss } = this.currentPosition;
        this.logger(
          `-------- Position already exited with Stop Loss ${stopLoss} ---------`
        );

        this.updateCapital();
        this.currentPosition = null;
        return;
      }
    });
  }

  async forceExit(side) {
    this.logger("inside Force Exit", {
      today: this.stock.now(),
      yesterday: this.stock.prev(),
    });
    return await this.broker.exitPosition(side).then((res) => {
      if (!res) return;

      this.updateCapital();
      this.currentPosition = null;
    });
  }

  async trade() {
    this.logger("-------- Got A Quote, Resuming Strategy ---------");

    this.updateCapital();
    this.currentPosition && (await this.checkPosition());

    if (this.currentPosition?.side === "Buy") {
      await this.longSquareOff();
      return;
    }
    if (this.currentPosition?.side === "Sell") {
      await this.shortSquareOff();
      return;
    }

    if (await this.buy()) return;
    if (await this.sell()) return;
  }

  async execute() {
    this.logger("-------- Strategy Started ---------");

    this.symbolInfo = await getInstrumentInfo(this.stockName);
  }
}

export { Strategy };
