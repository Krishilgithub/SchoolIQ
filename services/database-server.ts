import { createClient } from "@/lib/supabase/server";
import { DatabaseService } from "@/services/database";
import { Database } from "@/types/database.types";
import { SupabaseClient } from "@supabase/supabase-js";

// Factory function for Server Components
export async function getDatabaseService() {
  const client = await createClient();
  // No casting needed if types match, or keep expect-error if suppressed
  return new DatabaseService(client as unknown as SupabaseClient<Database>);
}
