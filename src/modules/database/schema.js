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
        level VARCHAR(10) DEFAULT 'info',
        data JSONB
      );
    `);
    
    // Check if level column exists in logs table
    const checkLevelColumn = await pool.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'logs' AND column_name = 'level';
    `);
    
    // Add level column if it doesn't exist
    if (checkLevelColumn.rows.length === 0) {
      console.log('Adding missing level column to logs table...');
      await pool.query(`ALTER TABLE logs ADD COLUMN level VARCHAR(10) DEFAULT 'info';`);
    }
    
    // Create index on identifier and level for faster log queries
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_logs_identifier ON logs(identifier);
      CREATE INDEX IF NOT EXISTS idx_logs_level ON logs(level);
      CREATE INDEX IF NOT EXISTS idx_logs_timestamp ON logs(timestamp);
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

    const constraintName = 'unique_strategy';
    const checkConstraint = await pool.query(`
      SELECT conname
      FROM pg_constraint
      WHERE conname = '${constraintName}';
    `);

    if (checkConstraint.rows.length === 0) {
      await pool.query(`
        ALTER TABLE strategies
        ADD CONSTRAINT ${constraintName} UNIQUE ("strategyName", "stockName", "timeFrame");
      `);
    };

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
