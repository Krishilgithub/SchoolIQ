-- Fix auth trigger to handle required profile fields
-- This migration updates the handle_new_user function to properly create profiles

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
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
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'first_name', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'last_name', 'User'),
    COALESCE(new.raw_user_meta_data->>'role', 'staff'),
    (new.raw_user_meta_data->>'school_id')::UUID,
    COALESCE((new.raw_user_meta_data->>'is_super_admin')::BOOLEAN, false),
    now(),
    now()
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.handle_new_user() IS 'Automatically creates a profile when a new user signs up. Extracts user metadata to populate profile fields with fallback defaults.';
