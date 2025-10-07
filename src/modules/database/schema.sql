-- Supabase Schema for Backtesting Application
-- Run this SQL in your Supabase SQL Editor

-- Drop tables if they exist
DROP TABLE IF EXISTS trades;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS strategies;
DROP TABLE IF EXISTS logs;

-- Create logs table
CREATE TABLE IF NOT EXISTS logs (
  id SERIAL PRIMARY KEY,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  identifier VARCHAR(255),
  level VARCHAR(10) DEFAULT 'info',
  message TEXT,
  data JSONB
);

-- Create indexes for logs
CREATE INDEX IF NOT EXISTS idx_logs_identifier ON logs(identifier);
CREATE INDEX IF NOT EXISTS idx_logs_level ON logs(level);
CREATE INDEX IF NOT EXISTS idx_logs_timestamp ON logs(timestamp);

-- Create strategies table
CREATE TABLE IF NOT EXISTS strategies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "strategyName" VARCHAR(255) NOT NULL,
  "stockName" VARCHAR(255) NOT NULL,
  "timeFrame" VARCHAR(255) NOT NULL,
  config JSONB,
  state JSONB,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE ("strategyName", "stockName", "timeFrame")
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  "orderId" VARCHAR(255) NOT NULL,
  "strategyId" UUID REFERENCES strategies(id) ON DELETE CASCADE,
  price DECIMAL(20, 8),
  timestamp TIMESTAMPTZ NOT NULL,
  qty DECIMAL(20, 8),
  risk DECIMAL(5, 4),
  stoploss DECIMAL(20, 8),
  "orderType" VARCHAR(50),
  side VARCHAR(10),
  status VARCHAR(50),
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_strategy_id ON orders("strategyId");
CREATE INDEX IF NOT EXISTS idx_orders_timestamp ON orders(timestamp);
CREATE INDEX IF NOT EXISTS idx_orders_order_id ON orders("orderId");