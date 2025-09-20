import MovingAverageStrategy from "./MovingAverageStrategy.js";
import MovingAverageStrategyUpgraded from "./MovingAverageStrategyUpgraded.js";
import { BaseStrategy } from "./BaseStrategy.js";
import { Strategy } from "./Strategy.js";

const STRATEGIES = [MovingAverageStrategy, MovingAverageStrategyUpgraded];

export default STRATEGIES;
export { BaseStrategy, Strategy };
