-- Clean up all test users
-- Run this in Supabase SQL Editor if you want to remove test accounts

DO $$
DECLARE
  deleted_count INTEGER := 0;
  test_emails TEXT[] := ARRAY[
    'admin@test.com',
    'teacher@test.com', 
    'student@test.com',
    'parent@test.com'
  ];
  v_user_id UUID;
  email TEXT;
BEGIN
  RAISE NOTICE '🗑️  Cleaning up test users...';
  RAISE NOTICE '';
  
  FOREACH email IN ARRAY test_emails
  LOOP
    -- Get user ID
    SELECT id INTO v_user_id FROM auth.users WHERE email = email;
    
    IF v_user_id IS NOT NULL THEN
      -- Delete from profiles (will cascade to related tables)
      DELETE FROM public.profiles WHERE id = v_user_id;
      
      -- Delete from auth.users
      DELETE FROM auth.users WHERE id = v_user_id;
      
      deleted_count := deleted_count + 1;
      RAISE NOTICE '✅ Deleted: %', email;
    ELSE
      RAISE NOTICE '⏭️  Not found: %', email;
    END IF;
  END LOOP;
  
  RAISE NOTICE '';
  RAISE NOTICE '✅ Cleanup complete! Deleted % user(s)', deleted_count;
END $$;

-- Verify cleanup
SELECT 
  COUNT(*) as remaining_test_users
FROM profiles
WHERE email IN ('admin@test.com', 'teacher@test.com', 'student@test.com', 'parent@test.com');
