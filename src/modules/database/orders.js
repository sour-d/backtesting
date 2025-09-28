
import pool from "./index.js";

export const createOrder = async (order) => {
  const {
    orderId,
    strategyId,
    price,
    timestamp,
    quantity: qty,
    risk,
    stoploss,
    takeprofit,
    orderType,
    side,
    status,
  } = order;
  const res = await pool.query(
    'INSERT INTO orders ("orderId", "strategyId", price, timestamp, qty, risk, stoploss, takeprofit, "orderType", side, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *',
    [
      orderId,
      strategyId,
      price,
      timestamp,
      qty,
      risk,
      stoploss,
      takeprofit,
      orderType,
      side,
      status,
    ]
  );
  return res.rows[0];
};

export const updateOrderStatus = async (orderId, status) => {
  const res = await pool.query(
    'UPDATE orders SET status = $1, "updatedAt" = NOW() WHERE "orderId" = $2 RETURNING *',
    [status, orderId]
  );
  return res.rows[0];
};

export const getOrderByOrderId = async (orderId) => {
  const res = await pool.query(
    'SELECT * FROM orders WHERE "orderId" = $1',
    [orderId]
  );
  return res.rows[0];
};
