import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { pool } from "./pool.js";

// Creates the hotels table (safe to run more than once).
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sql = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8");

try {
  await pool.query(sql);
  console.log("Database ready: hotels table created (or already existed).");
} catch (err) {
  console.error("Could not set up the database:", err.message);
  console.error("Check DATABASE_URL in server/.env and that the database exists.");
  process.exitCode = 1;
} finally {
  await pool.end();
}
