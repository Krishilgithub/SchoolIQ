-- Add new fields for enhanced registration wizard
-- Migration: Add curriculum, role, and staff invitations support

-- ============================================================================
-- 1. Add curriculum field to schools table
-- ============================================================================
DO $$ BEGIN
    -- Create curriculum enum if it doesn't exist
    CREATE TYPE curriculum_type AS ENUM (
        'CBSE',
        'ICSE',
        'State Board',
        'IB',
        'Cambridge/IGCSE',
        'Other'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add curriculum column to schools table
ALTER TABLE schools 
ADD COLUMN IF NOT EXISTS curriculum curriculum_type;

-- Add primary goals and expected start date to settings JSONB
-- (No need to alter, JSONB is flexible, but document the expected structure)
COMMENT ON COLUMN schools.settings IS 'Expected fields: student_count_range, academic_year_start_month, primary_language, timezone, primary_goals (array), expected_start_date (ISO date string)';

-- ============================================================================
-- 2. Add specific_role field to school_admins table
-- ============================================================================
DO $$ BEGIN
    -- Create admin_role enum if it doesn't exist
    CREATE TYPE admin_role_type AS ENUM (
        'Principal',
        'Vice Principal',
        'Owner',
        'Admin',
        'Teacher'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add specific_role column to school_admins table
ALTER TABLE school_admins 
ADD COLUMN IF NOT EXISTS specific_role admin_role_type;

-- ============================================================================
-- 3. Create staff_invitations table
-- ============================================================================
CREATE TABLE IF NOT EXISTS staff_invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),
    invited_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '7 days',
    accepted_at TIMESTAMPTZ,
    created_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- Ensure unique invitations per school+email combination
    UNIQUE(school_id, email)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_staff_invitations_school_id ON staff_invitations(school_id);
CREATE INDEX IF NOT EXISTS idx_staff_invitations_email ON staff_invitations(email);
CREATE INDEX IF NOT EXISTS idx_staff_invitations_status ON staff_invitations(status);

-- Add comment for documentation
COMMENT ON TABLE staff_invitations IS 'Tracks email invitations sent to staff members during school registration and later invitations';

-- ============================================================================
-- 4. Function to automatically expire invitations
-- ============================================================================
CREATE OR REPLACE FUNCTION expire_old_invitations()
RETURNS void AS $$
BEGIN
    UPDATE staff_invitations
    SET status = 'expired'
    WHERE status = 'pending'
    AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 5. Add RLS policies for staff_invitations
-- ============================================================================
ALTER TABLE staff_invitations ENABLE ROW LEVEL SECURITY;

-- Allow school admins to view their school's invitations
CREATE POLICY "School admins can view their school invitations"
ON staff_invitations
FOR SELECT
USING (
    school_id IN (
        SELECT school_id FROM school_admins WHERE user_id = auth.uid()
    )
);

-- Allow school admins to create invitations for their school
CREATE POLICY "School admins can create invitations"
ON staff_invitations
FOR INSERT
WITH CHECK (
    school_id IN (
        SELECT school_id FROM school_admins WHERE user_id = auth.uid()
    )
    AND invited_by = auth.uid()
);

-- Allow school admins to update (cancel) their school's invitations
CREATE POLICY "School admins can update their school invitations"
ON staff_invitations
FOR UPDATE
USING (
    school_id IN (
        SELECT school_id FROM school_admins WHERE user_id = auth.uid()
    )
);

-- ============================================================================
-- 6. Optional: Migration notes
-- ============================================================================
-- After running this migration, update your API to:
-- 1. Store curriculum when creating schools
-- 2. Store specific_role when creating school_admins
-- 3. Store primary_goals and expected_start_date in schools.settings JSONB
-- 4. Create staff_invitations records for invited emails
-- 5. Send invitation emails with unique tokens
