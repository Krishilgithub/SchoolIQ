/* eslint-disable */
const { createClient } = require("@supabase/supabase-js");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing credentials in .env file");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seedAdmin() {
  const email = "admin@schooliq.com";
  const password = "securepassword123";

  console.log(`Creating Admin ${email}...`);

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: "Admin",
        last_name: "User",
      },
    },
  });

  if (error) {
    console.error("Error creating user:", error);
    return;
  }

  console.log("User created:", data.user?.id);
}

seedAdmin();
