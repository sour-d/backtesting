import Papa from "papaparse";

const trimToDec = (value) => +value.toFixed(2);

export class Trades {
  capital;
  risk;
  stock;
  tradeResults;
  flushedTill;

  constructor({ capital, risk, stockName }) {
    this.tradeResults = [];
    this.capital = capital;
    this.risk = risk;
    this.stock = stockName;
    this.flushedTill = 0;
  }

  totalTrades() {
    return this.tradeResults.length;
  }

  totalExpectancy() {
    return this.tradeResults.reduce(
      (totalRiskMultiple, { riskMultiple }) => totalRiskMultiple + riskMultiple,
      0
    );
  }

  averageExpectancy() {
    return this.totalExpectancy() / this.totalTrades();
  }

  addTradeResult(transactionDate, price, quantity, risk, transactionType) {
    const outcome = {
      transactionDate,
      price,
      quantity,
      risk: trimToDec(risk),
      transactionType,
    };

    this.tradeResults.push(outcome);
  }

  getReport() {
    return {
      stock: this.stock,
      capital: this.capital,
      riskTaken: this.risk + "%",
      totalTrades: this.totalTrades(),
    };
  }

  toCSV() {
    const tradesCSV = this.tradeResults.map((trade) => ({
      "Transaction Date": trade.transactionDate.Date,
      Price: trade.price,
      Quantity: trade.quantity,
      Risk: trade.risk,
      "Transaction Type": trade.transactionType,
    }));

    return Papa.unparse(tradesCSV);
  }

  flush() {
    const trades = this.tradeResults.slice(this.flushedTill);
    this.flushedTill = this.tradeResults.length;

    const tradesCSV = trades.map((trade) => ({
      "Transaction Date": trade.transactionDate.Date,
      Price: trade.price,
      Quantity: trade.quantity,
      Risk: trade.risk,
      "Transaction Type": trade.transactionType,
    }));

    return trades.length ? Papa.unparse(tradesCSV, { header: false }) : "";
  }
}
