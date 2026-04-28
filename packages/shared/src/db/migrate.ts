import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { getPool, closePool } from "./pool.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function migrate() {
  const pool = getPool();

  await pool.query(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const migrationsDir = path.join(__dirname, "migrations");
  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  const { rows: executed } = await pool.query("SELECT name FROM _migrations");
  const executedNames = new Set(executed.map((r) => r.name));

  for (const file of files) {
    if (executedNames.has(file)) {
      console.log(`  Skipping ${file} (already executed)`);
      continue;
    }

    const sql = fs.readFileSync(path.join(migrationsDir, file), "utf-8");
    console.log(`  Running ${file}...`);
    await pool.query(sql);
    await pool.query("INSERT INTO _migrations (name) VALUES ($1)", [file]);
    console.log(`  Done: ${file}`);
  }

  console.log("Migrations complete.");
  await closePool();
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
