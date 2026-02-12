-- Fix RLS policies for academic tables to use profiles table instead of school_admins/teachers
-- This aligns with the events table fix and the current authentication system

-- =============================
-- CLASSES TABLE
-- =============================
DROP POLICY IF EXISTS "Users can view classes from their school" ON classes;
DROP POLICY IF EXISTS "Admins can manage classes in their school" ON classes;

-- Allow all school members to view classes
CREATE POLICY "Users can view classes from their school"
  ON classes FOR SELECT
  USING (
    school_id IN (
      SELECT school_id FROM profiles 
      WHERE id = auth.uid() AND school_id IS NOT NULL
    )
  );

-- Allow school admins to manage classes
CREATE POLICY "School admins can manage classes"
  ON classes FOR ALL
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
-- SUBJECTS TABLE
-- =============================
DROP POLICY IF EXISTS "Users can view subjects from their school" ON subjects;
DROP POLICY IF EXISTS "Admins can manage subjects in their school" ON subjects;

-- Allow all school members to view subjects
CREATE POLICY "Users can view subjects from their school"
  ON subjects FOR SELECT
  USING (
    school_id IN (
      SELECT school_id FROM profiles 
      WHERE id = auth.uid() AND school_id IS NOT NULL
    )
  );

-- Allow school admins to manage subjects
CREATE POLICY "School admins can manage subjects"
  ON subjects FOR ALL
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
-- CLASS_SUBJECTS TABLE
-- =============================
DROP POLICY IF EXISTS "Users can view class subjects from their school" ON class_subjects;
DROP POLICY IF EXISTS "Admins can manage class subjects in their school" ON class_subjects;

-- Allow all school members to view class subjects
CREATE POLICY "Users can view class subjects from their school"
  ON class_subjects FOR SELECT
  USING (
    class_id IN (
      SELECT id FROM classes 
      WHERE school_id IN (
        SELECT school_id FROM profiles 
        WHERE id = auth.uid() AND school_id IS NOT NULL
      )
    )
  );

-- Allow school admins to manage class subjects
CREATE POLICY "School admins can manage class subjects"
  ON class_subjects FOR ALL
  USING (
    class_id IN (
      SELECT id FROM classes 
      WHERE school_id IN (
        SELECT school_id FROM profiles 
        WHERE id = auth.uid() AND role = 'school_admin'
      )
    )
  )
  WITH CHECK (
    class_id IN (
      SELECT id FROM classes 
      WHERE school_id IN (
        SELECT school_id FROM profiles 
        WHERE id = auth.uid() AND role = 'school_admin'
      )
    )
  );
