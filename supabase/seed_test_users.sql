-- Seed Test Users for Development
-- Run this AFTER fixing the auth trigger with fix_auth_database.sql

-- Note: You'll need to create these users through Supabase Auth UI or API first
-- This script creates the profile and school_member records for test users

-- Ensure you have a test school (create one if needed)
INSERT INTO schools (id, name, slug, school_type, contact_email, contact_phone, subscription_status)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Demo High School',
  'demo-high-school',
  'k12',
  'admin@demo-school.com',
  '+1234567890',
  'active'
)
ON CONFLICT (id) DO NOTHING;

-- Create profiles for test users (in case they weren't created by trigger)
-- You need to replace the UUIDs with actual user IDs from auth.users table

-- Example: Teacher user
-- First, create the user in Supabase Auth UI with email: teacher@demo.com, password: Teacher123!
-- Then get their UUID from auth.users and update this script

-- Get user IDs from auth.users table
DO $$
DECLARE
  teacher_id UUID;
  admin_id UUID;
  student_id UUID;
  school_id UUID := '00000000-0000-0000-0000-000000000001';
BEGIN
  -- Find existing users by email
  SELECT id INTO teacher_id FROM auth.users WHERE email = 'teacher@demo.com';
  SELECT id INTO admin_id FROM auth.users WHERE email = 'admin@demo.com';
  SELECT id INTO student_id FROM auth.users WHERE email = 'student@demo.com';

  -- If users exist, create/update their profiles and school memberships
  IF teacher_id IS NOT NULL THEN
    INSERT INTO public.profiles (id, email, first_name, last_name)
    VALUES (teacher_id, 'teacher@demo.com', 'John', 'Teacher')
    ON CONFLICT (id) DO UPDATE SET
      first_name = 'John',
      last_name = 'Teacher';

    INSERT INTO public.school_members (user_id, school_id, role, status)
    VALUES (teacher_id, school_id, 'teacher', 'active')
    ON CONFLICT (user_id, school_id) DO UPDATE SET
      role = 'teacher',
      status = 'active';
  END IF;

  IF admin_id IS NOT NULL THEN
    INSERT INTO public.profiles (id, email, first_name, last_name)
    VALUES (admin_id, 'admin@demo.com', 'Sarah', 'Admin')
    ON CONFLICT (id) DO UPDATE SET
      first_name = 'Sarah',
      last_name = 'Admin';

    INSERT INTO public.school_members (user_id, school_id, role, status)
    VALUES (admin_id, school_id, 'school_admin', 'active')
    ON CONFLICT (user_id, school_id) DO UPDATE SET
      role = 'school_admin',
      status = 'active';
  END IF;

  IF student_id IS NOT NULL THEN
    INSERT INTO public.profiles (id, email, first_name, last_name)
    VALUES (student_id, 'student@demo.com', 'Alice', 'Student')
    ON CONFLICT (id) DO UPDATE SET
      first_name = 'Alice',
      last_name = 'Student';

    INSERT INTO public.school_members (user_id, school_id, role, status)
    VALUES (student_id, school_id, 'student', 'active')
    ON CONFLICT (user_id, school_id) DO UPDATE SET
      role = 'student',
      status = 'active';
  END IF;
END $$;

-- Verify the setup
SELECT 
  u.email,
  p.first_name,
  p.last_name,
  sm.role,
  sm.status,
  s.name as school_name
FROM auth.users u
JOIN public.profiles p ON u.id = p.id
JOIN public.school_members sm ON u.id = sm.user_id
JOIN public.schools s ON sm.school_id = s.id
WHERE u.email IN ('teacher@demo.com', 'admin@demo.com', 'student@demo.com')
ORDER BY u.email;
