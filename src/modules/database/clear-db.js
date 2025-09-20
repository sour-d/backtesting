import pool from "./index.js";
import * as dotenv from "dotenv";

dotenv.config();

const clearDb = async () => {
  try {
    await pool.query('TRUNCATE TABLE orders RESTART IDENTITY CASCADE;');
    await pool.query('TRUNCATE TABLE strategies RESTART IDENTITY CASCADE;');
    await pool.query('TRUNCATE TABLE logs RESTART IDENTITY CASCADE;');
    console.log("Database cleared successfully");
  } catch (err) {
    console.error("Error clearing database", err);
  }
  pool.end();
};

clearDb();
