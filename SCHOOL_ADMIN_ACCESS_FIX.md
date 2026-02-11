# School Admin Dashboard Access Fix

## Problem

School admin users were being redirected to `/login` when trying to access dashboard pages (students, teachers, attendance, etc.) because they weren't properly registered in the `school_admins` table.

## Solution

### Step 1: Run the SQL Fix Script

1. Open your **Supabase Dashboard**
2. Go to **SQL Editor**
3. Open the file: `supabase/fix_school_admin_access.sql`
4. Copy and paste the entire contents into the SQL Editor
5. Click **Run** to execute the script

This script will:

- ✅ Ensure the demo school exists
- ✅ Add all admin users from `school_members` to `school_admins` table
- ✅ Update profile roles to 'admin'
- ✅ Grant necessary permissions
- ✅ Show you a verification report of all admin users

### Step 2: Verify Your Setup

After running the script, you should see output showing all admin users with their:

- Email address
- Full name
- Profile role
- School admin role
- Associated school
- Member status

### Step 3: Test Access

1. Log in with an admin account (e.g., `admin@test.com`, `admin@schooliq.com`)
2. Navigate to: `http://localhost:3000/school-admin/dashboard`
3. You should now have access without being redirected to login
4. Try accessing other pages:
   - `/school-admin/students`
   - `/school-admin/teachers`
   - `/school-admin/attendance`
   - `/school-admin/assignments`
   - `/school-admin/communication`
   - `/school-admin/reports`
   - `/school-admin/settings`

## What Was Fixed

### Code Changes

1. **Updated `getCurrentSchoolId()` function** in `lib/services/auth.ts`:
   - Now checks `school_admins` table first (primary method)
   - Falls back to `school_members` table if not found
   - Last resort: checks `profiles` table for `school_id`
   - Provides helpful console warnings if fallback methods are used

2. **Created SQL fix script** (`supabase/fix_school_admin_access.sql`):
   - Syncs admin users from `school_members` to `school_admins`
   - Ensures proper role assignments
   - Grants necessary database permissions

### Database Tables Involved

- **`school_admins`**: Primary table for admin access (required)
- **`school_members`**: General membership table (all roles)
- **`profiles`**: User profile information

## Test Credentials

Available admin accounts (see `TEST_CREDENTIALS.md`):

- admin@test.com
- admin@schooliq.com
- admin@springfield.edu

## Troubleshooting

### Still getting redirected to login?

1. **Check if you're logged in**:
   - Clear browser cache and cookies
   - Try logging out and back in

2. **Verify user is in school_admins table**:

   ```sql
   SELECT * FROM public.school_admins WHERE user_id = 'YOUR_USER_ID';
   ```

3. **Check profile role**:

   ```sql
   SELECT id, email, role, school_id FROM public.profiles WHERE email = 'YOUR_EMAIL';
   ```

4. **Verify school exists**:
   ```sql
   SELECT * FROM public.schools WHERE slug = 'demo-school';
   ```

### Console shows warnings?

If you see console warnings like:

- "Admin user found in school_members but not in school_admins"
- "Admin user has school_id in profile but not in school_admins"

**Solution**: Re-run the `fix_school_admin_access.sql` script

## Additional Notes

- The fix is backward-compatible and won't break existing functionality
- Future admin users should be added to both `school_members` and `school_admins` tables
- The code now gracefully handles missing entries and provides helpful debug information
