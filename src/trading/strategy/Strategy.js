import { Trades } from "../outcome/Trades.js";
import { LiveQuoteStorage } from "../quoteStorage/LiveQuoteStorage.js";
import broker from "../../broker";
import logger from "../../server/logger.js";
import { log } from "console";

function float2int(value) {
  return value | 0;
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

  constructor(
    stockName,
    timeFrame,
    persistTradesFn,
    config = Strategy.getDefaultConfig()
  ) {
    this.capital = config.capital;
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
  }

  static getDefaultConfig() {
    return {
      capital: 100000,
      riskPercentage: 5,
    };
  }

  stocksCanBeBought(riskForOneStock, buyingPrice) {
    const maxStocksByCapital = this.capital / buyingPrice;
    const maxStocksByRisk = this.risk / riskForOneStock;

    const totalCost = maxStocksByRisk * buyingPrice;
    const affordableStocks =
      totalCost <= this.capital ? maxStocksByRisk : maxStocksByCapital;

    return float2int((+affordableStocks.toFixed(2) - 0.01).toFixed(2));

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
        logger(this.stockName, "------ Order Filled ------");
        this.currentPosition.status = "Filled";
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

    logger(this.stockName, "-------- Capital Updated ---------", {
      capital: this.capital,
    });
    this.capital -= stockCanBeBought * price;

    logger(this.stockName, "------ Placing New Order ------", {
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

        logger(this.stockName, "------ New Order Placed ------", res);
        this.currentPosition = {
          transactionDate: this.stock.now(),
          price,
          quantity,
          risk,
          side: side,
          status: "pending",
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

  async placeMarketOrder(risk, price, tpPrice, side = "Buy") {
    if (await this.isLastOrderFilled()) return;
    if (this.currentPosition) {
      const { pastPrice, pastRisk } = this.currentPosition;
      if (pastPrice === price && pastRisk === risk) return;
      cancelLastOrder();
      this.currentPosition = null;
    }

    const stopLoss = side === "Buy" ? price - risk : price + risk;
    const quantity = this.stocksCanBeBought(risk, price);

    logger(this.stockName, "-------- Capital Updated ---------", {
      capital: this.capital,
    });
    this.capital -= quantity * price;

    logger(this.stockName, "------ Placing New Order ------", {
      price,
      quantity,
      risk,
      side,
      amount: quantity * price,
    });
    return await this.broker
      .placeMarketOrder(quantity, tpPrice, stopLoss, side)
      .then((res) => {
        if (!res || res.retMsg !== "OK") return;
        const {
          result: { orderId },
        } = res;

        logger(this.stockName, "------ New Order Placed ------", res);
        this.currentPosition = {
          transactionDate: this.stock.now(),
          price,
          quantity,
          risk,
          side: side,
          status: "pending",
          orderId,
        };
        return true;
      });
  }

  async addTrailingStopLoss(stopLoss) {
    if (!this.currentPosition) return;

    if (this.currentPosition.stopLoss === stopLoss) return;
    logger(this.stockName, "-------- Modifying Stop Loss ---------", {
      oldStopLoss: this.currentPosition.stopLoss,
      newStopLoss: stopLoss,
    });
    return await this.broker.modifyPosition(stopLoss).then((res) => {
      logger(
        this.stockName,
        "-------- Modified Stop Loss Response ---------",
        res
      );
      if (!res) return;
      this.currentPosition.stopLoss = stopLoss;
    });
  }

  async checkPosition() {
    return await this.broker.openPositions().then((res) => {
      if (res.size === 0) {
        logger(this.stockName, "-------- Position already exited ---------");

        const { price, quantity } = this.currentPosition;
        this.capital += price * quantity;
        logger(this.stockName, "-------- Capital Updated ---------", {
          capital: this.capital,
        });
        this.currentPosition = null;
        return;
      }
    });
  }

  async forceExit(side) {
    this.broker.exitPosition(side).then((res) => {
      if (!res) return;
      logger(this.stockName, "-------- Position Forced Exit ---------", res);

      const { price, quantity } = this.currentPosition;
      this.capital += price * quantity;
      logger(this.stockName, "-------- Capital Updated ---------", {
        capital: this.capital,
      });
      this.currentPosition = null;
    });
  }

  async trade() {
    logger(this.stockName, "-------- Got A Quote, Resuming Strategy ---------");

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

  execute() {
    logger(this.stockName, "-------- Strategy Started ---------");
  }
}

export { Strategy };
