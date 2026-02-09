-- Apply this migration to fix the authentication issue
-- Run this SQL in your Supabase SQL Editor

-- 1. First, fix the handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    first_name,
    last_name,
    avatar_url,
    phone_number,
    is_super_admin,
    created_at,
    updated_at
  ) VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'first_name', COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))),
    COALESCE(new.raw_user_meta_data->>'last_name', 'User'),
    new.raw_user_meta_data->>'avatar_url',
    new.raw_user_meta_data->>'phone_number',
    COALESCE((new.raw_user_meta_data->>'is_super_admin')::BOOLEAN, false),
    now(),
    now()
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Drop and recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Backfill/update profiles for any existing auth.users without profiles
-- Only insert users that don't already have a profile (check both id and email)
INSERT INTO public.profiles (
  id,
  email,
  first_name,
  last_name,
  avatar_url,
  phone_number,
  is_super_admin,
  created_at,
  updated_at
)
SELECT 
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'first_name', COALESCE(u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1))),
  COALESCE(u.raw_user_meta_data->>'last_name', 'User'),
  u.raw_user_meta_data->>'avatar_url',
  u.raw_user_meta_data->>'phone_number',
  COALESCE((u.raw_user_meta_data->>'is_super_admin')::BOOLEAN, false),
  u.created_at,
  now()
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p 
  WHERE p.id = u.id OR p.email = u.email
);

-- 4. Verify the fix
SELECT 
  u.id,
  u.email,
  p.first_name,
  p.last_name,
  CASE WHEN p.id IS NULL THEN 'MISSING PROFILE' ELSE 'OK' END as status
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
ORDER BY u.created_at DESC;
