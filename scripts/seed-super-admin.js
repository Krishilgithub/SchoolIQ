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

async function seedSuperAdmin() {
  const email = "krishilagrawal026@gmail.com";
  const password = "SuperSecurePassword123!"; // Change this immediately after login

  console.log(`Creating Super Admin ${email}...`);

  // 1. Create Auth User
  const {
    data: { user },
    error: createError,
  } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      first_name: "Krishil",
      last_name: "Agrawal",
    },
  });

  let userId = user?.id;

  if (createError) {
    if (
      createError.message.includes("already registered") ||
      createError.status === 422
    ) {
      console.log("User already exists. Fetching...");
      const {
        data: { users },
      } = await supabase.auth.admin.listUsers();
      const existingUser = users.find((u) => u.email === email);
      if (existingUser) {
        userId = existingUser.id;
      }
    } else {
      console.error("Error creating user:", createError);
      return;
    }
  }

  if (userId) {
    console.log(`✅ User ID: ${userId}`);
    await setupSuperAdminProfile(userId);
  }
}

async function setupSuperAdminProfile(userId) {
  console.log("Setting up Super Admin profile...");

  // 2. Upsert Profile with is_super_admin = TRUE
  const { error: profileError } = await supabase.from("profiles").upsert({
    id: userId,
    email: "krishilagrawal026@gmail.com",
    first_name: "Krishil",
    last_name: "Agrawal",
    is_super_admin: true,
  });

  if (profileError) console.error("Error upserting profile:", profileError);
  else console.log("✅ Profile ensured as SUPER ADMIN.");

  console.log("\n🎉 Super Admin Ready!");
  console.log("Email: krishilagrawal026@gmail.com");
  console.log("Password: SuperSecurePassword123!");
}

seedSuperAdmin();
