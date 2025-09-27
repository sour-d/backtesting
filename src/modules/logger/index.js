import pool from "../database/index.js";

const isProd = process.env.ENV === "prod";

// Log levels with numeric values for filtering
const LOG_LEVELS = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3
};

// Default minimum log level
const DEFAULT_MIN_LEVEL = isProd ? 'info' : 'debug';

/**
 * Clear all logs from the database
 */
export function clearLog() {
  if (isProd) {
    pool.query("TRUNCATE TABLE logs");
  }
}

/**
 * Create a logger instance with context information
 * @param {Object} params - Logger parameters
 * @param {string} params.component - Component name (e.g., 'LiveStrategyManager')
 * @param {string} [params.stockName] - Optional stock symbol
 * @param {string} [params.timeFrame] - Optional time frame
 * @param {string} [params.strategyName] - Optional strategy name
 * @returns {Object} Logger object with level-specific methods
 */
export default function logger({ component, stockName = '', timeFrame = '', strategyName = '' }) {
  const identifier = [component];

  if (stockName) identifier.push(stockName);
  if (timeFrame) identifier.push(timeFrame);
  if (strategyName) identifier.push(strategyName);

  const identifierStr = identifier.join('-');

  /**
   * Log a message with specified level
   * @param {string} level - Log level (debug, info, warn, error)
   * @param {Array} args - Arguments to log
   * @private
   */
  const _log = async (level, message, data = {}) => {
    // Skip if log level is below minimum
    if (LOG_LEVELS[level] < LOG_LEVELS[DEFAULT_MIN_LEVEL]) {
      return;
    }

    if (process.env.SHOW_LOGS_IN_CONSOLE === 'true') {
      console.log(message, Object.keys(data).length ? data : '');
    }

    const timestamp = new Date().toISOString();

    if (isProd) {
      try {
        await pool.query(
          "INSERT INTO logs (identifier, level, message, data) VALUES ($1, $2, $3, $4)",
          [identifierStr, level, message, JSON.stringify(data)]
        );
      } catch (err) {
        console.error("Error inserting log into database", err);
      }
    } else {
      const prefix = `[${timestamp}] [${level.toUpperCase()}] [${identifierStr}]`;
      console.log(prefix, message, data);
    }
  };

  // Return logger object with level-specific methods
  return {
    debug: (message, data) => _log('debug', message, data),
    info: (message, data) => _log('info', message, data),
    warn: (message, data) => _log('warn', message, data),
    error: (message, data) => _log('error', message, data)
  };
}
