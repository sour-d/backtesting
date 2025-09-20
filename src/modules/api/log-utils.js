import pool from "../db/index.js";

/**
 * Utility functions for log management and retrieval
 */

/**
 * Get logs filtered by various criteria
 * @param {Object} filters - Filter criteria
 * @param {string} [filters.component] - Filter by component name
 * @param {string} [filters.stockName] - Filter by stock name
 * @param {string} [filters.strategyName] - Filter by strategy name
 * @param {string} [filters.timeFrame] - Filter by time frame
 * @param {string} [filters.level] - Minimum log level to include
 * @param {Date} [filters.startTime] - Start time for logs
 * @param {Date} [filters.endTime] - End time for logs
 * @param {number} [limit=100] - Maximum number of logs to return
 * @returns {Promise<Array>} Array of log entries
 */
export async function getLogs(filters = {}, limit = 100) {
  const {
    component,
    stockName,
    strategyName,
    timeFrame,
    level,
    startTime,
    endTime
  } = filters;

  let query = "SELECT * FROM logs WHERE 1=1";
  const params = [];
  let paramIndex = 1;

  // Build identifier pattern for filtering
  if (component) {
    const identifierPattern = `${component}%`;
    query += ` AND identifier LIKE $${paramIndex++}`;
    params.push(identifierPattern);
  }

  // Filter by specific stock
  if (stockName) {
    query += ` AND data->>'stockName' = $${paramIndex++}`;
    params.push(stockName);
  }

  // Filter by strategy name
  if (strategyName) {
    query += ` AND data->>'strategyName' = $${paramIndex++}`;
    params.push(strategyName);
  }

  // Filter by time frame
  if (timeFrame) {
    query += ` AND data->>'timeFrame' = $${paramIndex++}`;
    params.push(timeFrame);
  }

  // Filter by minimum log level
  if (level) {
    const levels = ['debug', 'info', 'warn', 'error'];
    const minLevelIndex = levels.indexOf(level);

    if (minLevelIndex >= 0) {
      const allowedLevels = levels.slice(minLevelIndex);
      query += ` AND level = ANY($${paramIndex++}::varchar[])`;
      params.push(allowedLevels);
    }
  }

  // Filter by time range
  if (startTime) {
    query += ` AND timestamp >= $${paramIndex++}`;
    params.push(startTime);
  }

  if (endTime) {
    query += ` AND timestamp <= $${paramIndex++}`;
    params.push(endTime);
  }

  // Order by timestamp descending and limit results
  query += ` ORDER BY timestamp DESC LIMIT $${paramIndex++}`;
  params.push(limit);

  try {
    const result = await pool.query(query, params);
    return result.rows;
  } catch (error) {
    console.error('Error retrieving logs:', error);
    return [];
  }
}

/**
 * Get logs for a specific strategy
 * @param {string} stockName - Stock name
 * @param {string} timeFrame - Time frame
 * @param {string} strategyName - Strategy name
 * @param {Object} options - Additional options
 * @param {string} [options.level='info'] - Minimum log level
 * @param {number} [options.limit=100] - Maximum number of logs
 * @returns {Promise<Array>} Array of log entries
 */
export async function getStrategyLogs(stockName, timeFrame, strategyName, options = {}) {
  const { level = 'info', limit = 100 } = options;

  return getLogs({
    stockName,
    timeFrame,
    strategyName,
    level
  }, limit);
}

/**
 * Get logs for a specific component
 * @param {string} component - Component name
 * @param {Object} options - Additional options
 * @param {string} [options.level='info'] - Minimum log level
 * @param {number} [options.limit=100] - Maximum number of logs
 * @returns {Promise<Array>} Array of log entries
 */
export async function getComponentLogs(component, options = {}) {
  const { level = 'info', limit = 100 } = options;

  return getLogs({ component, level }, limit);
}

/**
 * Get error logs across the system
 * @param {number} [limit=50] - Maximum number of error logs
 * @returns {Promise<Array>} Array of error log entries
 */
export async function getErrorLogs(limit = 50) {
  return getLogs({ level: 'error' }, limit);
}