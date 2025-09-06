import pool from "./index.js";
import * as dotenv from "dotenv";

dotenv.config();

const init = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS logs (
        id SERIAL PRIMARY KEY,
        timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        identifier VARCHAR(255),
        data JSONB
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS strategies (
        id SERIAL PRIMARY KEY,
        "strategyName" VARCHAR(255) NOT NULL,
        "stockName" VARCHAR(255) NOT NULL,
        "timeFrame" VARCHAR(255) NOT NULL,
        config JSONB,
        state JSONB,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        "orderId" VARCHAR(255) NOT NULL,
        "strategyId" INTEGER NOT NULL,
        price NUMERIC,
        timestamp TIMESTAMPTZ,
        qty NUMERIC,
        risk NUMERIC,
        stoploss NUMERIC,
        takeprofit NUMERIC,
        "orderType" VARCHAR(255),
        side VARCHAR(255),
        status VARCHAR(255),
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
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
