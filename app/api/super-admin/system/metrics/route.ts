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
    const metricName = searchParams.get("name") || undefined;
    const hours = parseInt(searchParams.get("hours") || "24");

    const metrics = await superAdminService.getSystemMetrics(metricName, hours);

    return NextResponse.json(metrics);
  } catch (error: any) {
    console.error("Error fetching metrics:", error);
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
    const metric = await superAdminService.recordSystemMetric(body);

    return NextResponse.json(metric, { status: 201 });
  } catch (error: any) {
    console.error("Error recording metric:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
