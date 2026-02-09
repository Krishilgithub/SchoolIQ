-- Fix handle_new_user trigger to match actual profiles table structure
-- The profiles table only has: id, email, first_name, last_name, avatar_url, phone_number, is_super_admin

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

-- Drop and recreate trigger to ensure it's using the latest function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

COMMENT ON FUNCTION public.handle_new_user() IS 'Creates profile record when user signs up. Extracts metadata with safe defaults for required fields.';
