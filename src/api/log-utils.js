import supabase from "../modules/database/index.js";

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

  try {
    let query = supabase.from('logs').select('*');

    // Filter by component (identifier pattern)
    if (component) {
      query = query.ilike('identifier', `${component}%`);
    }

    // Filter by stock name in data JSON
    if (stockName) {
      query = query.eq('data->stockName', stockName);
    }

    // Filter by strategy name in data JSON
    if (strategyName) {
      query = query.eq('data->strategyName', strategyName);
    }

    // Filter by time frame in data JSON
    if (timeFrame) {
      query = query.eq('data->timeFrame', timeFrame);
    }

    // Filter by minimum log level
    if (level) {
      const levels = ['debug', 'info', 'warn', 'error'];
      const minLevelIndex = levels.indexOf(level.toLowerCase());
      if (minLevelIndex >= 0) {
        const allowedLevels = levels.slice(minLevelIndex);
        query = query.in('level', allowedLevels);
      }
    }

    // Filter by time range
    if (startTime) {
      query = query.gte('timestamp', startTime.toISOString());
    }

    if (endTime) {
      query = query.lte('timestamp', endTime.toISOString());
    }

    // Order by timestamp descending and limit results
    query = query.order('timestamp', { ascending: false }).limit(limit);

    const { data, error } = await query;

    if (error) {
      console.error('Error retrieving logs:', error);
      return [];
    }

    return data || [];
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