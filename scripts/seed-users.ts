import { Client } from "pg";
import bcrypt from "bcrypt";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Explicitly load .env from root
const envPath = path.resolve(__dirname, "../.env");
const envLocalPath = path.resolve(__dirname, "../.env.local");

dotenv.config({ path: envLocalPath });
dotenv.config({ path: envPath });

async function seed() {
  let connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

  if (!connectionString) {
    console.error("❌ DATABASE_URL or POSTGRES_URL is not defined");
    process.exit(1);
  }

  // Handle case where user pasted "psql '...'"
  const trimmed = connectionString.trim();
  if (trimmed.startsWith("psql '")) {
    connectionString = trimmed.substring(6);
    if (connectionString.endsWith("'")) {
      connectionString = connectionString.substring(
        0,
        connectionString.length - 1,
      );
    }
  } else if (trimmed.startsWith("psql ")) {
    const parts = trimmed.split(" ");
    const urlPart = parts.find(
      (p) => p.startsWith("postgresql://") || p.startsWith("postgres://"),
    );
    if (urlPart) connectionString = urlPart;
  }

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();

    const email = "admin@schooliq.com";
    const password = "admin"; // Change this in production
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if user exists
    const res = await client.query("SELECT id FROM users WHERE email = $1", [
      email,
    ]);
    if (res.rows.length > 0) {
      console.log("✅ Super Admin already exists.");
    } else {
      await client.query(
        `
            INSERT INTO users (email, password_hash, role, first_name, last_name, is_active)
            VALUES ($1, $2, 'super_admin', 'Super', 'Admin', true)
        `,
        [email, hashedPassword],
      );
      console.log("✅ Created Super Admin user.");
    }
  } catch (err) {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

seed();
