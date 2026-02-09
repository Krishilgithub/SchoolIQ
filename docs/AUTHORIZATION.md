# Authorization System Documentation

## Overview

The SchoolIQ authorization system provides a robust way to protect pages and components based on user roles and permissions.

## Components

### 1. Unauthorized Page (`/unauthorized`)

A fully functional 403 error page that:

- Shows user their current account and role
- Provides smart navigation buttons based on user role
- Allows switching accounts (sign out and login)
- Offers support contact option
- Displays beautiful, animated UI with proper error messaging

**Features:**

- ✅ Detects user role and shows personalized info
- ✅ Smart "Go to Dashboard" button (routes to correct dashboard)
- ✅ "Go Back" button (returns to previous page)
- ✅ "Switch Account" button (signs out and redirects to login)
- ✅ Contact support via email
- ✅ Animated UI with Framer Motion
- ✅ Beautiful gradient background
- ✅ Responsive design

### 2. Authorization Hooks

#### `useRequireAuth(options)`

The main authorization hook with full customization:

```tsx
import { useRequireAuth } from "@/hooks/use-require-auth";

function TeacherDashboard() {
  const { user, profile, isLoading, isAuthorized } = useRequireAuth({
    requiredRoles: ["teacher", "admin", "school_admin"],
    unauthorizedRedirect: "/unauthorized",
    loginRedirect: "/auth/login",
  });

  if (isLoading) {
    return <AuthLoading message="Checking permissions..." />;
  }

  return <div>Teacher Dashboard Content</div>;
}
```

**Options:**

- `requiredRoles`: Array of roles that can access the page
- `requireSuperAdmin`: Boolean, set to true for super admin only pages
- `unauthorizedRedirect`: Where to redirect if unauthorized (default: "/unauthorized")
- `loginRedirect`: Where to redirect if not logged in (default: "/auth/login")

#### `useRequireSuperAdmin()`

Shorthand hook for super admin only pages:

```tsx
import { useRequireSuperAdmin } from "@/hooks/use-require-auth";

function SuperAdminPage() {
  const { user, profile, isLoading } = useRequireSuperAdmin();

  if (isLoading) {
    return <AuthLoading />;
  }

  return <div>Super Admin Content</div>;
}
```

#### `useRequireSchoolAdmin()`

For school administrators (admin or school_admin roles):

```tsx
import { useRequireSchoolAdmin } from "@/hooks/use-require-auth";

function SchoolSettingsPage() {
  const { user, profile, isLoading } = useRequireSchoolAdmin();

  if (isLoading) {
    return <AuthLoading message="Loading settings..." />;
  }

  return <div>School Settings</div>;
}
```

#### `useRequireTeacher()`

For teachers, admins, and school admins:

```tsx
import { useRequireTeacher } from "@/hooks/use-require-auth";

function ClassManagementPage() {
  const { user, profile, isLoading } = useRequireTeacher();

  if (isLoading) {
    return <AuthLoading />;
  }

  return <div>Class Management</div>;
}
```

### 3. Loading Components

#### `AuthLoading`

Full-page loading spinner for authorization checks:

```tsx
import { AuthLoading } from "@/components/shared/auth-loading";

<AuthLoading message="Verifying your permissions..." />;
```

#### `AuthLoadingInline`

Inline loading spinner for smaller areas:

```tsx
import { AuthLoadingInline } from "@/components/shared/auth-loading";

<AuthLoadingInline message="Loading..." />;
```

## Complete Page Example

Here's a complete example of a protected page:

```tsx
"use client";

import { useRequireAuth } from "@/hooks/use-require-auth";
import { AuthLoading } from "@/components/shared/auth-loading";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function StudentReportsPage() {
  // Require teacher, admin, or school_admin role
  const { user, profile, isLoading } = useRequireAuth({
    requiredRoles: ["teacher", "admin", "school_admin"],
  });

  // Show loading state
  if (isLoading) {
    return <AuthLoading message="Loading student reports..." />;
  }

  // User is authenticated and authorized, show content
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Student Reports</h1>

      <Card>
        <CardHeader>
          <CardTitle>Welcome, {profile?.first_name}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Your role: {profile?.role}</p>
          {/* Report content here */}
        </CardContent>
      </Card>
    </div>
  );
}
```

## Server-Side Protection

For server components, use middleware or direct database checks:

```tsx
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function ProtectedServerPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, is_super_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_super_admin) {
    redirect("/unauthorized");
  }

  return <div>Protected Content</div>;
}
```

## Role Hierarchy

The system supports these roles:

- `super_admin` - Platform owner (access to everything)
- `school_admin` / `admin` - School administrators
- `teacher` - Teaching staff
- `student` - Students
- `parent` / `guardian` - Parents/Guardians
- `staff` - Support staff

**Note:** Super admins automatically have access to all pages, even if not in the `requiredRoles` array.

## Best Practices

1. **Use Client Components for Hooks**: Authorization hooks use React hooks, so pages must be client components (`"use client"`)

2. **Always Show Loading State**: Display a loading spinner while checking authorization

3. **Handle Errors Gracefully**: The system shows toast notifications for errors

4. **Consistent Redirects**: Use `/unauthorized` for 403 errors and `/auth/login` for unauthenticated users

5. **Smart Defaults**: The hooks have sensible defaults, so you often don't need to specify redirect paths

6. **Test All Roles**: Ensure your authorization logic works for all relevant roles

## Troubleshooting

### User Gets Redirected to Unauthorized Page

- Check if the user has the correct role in the database
- Verify the `requiredRoles` array includes the user's role
- Check if the profile is loading correctly (check browser console)

### Infinite Redirect Loop

- Make sure `/unauthorized` and `/auth/login` pages don't use authorization hooks
- Check middleware configuration

### Hook Not Working

- Ensure the page is a client component (`"use client"`)
- Verify `AuthProvider` wraps the entire app in `providers.tsx`
- Check that Supabase is properly configured

## Testing

To test authorization:

1. Create test users with different roles
2. Try accessing protected pages
3. Verify redirects work correctly
4. Test all buttons on the unauthorized page
5. Verify toast notifications appear

## Future Enhancements

- [ ] Fine-grained permission system
- [ ] Role-based UI component visibility
- [ ] Audit logging for unauthorized access attempts
- [ ] Custom authorization policies per school
- [ ] Time-based access restrictions
