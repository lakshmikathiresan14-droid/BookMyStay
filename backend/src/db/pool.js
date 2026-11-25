import "dotenv/config";
import pg from "pg";

const { Pool } = pg;

// One shared connection pool for the whole app.
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Small helper so the controllers read nicely: query("SELECT ...", [values])
export const query = (text, params) => pool.query(text, params);
