import supabase from "./index.js";
import * as dotenv from "dotenv";

dotenv.config();

const clearDb = async () => {
  try {
    // Clear tables using Supabase
    await supabase.from('orders').delete().neq('id', 0); // Delete all rows
    await supabase.from('trades').delete().neq('id', 0); // Delete all rows  
    await supabase.from('strategies').delete().neq('id', 0); // Delete all rows
    await supabase.from('logs').delete().neq('id', 0); // Delete all rows

    console.log("Database cleared successfully");
  } catch (err) {
    console.error("Error clearing database", err);
  }
};

clearDb();
