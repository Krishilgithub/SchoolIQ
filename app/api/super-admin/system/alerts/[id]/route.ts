import { NextRequest, NextResponse } from "next/server";
import { superAdminService } from "@/lib/services/super-admin";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
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

    const { id } = await params;
    const { action } = await request.json();

    let result;
    if (action === "acknowledge") {
      result = await superAdminService.acknowledgeAlert(id, user.id);
    } else if (action === "resolve") {
      result = await superAdminService.resolveAlert(id);
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error updating alert:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
