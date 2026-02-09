import { Client } from "pg";
import * as dotenv from "dotenv";
import path from "path";

// Load env from root
dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

async function main() {
  const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

  if (!connectionString) {
    console.error(
      "No DATABASE_URL or POSTGRES_URL found in environment variables.",
    );
    console.log(
      "Please ensure .env or .env.local exists in the root directory.",
    );
    process.exit(1);
  }

  console.log(`Connecting to database...`);

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }, // Required for Supabase transaction pooler/direct connection
  });

  try {
    await client.connect();
    console.log("Connected.");

    // 1. Enable RLS on school_members
    console.log("Enabling RLS on school_members...");
    await client.query(
      `ALTER TABLE IF EXISTS school_members ENABLE ROW LEVEL SECURITY;`,
    );

    // 2. Create Policy for Select
    console.log("Creating SELECT policy for school_members...");
    // Drop first to avoid error if exists
    await client.query(
      `DROP POLICY IF EXISTS "Users view own school membership" ON school_members;`,
    );

    await client.query(`
      CREATE POLICY "Users view own school membership" ON school_members
      FOR SELECT USING (user_id = auth.uid());
    `);

    console.log("✅ Successfully applied RLS policies to school_members.");
  } catch (err) {
    console.error("❌ Error executing SQL:", err);
  } finally {
    await client.end();
  }
}

main();
