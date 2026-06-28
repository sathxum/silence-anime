/**
 * Auto-migration runner.
 *
 * Applies every .sql file in supabase/migrations (in lexical order) against
 * your Supabase Postgres database. Idempotent — every migration uses
 * `create ... if not exists` / `create or replace`, so re-running is safe.
 *
 * Connection: we connect directly to Postgres using the service-role
 * credentials. We derive the connection string from SUPABASE_URL plus
 * SUPABASE_DB_PASSWORD when provided; otherwise we accept a full
 * SUPABASE_DB_URL. The pooled connection string is preferred for serverless.
 *
 * Usage:
 *   node scripts/migrate.mjs
 *
 * Required env (any ONE of):
 *   SUPABASE_DB_URL                          (full postgres connection string)
 *   SUPABASE_URL + SUPABASE_DB_PASSWORD      (we build the string for you)
 */
import { readdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import postgres from "postgres";

const __dirname = dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = join(__dirname, "..", "supabase", "migrations");

function buildConnectionString() {
  if (process.env.SUPABASE_DB_URL) return process.env.SUPABASE_DB_URL;

  const url = process.env.SUPABASE_URL;
  const password = process.env.SUPABASE_DB_PASSWORD;
  if (!url || !password) {
    throw new Error(
      "Provide SUPABASE_DB_URL, or SUPABASE_URL + SUPABASE_DB_PASSWORD."
    );
  }
  // SUPABASE_URL looks like https://<ref>.supabase.co
  const ref = new URL(url).hostname.split(".")[0];
  // Direct connection to the project database. Works in any region.
  return `postgresql://postgres:${encodeURIComponent(
    password
  )}@db.${ref}.supabase.co:5432/postgres`;
}

async function main() {
  const connectionString = buildConnectionString();
  const sql = postgres(connectionString, { max: 1, ssl: "require" });

  try {
    const files = (await readdir(MIGRATIONS_DIR))
      .filter((f) => f.endsWith(".sql"))
      .sort();

    if (files.length === 0) {
      console.log("No migration files found.");
      return;
    }

    for (const file of files) {
      const path = join(MIGRATIONS_DIR, file);
      const contents = await readFile(path, "utf8");
      process.stdout.write(`Applying ${file} ... `);
      await sql.unsafe(contents);
      console.log("ok");
    }
    console.log(`\nApplied ${files.length} migration(s) successfully.`);
  } finally {
    await sql.end({ timeout: 5 });
  }
}

main().catch((err) => {
  console.error("\nMigration failed:");
  console.error(err.message || err);
  process.exit(1);
});
