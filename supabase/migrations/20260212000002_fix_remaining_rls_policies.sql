-- Fix remaining RLS policies that still reference school_admins table
-- Update staff_invitations and teachers tables to use profiles table

-- =============================
-- STAFF_INVITATIONS TABLE
-- =============================
DROP POLICY IF EXISTS "School admins can view their school invitations" ON staff_invitations;
DROP POLICY IF EXISTS "School admins can update their school invitations" ON staff_invitations;
DROP POLICY IF EXISTS "School admins can delete their school invitations" ON staff_invitations;
DROP POLICY IF EXISTS "School admins can insert invitations" ON staff_invitations;
DROP POLICY IF EXISTS "School admins can create invitations" ON staff_invitations;

-- School admins can view invitations for their school
CREATE POLICY "School admins can view their school invitations"
  ON staff_invitations FOR SELECT
  USING (
    school_id IN (
      SELECT school_id FROM profiles 
      WHERE id = auth.uid() AND role = 'school_admin'
    )
  );

-- School admins can create invitations
CREATE POLICY "School admins can create invitations"
  ON staff_invitations FOR INSERT
  WITH CHECK (
    school_id IN (
      SELECT school_id FROM profiles 
      WHERE id = auth.uid() AND role = 'school_admin'
    )
    AND invited_by = auth.uid()
  );

-- School admins can manage invitations for their school
CREATE POLICY "School admins can manage invitations"
  ON staff_invitations FOR ALL
  USING (
    school_id IN (
      SELECT school_id FROM profiles 
      WHERE id = auth.uid() AND role = 'school_admin'
    )
  )
  WITH CHECK (
    school_id IN (
      SELECT school_id FROM profiles 
      WHERE id = auth.uid() AND role = 'school_admin'
    )
  );

-- =============================
-- TEACHERS TABLE
-- =============================
DROP POLICY IF EXISTS "Users can view teachers from their school" ON teachers;
DROP POLICY IF EXISTS "Admins can manage teachers in their school" ON teachers;

-- Allow all school members to view teachers
CREATE POLICY "Users can view teachers from their school"
  ON teachers FOR SELECT
  USING (
    school_id IN (
      SELECT school_id FROM profiles 
      WHERE id = auth.uid() AND school_id IS NOT NULL
    )
  );

-- Allow school admins to manage teachers
CREATE POLICY "School admins can manage teachers"
  ON teachers FOR ALL
  USING (
    school_id IN (
      SELECT school_id FROM profiles 
      WHERE id = auth.uid() AND role = 'school_admin'
    )
  )
  WITH CHECK (
    school_id IN (
      SELECT school_id FROM profiles 
      WHERE id = auth.uid() AND role = 'school_admin'
    )
  );
