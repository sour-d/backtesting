import broker from "../exchange/index.js";
import LiveStrategyManager from "./strategy-manager.js";

export default class ServiceProvider {
  static instance;
  db;
  liveQuoteProvider;
  liveStrategyManager;

  constructor() {
    ServiceProvider.instance = this;
    this.liveQuoteProvider = new broker.klineStream([]);
    this.liveStrategyManager = new LiveStrategyManager();
  }

  static getInstance() {
    if (!ServiceProvider.instance) {
      ServiceProvider.instance = new ServiceProvider();
    }
    return ServiceProvider.instance;
  }
}
