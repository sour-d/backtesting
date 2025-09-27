
import pool from "./index.js";

export const createTrade = async (trade) => {
  const { orderId, strategyId, price, timestamp, qty, side } = trade;
  const res = await pool.query(
    'INSERT INTO trades ("orderId", "strategyId", price, timestamp, qty, side) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
    [orderId, strategyId, price, timestamp, qty, side]
  );
  return res.rows[0];
};
