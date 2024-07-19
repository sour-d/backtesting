import broker from "../broker";
import LiveStrategyManager from "./LiveStrategyManager";

export default class ServiceProvider {
  static instance;
  db;
  liveQuoteProvider;
  liveStrategyManager;

  constructor() {
    ServiceProvider.instance = this;
    this.liveQuoteProvider = new broker.klineStream(
      [],
      !!process.env.USE_TESTNET
    );
    this.liveStrategyManager = new LiveStrategyManager();
  }

  static getInstance() {
    if (!ServiceProvider.instance) {
      ServiceProvider.instance = new ServiceProvider();
    }
    return ServiceProvider.instance;
  }
}
