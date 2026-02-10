import { NextRequest, NextResponse } from "next/server";
import { superAdminService } from "@/lib/services/super-admin";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("is_super_admin")
      .eq("id", user.id)
      .single();

    if (!profile?.is_super_admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email") || undefined;
    const success = searchParams.get("success");

    const attempts = await superAdminService.getLoginAttempts({
      email,
      success: success !== null ? success === "true" : undefined,
    });

    return NextResponse.json(attempts);
  } catch (error: any) {
    console.error("Error fetching login history:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
