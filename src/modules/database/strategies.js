import pool from "./index.js";

/**
 * Create a new strategy in the database
 * @param {Object} strategy - Strategy object with id, strategyName, stockName, timeFrame, config, and state
 * @returns {Promise<Object>} The created strategy record
 */
export const createStrategy = async (strategy) => {
  const { id, strategyName, stockName, timeFrame, config, state } = strategy;
  const res = await pool.query(
    'INSERT INTO strategies (id, "strategyName", "stockName", "timeFrame", config, state) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
    [id, strategyName, stockName, timeFrame, config, state]
  );
  return res.rows[0];
};

/**
 * Update the state of a strategy
 * @param {string} id - The UUID of the strategy to update
 * @param {Object} state - The new state object
 * @returns {Promise<Object>} The updated strategy record
 */
export const updateStrategyState = async (id, state) => {
  const res = await pool.query(
    'UPDATE strategies SET state = $1, "updatedAt" = NOW() WHERE id = $2 RETURNING *',
    [state, id]
  );
  return res.rows[0];
};

/**
 * Get all strategies from the database
 * @returns {Promise<Array>} Array of strategy records
 */
export const getAllStrategies = async () => {
  const res = await pool.query('SELECT * FROM strategies');
  return res.rows;
};

/**
 * Get a strategy by its ID
 * @param {string} id - The UUID of the strategy to retrieve
 * @returns {Promise<Object|null>} The strategy record or null if not found
 */
export const getStrategyById = async (id) => {
  const res = await pool.query('SELECT * FROM strategies WHERE id = $1', [id]);
  return res.rows[0] || null;
};

/**
 * Get strategies by name
 * @param {string} strategyName - The name of the strategy to retrieve
 * @returns {Promise<Array>} Array of matching strategy records
 */
export const getStrategiesByName = async (strategyName) => {
  const res = await pool.query(
    'SELECT * FROM strategies WHERE "strategyName" = $1',
    [strategyName]
  );
  return res.rows;
};

/**
 * Get a specific strategy by name, stock, and timeframe
 * @param {string} strategyName - The strategy name
 * @param {string} stockName - The stock name
 * @param {string} timeFrame - The time frame
 * @returns {Promise<Object|null>} The strategy record or null if not found
 */
export const getSpecificStrategy = async (strategyName, stockName, timeFrame) => {
  const res = await pool.query(
    'SELECT * FROM strategies WHERE "strategyName" = $1 AND "stockName" = $2 AND "timeFrame" = $3',
    [strategyName, stockName, timeFrame]
  );
  return res.rows[0] || null;
};

/**
 * Delete a strategy by its ID
 * @param {string} id - The UUID of the strategy to delete
 * @returns {Promise<boolean>} True if deleted, false if not found
 */
export const deleteStrategy = async (id) => {
  const res = await pool.query('DELETE FROM strategies WHERE id = $1 RETURNING id', [id]);
  return res.rowCount > 0;
};
