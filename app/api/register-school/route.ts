import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { CompleteRegistrationData } from "@/lib/validations/school-registration";
import { sendWelcomeEmail } from "@/lib/services/email";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data: CompleteRegistrationData = body;

    // Create Supabase client with service role for admin operations
    const supabase = createAdminClient();

    // 1. Generate school slug from name
    const slug = data.schoolName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    // 2. Check if school name or slug already exists
    const { data: existingSchool } = await supabase
      .from("schools")
      .select("id, name")
      .or(`slug.eq.${slug},name.ilike.${data.schoolName}`)
      .single();

    if (existingSchool) {
      return NextResponse.json(
        { error: "A school with this name already exists" },
        { status: 400 },
      );
    }

    // 3. Check if admin email already exists
    const { data: existingUser } = await supabase.auth.admin.listUsers();
    const emailExists = existingUser.users.some(
      (user) => user.email === data.adminEmail,
    );

    if (emailExists) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 400 },
      );
    }

    // 4. Create school record
    const { data: school, error: schoolError } = await supabase
      .from("schools")
      .insert({
        name: data.schoolName,
        slug,
        school_type: data.schoolType,
        curriculum: data.curriculum || null, // NEW: Board/Curriculum
        website: data.website || null,
        contact_email: data.adminEmail,
        contact_phone: data.phone,
        address: {
          street: data.addressLine1 || null,
          street2: data.addressLine2 || null,
          city: data.city,
          state: data.state,
          zip: data.postalCode || null,
          country: data.country,
        },
        onboarding_status: "active",
        subscription_status: "trial",
        settings: {
          student_count_range: data.studentCountRange,
          academic_year_start_month: data.academicYearStartMonth || "April",
          primary_language: data.primaryLanguage || "English",
          timezone: data.timezone || "Asia/Kolkata",
          primary_goals: data.primaryGoals || [], // NEW: Primary goals array
          expected_start_date: data.expectedStartDate
            ? new Date(data.expectedStartDate).toISOString()
            : null, // NEW: Expected start date
        },
      })
      .select()
      .single();

    if (schoolError || !school) {
      console.error("School creation error:", schoolError);
      return NextResponse.json(
        { error: "Failed to create school. Please try again." },
        { status: 500 },
      );
    }

    // 5. Split admin name for metadata
    const nameParts = data.adminFullName.trim().split(" ");
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(" ") || "";

    // 6. Create admin user account using Supabase Auth Admin
    const { data: authUser, error: authError } =
      await supabase.auth.admin.createUser({
        email: data.adminEmail,
        password: data.password,
        email_confirm: true, // Auto-confirm email for now
        user_metadata: {
          first_name: firstName,
          last_name: lastName,
          full_name: data.adminFullName,
          phone: data.adminPhone || null,
          role: "school_admin",
        },
      });

    if (authError || !authUser.user) {
      console.error("Admin user creation error:", authError);
      // Rollback: Delete the school
      await supabase.from("schools").delete().eq("id", school.id);
      return NextResponse.json(
        { error: "Failed to create admin account. Please try again." },
        { status: 500 },
      );
    }

    // Note: Profile is automatically created by handle_new_user trigger

    // Note: Update profile with school_id (trigger creates profile but doesn't know school_id)
    await supabase
      .from("profiles")
      .update({ school_id: school.id, phone_number: data.adminPhone || null })
      .eq("id", authUser.user.id);

    // 7. Add admin to school_admins junction table with specific role
    const { error: schoolAdminError } = await supabase
      .from("school_admins")
      .insert({
        school_id: school.id,
        user_id: authUser.user.id,
        role: "primary_admin",
        specific_role: data.adminRole || null, // NEW: Specific role (Principal, Admin, etc.)
      });

    if (schoolAdminError) {
      console.error("School admin linking error:", schoolAdminError);
      // Rollback: Delete user, profile, and school
      await supabase.auth.admin.deleteUser(authUser.user.id);
      await supabase.from("profiles").delete().eq("id", authUser.user.id);
      await supabase.from("schools").delete().eq("id", school.id);
      return NextResponse.json(
        { error: "Failed to link admin to school. Please try again." },
        { status: 500 },
      );
    }
    // Create staff invitations if provided
    if (data.inviteStaffEmails && data.inviteStaffEmails.length > 0) {
      const invitations = data.inviteStaffEmails.map((email: string) => ({
        school_id: school.id,
        invited_by: authUser.user.id,
        email: email.toLowerCase(),
        status: "pending",
      }));

      const { error: invitationError } = await supabase
        .from("staff_invitations" as any)
        .insert(invitations as any);

      if (invitationError) {
        console.error("Staff invitation creation error:", invitationError);
        // Non-fatal error - log but continue
      } else {
        // TODO: Send invitation emails
        console.log(
          `Created ${invitations.length} staff invitations for school ${school.id}`,
        );
      }
    }

    // 8. Send welcome email to school admin
    try {
      const emailResult = await sendWelcomeEmail({
        adminEmail: data.adminEmail,
        adminName: data.adminFullName,
        schoolName: data.schoolName,
        loginUrl: process.env.NEXT_PUBLIC_APP_URL,
      });

      if (emailResult.success) {
        console.log(
          `Welcome email sent successfully to ${data.adminEmail} (Message ID: ${emailResult.messageId})`,
        );
      } else {
        console.error(
          `Failed to send welcome email to ${data.adminEmail}:`,
          emailResult.error,
        );
        // Non-fatal error - registration still succeeded
      }
    } catch (emailError) {
      console.error("Unexpected error sending welcome email:", emailError);
      // Non-fatal error - registration still succeeded
    }

    // 9. Return success response
    return NextResponse.json(
      {
        success: true,
        message: "School registered successfully!",
        data: {
          schoolId: school.id,
          schoolName: school.name,
          slug: school.slug,
          adminEmail: data.adminEmail,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Unexpected error during school registration:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again later." },
      { status: 500 },
    );
  }
}
