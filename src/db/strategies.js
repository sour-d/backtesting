import pool from "./index.js";

export const createStrategy = async (strategy) => {
  const { strategyName, stockName, timeFrame, config, state } = strategy;
  const res = await pool.query(
    'INSERT INTO strategies ("strategyName", "stockName", "timeFrame", config, state) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [strategyName, stockName, timeFrame, config, state]
  );
  return res.rows[0];
};

export const updateStrategyState = async (id, state) => {
  const res = await pool.query(
    'UPDATE strategies SET state = $1, "updatedAt" = NOW() WHERE id = $2 RETURNING *',
    [state, id]
  );
  return res.rows[0];
};

export const getAllStrategies = async () => {
  const res = await pool.query('SELECT * FROM strategies');
  return res.rows;
};
