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
    const integrationType = searchParams.get("type") || undefined;

    const integrations =
      await superAdminService.getIntegrationConfigs(integrationType);

    return NextResponse.json(integrations);
  } catch (error: any) {
    console.error("Error fetching integrations:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const integration = await superAdminService.upsertIntegrationConfig(body);

    return NextResponse.json(integration, { status: 201 });
  } catch (error: any) {
    console.error("Error creating integration:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
