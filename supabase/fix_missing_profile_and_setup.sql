-- Fix the missing profile for admin@schooliq.com and setup test credentials
-- Run this in Supabase SQL Editor

-- 1. Fix the admin@schooliq.com user that has MISSING PROFILE
INSERT INTO public.profiles (
  id,
  email,
  first_name,
  last_name,
  is_super_admin,
  created_at,
  updated_at
)
SELECT 
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'first_name', 'School'),
  COALESCE(u.raw_user_meta_data->>'last_name', 'Admin'),
  false,
  u.created_at,
  now()
FROM auth.users u
WHERE u.email = 'admin@schooliq.com'
  AND NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = u.id);

-- 2. Create or ensure demo school exists
INSERT INTO schools (
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
  'demo-school-00000-00000-00000-00001',
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

-- 3. Link all test users to the demo school with appropriate roles
-- teacher@test.com -> teacher role
INSERT INTO school_members (user_id, school_id, role, status, joined_at)
SELECT 
  p.id,
  (SELECT id FROM schools WHERE slug = 'demo-school'),
  'teacher',
  'active',
  now()
FROM profiles p
WHERE p.email = 'teacher@test.com'
ON CONFLICT (user_id, school_id) DO UPDATE SET
  role = 'teacher',
  status = 'active';

-- student@test.com -> student role
INSERT INTO school_members (user_id, school_id, role, status, joined_at)
SELECT 
  p.id,
  (SELECT id FROM schools WHERE slug = 'demo-school'),
  'student',
  'active',
  now()
FROM profiles p
WHERE p.email = 'student@test.com'
ON CONFLICT (user_id, school_id) DO UPDATE SET
  role = 'student',
  status = 'active';

-- parent@test.com -> guardian role
INSERT INTO school_members (user_id, school_id, role, status, joined_at)
SELECT 
  p.id,
  (SELECT id FROM schools WHERE slug = 'demo-school'),
  'guardian',
  'active',
  now()
FROM profiles p
WHERE p.email = 'parent@test.com'
ON CONFLICT (user_id, school_id) DO UPDATE SET
  role = 'guardian',
  status = 'active';

-- admin@test.com -> school_admin role
INSERT INTO school_members (user_id, school_id, role, status, joined_at)
SELECT 
  p.id,
  (SELECT id FROM schools WHERE slug = 'demo-school'),
  'school_admin',
  'active',
  now()
FROM profiles p
WHERE p.email = 'admin@test.com'
ON CONFLICT (user_id, school_id) DO UPDATE SET
  role = 'school_admin',
  status = 'active';

-- admin@schooliq.com -> school_admin role
INSERT INTO school_members (user_id, school_id, role, status, joined_at)
SELECT 
  p.id,
  (SELECT id FROM schools WHERE slug = 'demo-school'),
  'school_admin',
  'active',
  now()
FROM profiles p
WHERE p.email = 'admin@schooliq.com'
ON CONFLICT (user_id, school_id) DO UPDATE SET
  role = 'school_admin',
  status = 'active';

-- teacher@schooliq.com -> teacher role
INSERT INTO school_members (user_id, school_id, role, status, joined_at)
SELECT 
  p.id,
  (SELECT id FROM schools WHERE slug = 'demo-school'),
  'teacher',
  'active',
  now()
FROM profiles p
WHERE p.email = 'teacher@schooliq.com'
ON CONFLICT (user_id, school_id) DO UPDATE SET
  role = 'teacher',
  status = 'active';

-- parent@schooliq.com -> guardian role
INSERT INTO school_members (user_id, school_id, role, status, joined_at)
SELECT 
  p.id,
  (SELECT id FROM schools WHERE slug = 'demo-school'),
  'guardian',
  'active',
  now()
FROM profiles p
WHERE p.email = 'parent@schooliq.com'
ON CONFLICT (user_id, school_id) DO UPDATE SET
  role = 'guardian',
  status = 'active';

-- student@schooliq.com -> student role
INSERT INTO school_members (user_id, school_id, role, status, joined_at)
SELECT 
  p.id,
  (SELECT id FROM schools WHERE slug = 'demo-school'),
  'student',
  'active',
  now()
FROM profiles p
WHERE p.email = 'student@schooliq.com'
ON CONFLICT (user_id, school_id) DO UPDATE SET
  role = 'student',
  status = 'active';

-- 4. Verify everything is set up correctly
SELECT 
  u.email,
  p.first_name || ' ' || p.last_name as full_name,
  COALESCE(sm.role::text, 'NO ROLE ASSIGNED') as role,
  COALESCE(s.name, 'NO SCHOOL') as school,
  sm.status
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
LEFT JOIN public.school_members sm ON u.id = sm.user_id
LEFT JOIN public.schools s ON sm.school_id = s.id
WHERE u.email LIKE '%test.com' OR u.email LIKE '%schooliq.com' OR u.email LIKE '%@spring%'
ORDER BY u.email;
