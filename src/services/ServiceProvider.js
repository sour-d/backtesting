import broker from "../broker";
import LiveStrategyManager from "./LiveStrategyManager";

export default class ServiceProvider {
  static instance;
  db;
  liveQuoteProvider;
  liveStrategyManager;

  constructor() {
    ServiceProvider.instance = this;
    this.liveQuoteProvider = new broker.klineStream([]);
    this.liveStrategyManager = new LiveStrategyManager();
    this.liveStrategyManager.loadStrategies();
  }

  static getInstance() {
    if (!ServiceProvider.instance) {
      ServiceProvider.instance = new ServiceProvider();
    }
    return ServiceProvider.instance;
  }
}
