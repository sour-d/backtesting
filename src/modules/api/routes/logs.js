import express from 'express';
import { getLogs, getStrategyLogs, getComponentLogs, getErrorLogs } from '../log-utils.js';

const router = express.Router();

/**
 * Get filtered logs
 * GET /api/logs
 * Query parameters:
 * - component: Filter by component
 * - stockName: Filter by stock name
 * - strategyName: Filter by strategy name
 * - timeFrame: Filter by time frame
 * - level: Minimum log level (debug, info, warn, error)
 * - limit: Maximum number of logs to return
 */
router.get('/', async (req, res) => {
  try {
    const {
      component,
      stockName,
      strategyName,
      timeFrame,
      level,
      limit = 100
    } = req.query;

    const filters = {};

    if (component) filters.component = component;
    if (stockName) filters.stockName = stockName;
    if (strategyName) filters.strategyName = strategyName;
    if (timeFrame) filters.timeFrame = timeFrame;
    if (level) filters.level = level;

    const logs = await getLogs(filters, parseInt(limit, 10));

    res.json({
      success: true,
      count: logs.length,
      logs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get logs for a specific strategy
 * GET /api/logs/strategy/:stockName/:timeFrame/:strategyName
 * Query parameters:
 * - level: Minimum log level
 * - limit: Maximum number of logs
 */
router.get('/strategy/:stockName/:timeFrame/:strategyName', async (req, res) => {
  try {
    const { stockName, timeFrame, strategyName } = req.params;
    const { level, limit = 100 } = req.query;

    const logs = await getStrategyLogs(
      stockName,
      timeFrame,
      strategyName,
      { level, limit: parseInt(limit, 10) }
    );

    res.json({
      success: true,
      count: logs.length,
      logs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get logs for a specific component
 * GET /api/logs/component/:component
 * Query parameters:
 * - level: Minimum log level
 * - limit: Maximum number of logs
 */
router.get('/component/:component', async (req, res) => {
  try {
    const { component } = req.params;
    const { level, limit = 100 } = req.query;

    const logs = await getComponentLogs(
      component,
      { level, limit: parseInt(limit, 10) }
    );

    res.json({
      success: true,
      count: logs.length,
      logs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get error logs
 * GET /api/logs/errors
 * Query parameters:
 * - limit: Maximum number of logs
 */
router.get('/errors', async (req, res) => {
  try {
    const { limit = 50 } = req.query;

    const logs = await getErrorLogs(parseInt(limit, 10));

    res.json({
      success: true,
      count: logs.length,
      logs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;