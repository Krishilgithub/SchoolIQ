# Fix Authentication Database Error

## Problem

Users are getting a 500 error when trying to sign in with the error message "database error querying schema". This is caused by a mismatch between the database trigger and the profiles table structure.

## Root Cause

The `handle_new_user()` trigger function was trying to insert columns (`role`, `school_id`) that don't exist in the `profiles` table, or wasn't providing required NOT NULL fields (`first_name`, `last_name`).

## Solution Steps

### Step 1: Open Supabase SQL Editor

1. Go to your Supabase Dashboard: https://app.supabase.com
2. Select your project
3. Click on "SQL Editor" in the left sidebar
4. Click "New Query"

### Step 2: Run the Fix Script

Copy and paste the entire contents of `supabase/fix_auth_database.sql` into the SQL editor and click "Run".

This script will:

1. Fix the `handle_new_user()` function to match the actual `profiles` table structure
2. Recreate the trigger properly
3. Backfill any existing users who don't have profiles
4. Show you a verification query to confirm everything is working

### Step 3: Verify the Fix

After running the script, you should see a result table showing all users with their profile status. All should show "OK" instead of "MISSING PROFILE".

### Step 4: Test Sign In

Try signing in again with your teacher credentials. The error should now be resolved.

## What was fixed?

### Before (Broken):

```sql
-- This was trying to insert role and school_id which don't exist in profiles table
INSERT INTO public.profiles (id, email, created_at, updated_at)
VALUES (new.id, new.email, now(), now());
-- Also missing required first_name and last_name fields!
```

### After (Fixed):

```sql
-- Now correctly inserts only fields that exist in profiles table
INSERT INTO public.profiles (
  id, email, first_name, last_name,
  avatar_url, phone_number, is_super_admin,
  created_at, updated_at
) VALUES (
  new.id,
  new.email,
  COALESCE(new.raw_user_meta_data->>'first_name', split_part(new.email, '@', 1)),
  COALESCE(new.raw_user_meta_data->>'last_name', 'User'),
  ...
);
```

## Note on Data Model

- **profiles** table: Stores basic user info (name, email, avatar)
- **school_members** table: Stores the relationship between users and schools, including their role
- A user can belong to multiple schools with different roles in each

## Alternative: Reset Database

If you're in development and don't have important data:

1. Go to Database > Schema in Supabase Dashboard
2. Click "Reset Database" (this will wipe all data)
3. Run all migrations in order from `supabase/migrations/` folder
4. Re-seed your test users

## Need Help?

If the issue persists:

1. Check the Supabase Dashboard Logs section for detailed error messages
2. Verify all migrations have been applied in order
3. Check that the profiles table structure matches schema.sql
