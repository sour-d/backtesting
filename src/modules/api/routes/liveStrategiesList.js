import ServiceProvider from "../../core-services/service-provider.js";

const liveStrategiesList = (req, res) => {
  const { liveStrategyManager } = ServiceProvider.getInstance();
  const strategies = liveStrategyManager.runningStrategies;

  return res.status(200).json(strategies);
};

export default liveStrategiesList;
