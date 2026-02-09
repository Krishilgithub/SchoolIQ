import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";

// Load env from root
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log("Testing connection to:", supabaseUrl);

  // Try to access a system table or just a simple query
  // Since we haven't applied schema yet, tables like 'schools' might not exist.
  // We can try fetching users (auth) since we have service role.

  const { data, error } = await supabase.auth.admin.listUsers();

  if (error) {
    console.error("Connection failed:", error.message);
  } else {
    console.log("Connection successful! Found", data.users.length, "users.");
  }
}

testConnection();
