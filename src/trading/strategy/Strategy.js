import { Trades } from "../outcome/Trades.js";
import { LiveQuoteStorage } from "../quoteStorage/LiveQuoteStorage.js";
import broker from "../../broker";

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

  buy() {
    throw new Error("Method not implemented.");
  }

  sell() {
    throw new Error("Method not implemented.");
  }

  squareOff() {
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
        console.log("------ Order Filled ------");
        this.currentPosition.status = "Filled";
        return true;
      }
    });
  }

  async placeTriggerOrder(risk, price, side = "buy", isMarketOrder = false) {
    if (await this.isLastOrderFilled()) return;
    if (this.currentPosition) {
      const { pastPrice, pastRisk } = this.currentPosition;
      if (pastPrice === price && pastRisk === risk) return;
      cancelLastOrder();
      this.currentPosition = null;
    }

    const stopLoss = side === "buy" ? price - risk : price + risk;
    const stockCanBeBought = this.stocksCanBeBought(risk, price);
    const quantity = stockCanBeBought;
    this.capital -= stockCanBeBought * price;

    this.broker
      .placeOrder(quantity, price, stopLoss, side, isMarketOrder)
      .then((res) => {
        if (!res || res.retMsg !== "OK") return;
        const {
          result: { orderId },
        } = res;

        console.log("------ New Order Placed ------", orderId);
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

  async placeTpMarketOrder(risk, price, tpPrice, side = "Buy") {
    if (await this.isLastOrderFilled()) return;
    if (this.currentPosition) {
      const { pastPrice, pastRisk } = this.currentPosition;
      if (pastPrice === price && pastRisk === risk) return;
      cancelLastOrder();
      this.currentPosition = null;
    }

    const stopLoss = side === "Buy" ? price - risk : price + risk;
    const quantity = this.stocksCanBeBought(risk, price);
    this.capital -= quantity * price;

    return await this.broker
      .placeTpMarketOrder(quantity, tpPrice, stopLoss, side)
      .then((res) => {
        if (!res || res.retMsg !== "OK") return;
        const {
          result: { orderId },
        } = res;

        console.log("------ New Order Placed ------", orderId);
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

  async addTrailingStopLoss(stopLoss, type = "square-off") {
    if (!this.currentPosition) return;
    const isPositionClosed = await trade
      .openPositions()
      .then((res) => res?.size === 0);

    if (isPositionClosed) {
      console.log("-------- Position already exited ---------");
      this.capital += position * price;
      this.currentPosition = null;
      return;
    }

    if (this.currentPosition.stopLoss === price) return;
    console.log("-------- Modifying Stop Loss ---------", {
      oldStopLoss: this.currentPosition.stopLoss,
      newStopLoss: stopLoss,
    });
    this.broker.modifyPosition(stopLoss).then((res) => {
      if (!res) return;
      console.log("modified stop loss, retMsg", res.retMsg, res.result.orderId);
      this.currentPosition.stopLoss = stopLoss;
    });

    // this.capital += position * price;
    // this.updateTrades(this.stock.now(), price, position, 0, type);

    // this.currentPosition = null;
  }

  async exitPosition() {}

  async checkPosition() {
    this.broker.openPositions().then((res) => {
      if (res.size === 0) {
        console.log("-------- Position already exited ---------");
        this.currentPosition = null;
        return;
      }
    });
  }

  async forceExit(side) {
    this.broker.exitPosition(side).then((res) => {
      if (!res) return;
      console.log("-------- Position Forced Exit ---------", res.retMsg);
      this.currentPosition = null;
    });
  }

  trade() {
    console.log("-------- Got A Quote, Resuming Strategy ---------");

    if (this.currentPosition?.status === "Filled") {
      this.checkPosition();
      this.squareOff();
      return;
    }

    if (this.buy()) return;
    if (this.sell()) return;
  }

  execute() {
    console.log("-------- Strategy Started ---------");
  }
}

export { Strategy };
