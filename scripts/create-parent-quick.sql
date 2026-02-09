-- Quick Parent Account Creation for SchoolIQ
-- Run this in Supabase SQL Editor

DO $$
DECLARE
  v_user_id UUID;
  v_school_id UUID;
  v_profile_exists BOOLEAN;
  parent_email TEXT := 'parent@test.com';
  parent_pass TEXT := 'parent123';
BEGIN
  -- Get school ID
  SELECT id INTO v_school_id FROM schools LIMIT 1;
  
  IF v_school_id IS NULL THEN
    RAISE EXCEPTION 'No school found. Please create a school first.';
  END IF;
  
  -- Check if user already exists in auth
  SELECT id INTO v_user_id FROM auth.users WHERE email = parent_email;
  
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
      parent_email,
      crypt(parent_pass, gen_salt('bf')),
      now(),
      jsonb_build_object(
        'first_name', 'Test',
        'last_name', 'Parent',
        'full_name', 'Test Parent',
        'role', 'guardian'
      ),
      now(),
      now(),
      '',
      ''
    ) RETURNING id INTO v_user_id;
    
    RAISE NOTICE 'Created auth user with ID: %', v_user_id;
  END IF;
  
  -- Check if profile exists
  SELECT EXISTS(SELECT 1 FROM public.profiles WHERE id = v_user_id) INTO v_profile_exists;
  
  IF v_profile_exists THEN
    -- Update existing profile
    UPDATE public.profiles
    SET 
      role = 'guardian',
      school_id = v_school_id,
      first_name = 'Test',
      last_name = 'Parent',
      email = parent_email
    WHERE id = v_user_id;
    
    RAISE NOTICE 'Updated existing profile to guardian role';
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
      parent_email,
      'Test',
      'Parent',
      'guardian',
      v_school_id,
      false,
      now(),
      now()
    );
    
    RAISE NOTICE 'Created new profile with guardian role';
  END IF;
  
  RAISE NOTICE '✅ Parent account ready!';
  RAISE NOTICE '📧 Email: %', parent_email;
  RAISE NOTICE '🔑 Password: %', parent_pass;
  RAISE NOTICE '👤 User ID: %', v_user_id;
  RAISE NOTICE '🏫 School ID: %', v_school_id;
END $$;

-- Verify the parent account
SELECT 
  p.id,
  p.email,
  p.first_name,
  p.last_name,
  p.role,
  p.school_id,
  s.name as school_name
FROM profiles p
LEFT JOIN schools s ON p.school_id = s.id
WHERE p.email = 'parent@test.com';
