-- Test Users Setup SQL
-- Run this script in your Supabase SQL Editor to create test users

-- First, ensure you have a test school created
INSERT INTO schools (id, name, slug, contact_email, onboarding_status)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'Test High School', 'test-high-school', 'contact@testhigh.edu', 'active')
ON CONFLICT (id) DO NOTHING;

-- 1. Super Admin (has is_super_admin = true, no school association needed)
-- Email: superadmin@schooliq.com
-- Password: SuperAdmin123!
-- Note: Create this user via Supabase Auth UI, then run:
INSERT INTO profiles (id, first_name, last_name, email, is_super_admin, role)
VALUES 
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Super', 'Admin', 'superadmin@schooliq.com', true, 'super_admin')
ON CONFLICT (id) DO UPDATE SET is_super_admin = true, role = 'super_admin';

-- 2. School Admin
-- Email: admin@testhigh.edu
-- Password: Admin123!
-- Note: Create this user via Supabase Auth UI with id 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', then run:
INSERT INTO profiles (id, first_name, last_name, email, phone, school_id, role)
VALUES 
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'John', 'Admin', 'admin@testhigh.edu', '+1234567890', '11111111-1111-1111-1111-111111111111', 'admin')
ON CONFLICT (id) DO UPDATE SET role = 'admin', school_id = '11111111-1111-1111-1111-111111111111';

-- Also add to school_admins table for admin-specific features
INSERT INTO school_admins (school_id, user_id, role)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'primary_admin')
ON CONFLICT (school_id, user_id) DO NOTHING;

-- 3. Teacher
-- Email: teacher@testhigh.edu
-- Password: Teacher123!
-- Note: Create this user via Supabase Auth UI with id 'cccccccc-cccc-cccc-cccc-cccccccccccc', then run:
INSERT INTO profiles (id, first_name, last_name, email, phone, school_id, role)
VALUES 
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Jane', 'Smith', 'teacher@testhigh.edu', '+1234567891', '11111111-1111-1111-1111-111111111111', 'teacher')
ON CONFLICT (id) DO UPDATE SET role = 'teacher', school_id = '11111111-1111-1111-1111-111111111111';

-- 4. Student
-- Email: student@testhigh.edu
-- Password: Student123!
-- Note: Create this user via Supabase Auth UI with id 'dddddddd-dddd-dddd-dddd-dddddddddddd', then run:
INSERT INTO profiles (id, first_name, last_name, email, phone, school_id, role)
VALUES 
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Bob', 'Johnson', 'student@testhigh.edu', '+1234567892', '11111111-1111-1111-1111-111111111111', 'student')
ON CONFLICT (id) DO UPDATE SET role = 'student', school_id = '11111111-1111-1111-1111-111111111111';

-- 5. Parent
-- Email: parent@testhigh.edu
-- Password: Parent123!
-- Note: Create this user via Supabase Auth UI with id 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', then run:
INSERT INTO profiles (id, first_name, last_name, email, phone, school_id, role)
VALUES 
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Mary', 'Johnson', 'parent@testhigh.edu', '+1234567893', '11111111-1111-1111-1111-111111111111', 'parent')
ON CONFLICT (id) DO UPDATE SET role = 'parent', school_id = '11111111-1111-1111-1111-111111111111';
