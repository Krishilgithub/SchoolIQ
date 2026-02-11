-- Fix infinite recursion in school_admins RLS policy
-- Run this in Supabase SQL Editor

-- 1. Drop all existing policies on school_admins that might cause recursion
DROP POLICY IF EXISTS "school_admins_select" ON public.school_admins;
DROP POLICY IF EXISTS "school_admins_all" ON public.school_admins;
DROP POLICY IF EXISTS "Enable read access for school admins" ON public.school_admins;
DROP POLICY IF EXISTS "Enable all operations for super admins" ON public.school_admins;
DROP POLICY IF EXISTS "school_admins_select_own" ON public.school_admins;
DROP POLICY IF EXISTS "school_admins_select_super_admin" ON public.school_admins;
DROP POLICY IF EXISTS "school_admins_all_super_admin" ON public.school_admins;

-- 2. Create simple, non-recursive policies

-- Allow authenticated users to read their own school_admin records
CREATE POLICY "school_admins_select_own"
ON public.school_admins FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Allow super admins to read all records (using profiles table, no recursion)
CREATE POLICY "school_admins_select_super_admin"
ON public.school_admins FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_super_admin = true
  )
);

-- Allow super admins to modify all records
CREATE POLICY "school_admins_all_super_admin"
ON public.school_admins FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_super_admin = true
  )
);

-- 3. Verify the policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'school_admins'
ORDER BY policyname;
