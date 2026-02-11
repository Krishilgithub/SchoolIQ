-- Fix infinite recursion in RLS policies
-- The issue: Policies were querying the same table they were protecting

-- Drop problematic policies
DROP POLICY IF EXISTS "Users can view teachers from their school" ON teachers;
DROP POLICY IF EXISTS "Users can view subjects from their school" ON subjects;
DROP POLICY IF EXISTS "Users can view class subjects from their school" ON class_subjects;

-- Recreate teachers policy without self-reference
CREATE POLICY "Users can view teachers from their school"
  ON teachers FOR SELECT
  USING (
    -- School admins can see teachers in their school
    school_id IN (
      SELECT school_id FROM school_admins WHERE user_id = auth.uid()
    )
    OR
    -- Teachers can see their own record
    user_id = auth.uid()
  );

-- Recreate subjects policy without querying teachers table
CREATE POLICY "Users can view subjects from their school"
  ON subjects FOR SELECT
  USING (
    school_id IN (
      SELECT school_id FROM school_admins WHERE user_id = auth.uid()
    )
  );

-- Recreate class_subjects policy without querying teachers table  
CREATE POLICY "Users can view class subjects from their school"
  ON class_subjects FOR SELECT
  USING (
    class_id IN (
      SELECT id FROM classes WHERE school_id IN (
        SELECT school_id FROM school_admins WHERE user_id = auth.uid()
      )
    )
  );
