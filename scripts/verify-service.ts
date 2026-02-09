import { createClient } from "@supabase/supabase-js";
import { DatabaseService } from "../services/database";
import { Database } from "../types/database.types";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing credentials");
  process.exit(1);
}

const client = createClient<Database>(supabaseUrl, supabaseKey);
const dbService = new DatabaseService(client);

async function verify() {
  console.log("Verifying DatabaseService...");

  // 1. Fetch School
  const schoolSlug = "springfield";
  console.log(`Fetching school with slug: ${schoolSlug}`);
  const school = await dbService.getSchoolBySlug(schoolSlug);

  if (!school) {
    console.error(
      "❌ Failed to fetch school 'springfield'. Did you run the seed?",
    );
    return;
  }
  console.log(`✅ Found school: ${school.name} (${school.id})`);

  // 2. Fetch Students
  console.log(`Fetching students for school ID: ${school.id}`);
  const students = await dbService.getStudentsBySchool(school.id);

  if (students.length === 0) {
    console.warn("⚠️ No students found. Check seed data.");
  } else {
    console.log(`✅ Found ${students.length} students.`);
    students.forEach((s) => console.log(`   - ${s.first_name} ${s.last_name}`));
  }
}

verify();
