import { Client } from "pg";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Explicitly load .env from root
const envPath = path.resolve(__dirname, "../.env");
const envLocalPath = path.resolve(__dirname, "../.env.local");

dotenv.config({ path: envLocalPath });
dotenv.config({ path: envPath });

console.log("📂 Loading .env from:", envPath);
console.log("📂 Loading .env.local from:", envLocalPath);

async function runMigration() {
  let connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

  if (!connectionString) {
    console.error("❌ DATABASE_URL or POSTGRES_URL is not defined in .env");
    console.log(
      "Available env vars:",
      Object.keys(process.env).filter(
        (k) => k.includes("DB") || k.includes("URL"),
      ),
    );
    process.exit(1);
  }

  // Fix: Handle case where user pasted "psql '...'"
  const trimmed = connectionString.trim();
  if (trimmed.startsWith("psql '")) {
    console.log("🧹 Cleaned up DATABASE_URL (removed psql prefix)");
    connectionString = trimmed.substring(6); // remove "psql '"
    if (connectionString.endsWith("'")) {
      connectionString = connectionString.substring(
        0,
        connectionString.length - 1,
      );
    }
  } else if (trimmed.startsWith("psql ")) {
    // psql postgresql://...
    const parts = trimmed.split(" ");
    const urlPart = parts.find(
      (p) => p.startsWith("postgresql://") || p.startsWith("postgres://"),
    );
    if (urlPart) connectionString = urlPart;
  }

  console.log(
    "🔗 Connection String (masked):",
    connectionString.replace(/:[^:@]+@/, ":***@"),
  );

  // Handle Supabase/Neon connection strings (pooling vs direct)
  // For migrations, direct connection is often preferred (port 5432)
  const client = new Client({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }, // Required for Neon/Supabase usually
  });

  try {
    console.log("🔌 Connecting to database...");
    await client.connect();
    console.log("✅ Connected.");

    const migrationFile = path.join(
      __dirname,
      "../supabase/migrations/20250208120000_create_users_table.sql",
    );
    const sql = fs.readFileSync(migrationFile, "utf8");

    console.log("📝 Running migration...");
    await client.query(sql);
    console.log("✅ Migration completed successfully.");

    // Check if table exists
    const res = await client.query("SELECT to_regclass('public.users');");
    console.log("🔍 Table check:", res.rows[0]);
  } catch (err) {
    console.error("❌ Migration failed:", err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigration();
