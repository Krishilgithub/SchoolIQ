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
    const body = await request.json();

    let result;
    if ("isEnabled" in body) {
      result = await superAdminService.toggleFeatureFlag(id, body.isEnabled);
    } else if ("rolloutPercentage" in body) {
      result = await superAdminService.updateFlagRollout(
        id,
        body.rolloutPercentage,
        body.targetSchools,
        body.targetUsers,
      );
    } else {
      return NextResponse.json({ error: "Invalid update" }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error updating feature flag:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
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
    await superAdminService.deleteFeatureFlag(id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting feature flag:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
