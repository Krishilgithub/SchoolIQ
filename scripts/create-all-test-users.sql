-- Create All Test Users for SchoolIQ
-- Run this in Supabase SQL Editor
-- Creates: School Admin, Teacher, Student, and Parent accounts

DO $$
DECLARE
  v_school_id UUID;
  v_user_id UUID;
  v_profile_exists BOOLEAN;
  
  -- Test users configuration
  test_users JSONB := '[
    {"email": "admin@test.com", "password": "admin123", "first_name": "School", "last_name": "Admin", "role": "school_admin"},
    {"email": "teacher@test.com", "password": "teacher123", "first_name": "Test", "last_name": "Teacher", "role": "teacher"},
    {"email": "student@test.com", "password": "student123", "first_name": "Test", "last_name": "Student", "role": "student"},
    {"email": "parent@test.com", "password": "parent123", "first_name": "Test", "last_name": "Parent", "role": "guardian"}
  ]'::JSONB;
  
  user_data JSONB;
  user_email TEXT;
  user_pass TEXT;
  user_first TEXT;
  user_last TEXT;
  user_role_text TEXT;
  
BEGIN
  -- Get school ID
  SELECT id INTO v_school_id FROM schools LIMIT 1;
  
  IF v_school_id IS NULL THEN
    RAISE EXCEPTION 'No school found. Please create a school first.';
  END IF;
  
  RAISE NOTICE '🏫 Using School ID: %', v_school_id;
  RAISE NOTICE '';
  RAISE NOTICE '🌱 Creating test users...';
  RAISE NOTICE '================================';
  
  -- Loop through each test user
  FOR user_data IN SELECT * FROM jsonb_array_elements(test_users)
  LOOP
    user_email := user_data->>'email';
    user_pass := user_data->>'password';
    user_first := user_data->>'first_name';
    user_last := user_data->>'last_name';
    user_role_text := user_data->>'role';
    
    -- Check if user exists in auth
    SELECT id INTO v_user_id FROM auth.users WHERE email = user_email;
    
    IF v_user_id IS NULL THEN
      -- Create new auth user
      INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        raw_user_meta_data,
        created_at,
        updated_at,
        confirmation_token,
        recovery_token
      ) VALUES (
        '00000000-0000-0000-0000-000000000000'::UUID,
        gen_random_uuid(),
        'authenticated',
        'authenticated',
        user_email,
        crypt(user_pass, gen_salt('bf')),
        now(),
        jsonb_build_object(
          'first_name', user_first,
          'last_name', user_last,
          'full_name', user_first || ' ' || user_last,
          'role', user_role_text
        ),
        now(),
        now(),
        '',
        ''
      ) RETURNING id INTO v_user_id;
    END IF;
    
    -- Check if profile exists
    SELECT EXISTS(SELECT 1 FROM public.profiles WHERE id = v_user_id) INTO v_profile_exists;
    
    IF v_profile_exists THEN
      -- Update existing profile
      UPDATE public.profiles
      SET 
        role = user_role_text::user_role,
        school_id = v_school_id,
        first_name = user_first,
        last_name = user_last,
        email = user_email
      WHERE id = v_user_id;
    ELSE
      -- Create new profile
      INSERT INTO public.profiles (
        id,
        email,
        first_name,
        last_name,
        role,
        school_id,
        is_super_admin,
        created_at,
        updated_at
      ) VALUES (
        v_user_id,
        user_email,
        user_first,
        user_last,
        user_role_text::user_role,
        v_school_id,
        false,
        now(),
        now()
      );
    END IF;
    
    RAISE NOTICE '✅ %-15s | %', user_role_text, user_email;
    
  END LOOP;
  
  RAISE NOTICE '';
  RAISE NOTICE '================================';
  RAISE NOTICE '✅ All test users created!';
  RAISE NOTICE '';
  RAISE NOTICE '📋 LOGIN CREDENTIALS:';
  RAISE NOTICE '--------------------------------';
  RAISE NOTICE 'School Admin:';
  RAISE NOTICE '  📧 admin@test.com';
  RAISE NOTICE '  🔑 admin123';
  RAISE NOTICE '';
  RAISE NOTICE 'Teacher:';
  RAISE NOTICE '  📧 teacher@test.com';
  RAISE NOTICE '  🔑 teacher123';
  RAISE NOTICE '';
  RAISE NOTICE 'Student:';
  RAISE NOTICE '  📧 student@test.com';
  RAISE NOTICE '  🔑 student123';
  RAISE NOTICE '';
  RAISE NOTICE 'Parent/Guardian:';
  RAISE NOTICE '  📧 parent@test.com';
  RAISE NOTICE '  🔑 parent123';
  RAISE NOTICE '--------------------------------';
  
END $$;

-- Verify all test users
SELECT 
  p.email,
  p.first_name,
  p.last_name,
  p.role,
  s.name as school_name,
  p.created_at
FROM profiles p
LEFT JOIN schools s ON p.school_id = s.id
WHERE p.email IN ('admin@test.com', 'teacher@test.com', 'student@test.com', 'parent@test.com')
ORDER BY 
  CASE p.role
    WHEN 'school_admin' THEN 1
    WHEN 'teacher' THEN 2
    WHEN 'student' THEN 3
    WHEN 'guardian' THEN 4
    ELSE 5
  END;
