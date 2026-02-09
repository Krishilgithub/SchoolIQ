-- Create a parent/guardian account for testing
-- Run this SQL in your Supabase SQL Editor

-- Step 1: Insert into auth.users (you'll need to do this via Supabase Dashboard > Authentication > Users > Add User)
-- Email: parent@test.com
-- Password: parent123
-- Confirm Email: Yes

-- Step 2: After creating the auth user, get their ID and run this:
-- Replace 'YOUR_USER_ID_HERE' with the actual UUID from auth.users
-- Replace 'YOUR_SCHOOL_ID_HERE' with your school's UUID from the schools table

-- Get a school ID first
SELECT id, name FROM schools LIMIT 1;

-- Update profile for the parent user (assuming profile was auto-created via trigger)
-- Replace the ID below with the auth user ID you created
UPDATE profiles 
SET 
  first_name = 'Test',
  last_name = 'Parent',
  role = 'guardian',
  school_id = (SELECT id FROM schools LIMIT 1),
  is_super_admin = false
WHERE email = 'parent@test.com';

-- Verify the update
SELECT 
  id,
  email,
  first_name,
  last_name,
  role,
  school_id,
  is_super_admin
FROM profiles 
WHERE email = 'parent@test.com';
