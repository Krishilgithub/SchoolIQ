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
    const status = searchParams.get("status") || undefined;
    const jobType = searchParams.get("type") || undefined;

    const jobs = await superAdminService.getBackgroundJobs({ status, jobType });

    return NextResponse.json(jobs);
  } catch (error: any) {
    console.error("Error fetching jobs:", error);
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
    const job = await superAdminService.createBackgroundJob(body);

    return NextResponse.json(job, { status: 201 });
  } catch (error: any) {
    console.error("Error creating job:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
