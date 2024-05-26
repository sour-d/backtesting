import LiveQuoteProvider from "./LiveQuoteProvider";
import db from "./db";
import StrategyManager from "./LiveStrategyManager";

export default class ServiceProvider {
  private static instance: ServiceProvider;
  public db: any;
  public liveQuoteProvider: LiveQuoteProvider;
  public strategyManager: StrategyManager;

  private constructor() {
    ServiceProvider.instance = this;
    this.db = db;
    this.liveQuoteProvider = new LiveQuoteProvider(() => {});
    this.strategyManager = new StrategyManager();
  }

  public static getInstance() {
    if (!ServiceProvider.instance) {
      ServiceProvider.instance = new ServiceProvider();
    }
    return ServiceProvider.instance;
  }
}
