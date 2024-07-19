import { Trades } from "../outcome/Trades.js";
import { LiveQuoteStorage } from "../quoteStorage/LiveQuoteStorage.js";
import broker from "../../broker";
import logger from "../../server/logger.js";
import getInstrumentInfo from "../../broker/instrument.js";

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

  constructor(
    stockName,
    timeFrame,
    persistTradesFn,
    config = Strategy.getDefaultConfig()
  ) {
    this.riskPercentage = config.riskPercentage;
    this.persistTradesFn = persistTradesFn;
    this.risk = this.capital * (this.riskPercentage / 100);
    this.stockName = stockName;

    this.currentPosition = null;

    this.stock = new LiveQuoteStorage(
      () => this.trade(),
      100,
      stockName,
      timeFrame,
      stockName
    );
    this.trades = new Trades(this);
    this.broker = new broker.Trade(this.stockName);
    this.capital = this.updateCapital();
    this.strategyName = "";
  }

  static getDefaultConfig() {
    return {
      // capital: 100000,
      riskPercentage: 5,
    };
  }

  updateCapital() {
    broker.getBalance().then((res) => {
      this.logger("-------- Capital Updated ---------", res);
      this.capital = res?.bal?.total ?? 0;
    });
    return this.capital;
  }

  stocksCanBeBought(riskForOneStock, buyingPrice) {
    const maxStocksByCapital = this.capital / buyingPrice;
    const maxStocksByRisk = this.risk / riskForOneStock;

    const totalCost = maxStocksByRisk * buyingPrice;
    const affordableStocks =
      totalCost <= this.capital ? maxStocksByRisk : maxStocksByCapital;

    return +affordableStocks.toFixed(2);

    // when fraction buy is not possible
    // return Math.floor(affordableStocks);
  }

  updateTrades(
    transactionDate,
    price,
    quantity,
    risk,
    transactionType = "buy"
  ) {
    this.trades.addTradeResult(
      transactionDate,
      price,
      quantity,
      risk,
      transactionType
    );
  }

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
    if (!this.currentPosition) return;
    const { status, orderId } = this.currentPosition;
    if (status === "Filled") return true;

    return await this.broker.activeOrders().then((res) => {
      const currentOrderInfo = res.find(
        (orderInfo) => orderInfo.orderId === orderId
      );
      if (!currentOrderInfo?.orderId) {
        this.currentPosition.status = "Filled";
        this.logger("------ Order Filled ------", this.currentPosition);
        return true;
      }
    });
  }

  async placeTriggerOrder(risk, price, side = "Buy", isMarketOrder = false) {
    if (await this.isLastOrderFilled()) return;
    if (this.currentPosition) {
      const { pastPrice, pastRisk } = this.currentPosition;
      if (pastPrice === price && pastRisk === risk) return;
      await cancelLastOrder();
      this.currentPosition = null;
    }

    const stopLoss = side === "Buy" ? price - risk : price + risk;
    const stockCanBeBought = this.stocksCanBeBought(risk, price);
    const quantity = stockCanBeBought;

    this.updateCapital();

    this.logger("------ Placing New Order ------", {
      stockCanBeBought,
      quantity,
      price,
      risk,
      side,
      isMarketOrder,
    });

    this.broker
      .placeOrder(quantity, price, stopLoss, side, isMarketOrder)
      .then((res) => {
        if (!res || res.retMsg !== "OK") return;
        const {
          result: { orderId },
        } = res;

        this.logger("------ New Order Placed ------", res);
        this.currentPosition = {
          transactionDate: this.stock.now(),
          price,
          quantity,
          risk,
          side: side,
          status: "Pending",
          orderId,
        };
      });
    return true;
    // this.updateTrades(
    //   this.stock.now(),
    //   price,
    //   position,
    //   risk * position,
    //   transactionType
    // );
  }

  async placeOrder(risk, price, tpPrice, side = "Buy", isLimitOrder = false) {
    if (await this.isLastOrderFilled()) return;

    price = roundLikeSize(price, this.symbolInfo?.priceFilter?.tickSize);
    tpPrice = roundLikeSize(tpPrice, this.symbolInfo?.priceFilter?.tickSize);

    if (this.currentPosition) {
      const { price: pastPrice, risk: pastRisk } = this.currentPosition;
      if (pastPrice === price && pastRisk === risk) return;
      cancelLastOrder();
      this.currentPosition = null;
    }

    let stopLoss = side === "Buy" ? price - risk : price + risk;
    stopLoss = roundLikeSize(stopLoss, this.symbolInfo?.priceFilter?.tickSize);

    let quantity = this.stocksCanBeBought(risk, price);
    quantity = roundLikeSize(quantity, this.symbolInfo?.lotSizeFilter?.qtyStep);

    this.logger("------ Placing New Order ------", {
      price,
      tpPrice,
      stopLoss,
      risk,
      quantity,
      side,
      amount: quantity * price,
    });

    const limitPrice = isLimitOrder ? price : 0;
    return await this.broker
      .placeOrder(quantity, limitPrice, tpPrice, stopLoss, side)
      .then((res) => {
        if (!res || res.retMsg !== "OK") {
          return this.logger("------ New Order Failed ------", res);
        }
        this.logger("------ New Order Placed ------", res);
        this.currentPosition = {
          transactionDate: this.stock.now(),
          price,
          quantity,
          risk,
          side: side,
          status: "Pending",
          orderId: res.result.orderId,
        };

        this.updateCapital();
        return true;
      });
  }

  async updateStopLoss(stopLoss) {
    if (!this.currentPosition) return;

    stopLoss = roundLikeSize(stopLoss, this.symbolInfo?.priceFilter?.tickSize);

    if (this.currentPosition.stopLoss === stopLoss) return;
    this.logger("-------- Modifying Stop Loss ---------", {
      oldStopLoss: this.currentPosition.stopLoss,
      newStopLoss: stopLoss,
    });
    return await this.broker.modifyPosition(stopLoss).then((res) => {
      this.logger("-------- Modified Stop Loss Response ---------", res);
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
    return await this.broker.exitPosition(side).then((res) => {
      if (!res)
        return this.logger("-------- Position Exit Failed ---------", res);
      this.logger("-------- Position Forced Exit ---------", res);

      this.updateCapital();
      this.currentPosition = null;
    });
  }

  async trade() {
    this.logger("-------- Got A Quote, Resuming Strategy ---------");

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
