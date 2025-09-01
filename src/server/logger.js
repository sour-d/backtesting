import pool from "../db/index";

const isProd = process.env.ENV === "prod";

export function clearLog() {
  if (isProd) {
    pool.query("TRUNCATE TABLE logs");
  }
}

export default function logger({ stockName, timeFrame, strategyName }) {
  const identifier = `${stockName}-${timeFrame}-${strategyName}`;

  return async (...rawArgs) => {
    if (isProd) {
      try {
        await pool.query(
          "INSERT INTO logs (identifier, data) VALUES ($1, $2)",
          [identifier, JSON.stringify(rawArgs)]
        );
      } catch (err) {
        console.error("Error inserting log into database", err);
      }
    } else {
      console.log("DEBUG ----->", ...rawArgs);
    }
  };
}
