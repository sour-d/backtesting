import pool from "./index.js";
import * as dotenv from "dotenv";

dotenv.config();

const init = async () => {
  try {
    // Drop tables in reverse order of creation to avoid foreign key constraints
    await pool.query(`DROP TABLE IF EXISTS trades;`);
    await pool.query(`DROP TABLE IF EXISTS orders;`);
    await pool.query(`DROP TABLE IF EXISTS strategies;`);
    await pool.query(`DROP TABLE IF EXISTS logs;`);

    // Recreate tables
    await pool.query(`
      CREATE TABLE IF NOT EXISTS logs (
        id SERIAL PRIMARY KEY,
        timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        identifier VARCHAR(255),
        level VARCHAR(10) DEFAULT 'info',
        message TEXT,
        data JSONB
      );
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_logs_identifier ON logs(identifier);
      CREATE INDEX IF NOT EXISTS idx_logs_level ON logs(level);
      CREATE INDEX IF NOT EXISTS idx_logs_timestamp ON logs(timestamp);
    `);

    // Enable UUID extension if not already enabled
    await pool.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS strategies (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "strategyName" VARCHAR(255) NOT NULL,
        "stockName" VARCHAR(255) NOT NULL,
        "timeFrame" VARCHAR(255) NOT NULL,
        config JSONB,
        state JSONB,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE ("strategyName", "stockName", "timeFrame")
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        "orderId" VARCHAR(255) NOT NULL UNIQUE,
        "strategyId" UUID NOT NULL,
        price NUMERIC,
        timestamp TIMESTAMPTZ,
        qty NUMERIC,
        risk NUMERIC,
        stoploss NUMERIC,
        takeprofit NUMERIC,
        "orderType" VARCHAR(255),
        side VARCHAR(255),
        status VARCHAR(255) DEFAULT 'pending',
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT fk_strategy
          FOREIGN KEY("strategyId") 
            REFERENCES strategies(id)
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS trades (
        id SERIAL PRIMARY KEY,
        "orderId" VARCHAR(255) NOT NULL,
        "strategyId" UUID NOT NULL,
        price NUMERIC,
        timestamp TIMESTAMPTZ,
        qty NUMERIC,
        side VARCHAR(255),
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT fk_order
          FOREIGN KEY("orderId") 
            REFERENCES orders("orderId"),
        CONSTRAINT fk_strategy
          FOREIGN KEY("strategyId") 
            REFERENCES strategies(id)
      );
    `);

    console.log("Database initialized successfully");
  } catch (err) {
    console.error("Error initializing database", err);
  }
  pool.end();
};

init();