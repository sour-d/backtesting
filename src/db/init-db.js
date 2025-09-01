import pool from "./index";
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

    console.log("Database initialized successfully");
  } catch (err) {
    console.error("Error initializing database", err);
  }
  pool.end();
};

init();
