import broker from "../broker";
// import db from "./db";
// import StrategyManager from "./LiveStrategyManager";

export default class ServiceProvider {
  static instance;
  db;
  liveQuoteProvider;
  strategyManager;

  constructor() {
    ServiceProvider.instance = this;
    // this.db = db;
    this.liveQuoteProvider = new broker.klineStream(
      [],
      !!process.env.USE_TESTNET
    );
    // this.strategyManager = new StrategyManager();
  }

  static getInstance() {
    if (!ServiceProvider.instance) {
      ServiceProvider.instance = new ServiceProvider();
    }
    return ServiceProvider.instance;
  }
}
