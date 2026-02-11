-- Fix School Admin Access Issue
-- This script ensures admin users are properly added to the school_admins table
-- Run this in Supabase SQL Editor

-- 1. First, ensure the demo school exists (using proper UUID format)
INSERT INTO public.schools (
  id,
  name,
  slug,
  school_type,
  contact_email,
  contact_phone,
  subscription_status,
  created_at,
  updated_at
)
VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  'Demo School',
  'demo-school',
  'k12',
  'admin@demo.com',
  '+1-555-0100',
  'active',
  now(),
  now()
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  contact_email = EXCLUDED.contact_email,
  subscription_status = EXCLUDED.subscription_status;

-- 2. Fix incorrect role assignments for demo users
UPDATE public.profiles SET role = 'guardian' WHERE email = 'parent@schooliq.com' AND role != 'guardian';
UPDATE public.profiles SET role = 'student' WHERE email = 'student@schooliq.com' AND role != 'student';
UPDATE public.profiles SET role = 'teacher' WHERE email = 'teacher@schooliq.com' AND role != 'teacher';

-- Remove non-admin users from school_admins
DELETE FROM public.school_admins
WHERE user_id IN (
  SELECT id FROM public.profiles
  WHERE email IN ('parent@schooliq.com', 'student@schooliq.com', 'teacher@schooliq.com')
);

-- 3. Add all test users to school_members with correct roles
INSERT INTO public.school_members (user_id, school_id, role, status, joined_at)
SELECT p.id, '00000000-0000-0000-0000-000000000001'::uuid, 'guardian'::user_role, 'active'::user_status, now()
FROM public.profiles p WHERE p.email = 'parent@schooliq.com'
ON CONFLICT (user_id, school_id) DO UPDATE SET role = 'guardian', status = 'active';

INSERT INTO public.school_members (user_id, school_id, role, status, joined_at)
SELECT p.id, '00000000-0000-0000-0000-000000000001'::uuid, 'student'::user_role, 'active'::user_status, now()
FROM public.profiles p WHERE p.email = 'student@schooliq.com'
ON CONFLICT (user_id, school_id) DO UPDATE SET role = 'student', status = 'active';

INSERT INTO public.school_members (user_id, school_id, role, status, joined_at)
SELECT p.id, '00000000-0000-0000-0000-000000000001'::uuid, 'teacher'::user_role, 'active'::user_status, now()
FROM public.profiles p WHERE p.email = 'teacher@schooliq.com'
ON CONFLICT (user_id, school_id) DO UPDATE SET role = 'teacher', status = 'active';

INSERT INTO public.school_members (user_id, school_id, role, status, joined_at)
SELECT p.id, '00000000-0000-0000-0000-000000000001'::uuid, 'guardian'::user_role, 'active'::user_status, now()
FROM public.profiles p WHERE p.email = 'parent@test.com'
ON CONFLICT (user_id, school_id) DO UPDATE SET role = 'guardian', status = 'active';

INSERT INTO public.school_members (user_id, school_id, role, status, joined_at)
SELECT p.id, '00000000-0000-0000-0000-000000000001'::uuid, 'student'::user_role, 'active'::user_status, now()
FROM public.profiles p WHERE p.email = 'student@test.com'
ON CONFLICT (user_id, school_id) DO UPDATE SET role = 'student', status = 'active';

INSERT INTO public.school_members (user_id, school_id, role, status, joined_at)
SELECT p.id, '00000000-0000-0000-0000-000000000001'::uuid, 'teacher'::user_role, 'active'::user_status, now()
FROM public.profiles p WHERE p.email = 'teacher@test.com'
ON CONFLICT (user_id, school_id) DO UPDATE SET role = 'teacher', status = 'active';

INSERT INTO public.school_members (user_id, school_id, role, status, joined_at)
SELECT p.id, '00000000-0000-0000-0000-000000000001'::uuid, 'school_admin'::user_role, 'active'::user_status, now()
FROM public.profiles p WHERE p.email = 'admin@test.com'
ON CONFLICT (user_id, school_id) DO UPDATE SET role = 'school_admin', status = 'active';

-- 4. Sync school_admin users from school_members to school_admins table
INSERT INTO public.school_admins (school_id, user_id, role)
SELECT sm.school_id, sm.user_id, 'primary_admin'::text
FROM public.school_members sm
JOIN public.profiles p ON sm.user_id = p.id
WHERE sm.role = 'school_admin' AND sm.status = 'active'
ON CONFLICT (school_id, user_id) DO NOTHING;

-- 5. Ensure profiles table has the correct role for admins
UPDATE public.profiles p
SET role = 'school_admin'
FROM public.school_members sm
WHERE p.id = sm.user_id 
  AND sm.role = 'school_admin'
  AND p.role IS DISTINCT FROM 'school_admin';

-- 6. Grant necessary permissions to admin users
GRANT SELECT, INSERT, UPDATE, DELETE ON public.students TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.teachers TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.classes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.subjects TO authenticated;

-- 7. Final verification - this should show all users properly configured
SELECT 
  p.email,
  p.first_name || ' ' || p.last_name as full_name,
  p.role::text as profile_role,
  sm.role::text as member_role,
  s.name as school_name,
  sm.status::text,
  CASE 
    WHEN sa.user_id IS NOT NULL THEN '✓ Admin Access'
    WHEN sm.role = 'school_admin' THEN '⚠ Missing from school_admins'
    ELSE '✓ Correct'
  END as access_status
FROM public.profiles p
LEFT JOIN public.school_members sm ON p.id = sm.user_id
LEFT JOIN public.schools s ON sm.school_id = s.id
LEFT JOIN public.school_admins sa ON p.id = sa.user_id
WHERE p.email LIKE '%schooliq.com' OR p.email LIKE '%test.com'
ORDER BY 
  CASE 
    WHEN p.role::text = 'super_admin' THEN 0
    WHEN p.role::text = 'school_admin' THEN 1
    WHEN p.role::text = 'teacher' THEN 2
    WHEN p.role::text = 'student' THEN 3
    WHEN p.role::text = 'guardian' THEN 4
    ELSE 5
  END,
  p.email;
