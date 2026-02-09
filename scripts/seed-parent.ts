import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
const envPath = path.resolve(__dirname, "../.env");
dotenv.config({ path: envPath });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing Supabase environment variables");
  console.error("NEXT_PUBLIC_SUPABASE_URL:", supabaseUrl ? "✓" : "✗");
  console.error("SUPABASE_SERVICE_ROLE_KEY:", supabaseServiceKey ? "✓" : "✗");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function seedParent() {
  try {
    console.log("🌱 Starting parent account seeding...\n");

    // First, get a school to assign the parent to
    const { data: schools, error: schoolError } = await supabase
      .from("schools")
      .select("id, name")
      .limit(1)
      .single();

    if (schoolError || !schools) {
      console.error("❌ No schools found. Please create a school first.");
      console.error("Error:", schoolError);
      process.exit(1);
    }

    console.log(`✓ Found school: ${schools.name} (${schools.id})\n`);

    // Create parent user in Supabase Auth
    const parentEmail = "parent@test.com";
    const parentPassword = "parent123";

    // Check if user already exists
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id, email, role")
      .eq("email", parentEmail)
      .single();

    if (existingProfile) {
      console.log("✓ User already exists, updating to guardian role...");

      // Update existing profile to guardian role
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          role: "guardian",
          school_id: schools.id,
          first_name: "Test",
          last_name: "Parent",
        })
        .eq("email", parentEmail);

      if (updateError) {
        console.error("❌ Failed to update profile:", updateError);
        process.exit(1);
      }

      console.log("✓ Updated profile to guardian role");
    } else {
      // Create new user via signUp
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: parentEmail,
        password: parentPassword,
        options: {
          data: {
            first_name: "Test",
            last_name: "Parent",
            full_name: "Test Parent",
          },
        },
      });

      if (authError) {
        console.error("❌ Failed to create user:", authError);
        process.exit(1);
      }

      if (!authData.user) {
        console.error("❌ No user data returned");
        process.exit(1);
      }

      console.log("✓ Created user in auth");

      // Wait a moment for trigger to create profile
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Update the profile with guardian role and school
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          role: "guardian",
          school_id: schools.id,
        })
        .eq("id", authData.user.id);

      if (updateError) {
        console.error("❌ Failed to update profile:", updateError);
        console.error(
          "You may need to update the profile manually in Supabase",
        );
      } else {
        console.log("✓ Updated profile with guardian role");
      }
    }

    console.log("\n✅ Parent account created successfully!\n");
    console.log("📧 Email: parent@test.com");
    console.log("🔑 Password: parent123");
    console.log(`🏫 School: ${schools.name}\n`);
    console.log("You can now login with these credentials!");
  } catch (error) {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  }
}

seedParent();
