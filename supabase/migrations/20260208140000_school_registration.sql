-- School Registration Migration
-- Creates school_admins table and updates profiles table

-- Create student_count_range enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE student_count_range AS ENUM ('1-100', '101-500', '501-1000', '1000+');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create onboarding_status enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE onboarding_status AS ENUM ('pending', 'active', 'suspended');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Update schools table to add new fields if they don't exist
DO $$ BEGIN
    -- Add address fields
    ALTER TABLE schools ADD COLUMN IF NOT EXISTS address_line1 TEXT;
    ALTER TABLE schools ADD COLUMN IF NOT EXISTS address_line2 TEXT;
    ALTER TABLE schools ADD COLUMN IF NOT EXISTS city TEXT;
    ALTER TABLE schools ADD COLUMN IF NOT EXISTS state TEXT;
    ALTER TABLE schools ADD COLUMN IF NOT EXISTS postal_code TEXT;
    ALTER TABLE schools ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'India';
    
    -- Add phone and rename contact_phone if needed
    ALTER TABLE schools ADD COLUMN IF NOT EXISTS phone TEXT;
    
    -- Add student count range
    ALTER TABLE schools ADD COLUMN IF NOT EXISTS student_count_range student_count_range;
    
    -- Add onboarding status
    ALTER TABLE schools ADD COLUMN IF NOT EXISTS onboarding_status onboarding_status DEFAULT 'pending';
    
    -- Add domain for future custom domains
    ALTER TABLE schools ADD COLUMN IF NOT EXISTS domain TEXT;
END $$;

-- Create school_admins junction table
CREATE TABLE IF NOT EXISTS school_admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'primary_admin' CHECK (role IN ('primary_admin', 'admin')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(school_id, user_id)
);

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_school_admins_school_id ON school_admins(school_id);
CREATE INDEX IF NOT EXISTS idx_school_admins_user_id ON school_admins(user_id);

-- Update profiles table to add school_id if it doesn't exist
DO $$ BEGIN
    ALTER TABLE profiles ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES schools(id) ON DELETE SET NULL;
END $$;

-- Add index for profiles school_id
CREATE INDEX IF NOT EXISTS idx_profiles_school_id ON profiles(school_id);

-- Add indexes to schools for better performance
CREATE INDEX IF NOT EXISTS idx_schools_slug ON schools(slug);
CREATE INDEX IF NOT EXISTS idx_schools_contact_email ON schools(contact_email);
CREATE INDEX IF NOT EXISTS idx_schools_onboarding_status ON schools(onboarding_status) WHERE onboarding_status = 'pending';

-- RLS Policies for school_admins table
ALTER TABLE school_admins ENABLE ROW LEVEL SECURITY;

-- School admins can view their own school's admins
CREATE POLICY "School admins can view admins from their school"
    ON school_admins FOR SELECT
    USING (
        auth.uid() IN (
            SELECT user_id FROM school_admins WHERE school_id = school_admins.school_id
        )
    );

-- Only super admins can insert/update/delete school admins (for now)
-- This will be handled via service role in the API
CREATE POLICY "Service role can manage school admins"
    ON school_admins FOR ALL
    USING (auth.jwt()->>'role' = 'service_role');

-- Comment on tables for documentation
COMMENT ON TABLE school_admins IS 'Junction table linking schools to their admin users';
COMMENT ON COLUMN school_admins.role IS 'Admin role: primary_admin (creator) or admin (additional)';
COMMENT ON COLUMN schools.student_count_range IS 'Approximate number of students in the school';
COMMENT ON COLUMN schools.onboarding_status IS 'Current onboarding status of the school';
