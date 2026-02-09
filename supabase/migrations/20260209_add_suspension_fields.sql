-- Add is_suspended and deleted_at columns to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

-- Create an index on is_suspended for better filtering
CREATE INDEX IF NOT EXISTS idx_profiles_is_suspended ON profiles(is_suspended);
