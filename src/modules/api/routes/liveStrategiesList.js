import ServiceProvider from "../../services/ServiceProvider.js";

const liveStrategiesList = (req, res) => {
  const { liveStrategyManager } = ServiceProvider.getInstance();
  const strategies = liveStrategyManager.runningStrategies;

  return res.status(200).json(strategies);
};

export default liveStrategiesList;
