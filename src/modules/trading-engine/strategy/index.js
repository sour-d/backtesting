import MovingAverageStrategy from "./MovingAverageStrategy.js";
import MovingAverageStrategyUpgraded from "./MovingAverageStrategyUpgraded.js";
import MovingAverageStrategy_v2 from "./MovingAverageStrategy_v2.js";
import { BaseStrategy } from "./BaseStrategy.js";
import { Strategy } from "./Strategy.js";

const STRATEGIES = [MovingAverageStrategy, MovingAverageStrategy_v2];

export default STRATEGIES;
export { BaseStrategy, Strategy };
