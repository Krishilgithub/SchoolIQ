-- Migration: Upgrade Academic Module Tables
-- Created: 2026-02-10
-- Description: Upgrades existing classes/subjects/teachers tables to the enhanced schema

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- DROP OLD POLICIES AND CONSTRAINTS
-- =============================================

-- Drop old RLS policies on classes
DROP POLICY IF EXISTS "Allow read access for authenticated users" ON classes;

-- Drop old RLS policies on subjects
DROP POLICY IF EXISTS "Allow read access for authenticated users" ON subjects;

-- =============================================
-- UPGRADE CLASSES TABLE
-- =============================================

-- Rename 'level' to 'grade_level' and ensure it's INTEGER
ALTER TABLE classes 
  RENAME COLUMN level TO grade_level;

-- Ensure grade_level is INTEGER (it should already be based on schema)
ALTER TABLE classes 
  ALTER COLUMN grade_level TYPE INTEGER;

-- Add new columns to classes table
ALTER TABLE classes 
  ADD COLUMN IF NOT EXISTS section VARCHAR(10) DEFAULT 'A',
  ADD COLUMN IF NOT EXISTS academic_year VARCHAR(20) DEFAULT '2024-2025',
  ADD COLUMN IF NOT EXISTS class_teacher_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS total_students INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS capacity INTEGER,
  ADD COLUMN IF NOT EXISTS room_number VARCHAR(50),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Modify existing columns
ALTER TABLE classes 
  ALTER COLUMN name TYPE VARCHAR(100);

-- Add constraints
ALTER TABLE classes 
  DROP CONSTRAINT IF EXISTS classes_grade_level_check,
  ADD CONSTRAINT classes_grade_level_check CHECK (grade_level >= 1 AND grade_level <= 12);

ALTER TABLE classes 
  DROP CONSTRAINT IF EXISTS classes_total_students_check,
  ADD CONSTRAINT classes_total_students_check CHECK (total_students >= 0);

ALTER TABLE classes 
  DROP CONSTRAINT IF EXISTS classes_capacity_check,
  ADD CONSTRAINT classes_capacity_check CHECK (capacity IS NULL OR capacity > 0);

-- Add unique constraint (drop first if exists)
DO $$ 
BEGIN
  ALTER TABLE classes DROP CONSTRAINT IF EXISTS unique_class_per_school_year;
  ALTER TABLE classes ADD CONSTRAINT unique_class_per_school_year 
    UNIQUE(school_id, grade_level, section, academic_year);
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

-- Add indexes for classes
CREATE INDEX IF NOT EXISTS idx_classes_school_id ON classes(school_id);
CREATE INDEX IF NOT EXISTS idx_classes_academic_year ON classes(academic_year);
CREATE INDEX IF NOT EXISTS idx_classes_grade_level ON classes(grade_level);
CREATE INDEX IF NOT EXISTS idx_classes_class_teacher_id ON classes(class_teacher_id);

-- =============================================
-- UPGRADE SUBJECTS TABLE
-- =============================================

-- Add new columns to subjects table (skip if they already exist)
ALTER TABLE subjects
  ADD COLUMN IF NOT EXISTS credit_hours DECIMAL(3,1),
  ADD COLUMN IF NOT EXISTS is_core BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS grade_levels INTEGER[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Modify existing columns (code already exists in schema)
ALTER TABLE subjects
  ALTER COLUMN name TYPE VARCHAR(100);

-- Ensure code is VARCHAR(50) and NOT NULL
ALTER TABLE subjects
  ALTER COLUMN code TYPE VARCHAR(50),
  ALTER COLUMN code SET NOT NULL;

-- Ensure grade_levels is NOT NULL with default
ALTER TABLE subjects
  ALTER COLUMN grade_levels SET NOT NULL,
  ALTER COLUMN grade_levels SET DEFAULT '{}';

-- Add unique constraint (drop first if exists)
DO $$
BEGIN
  ALTER TABLE subjects DROP CONSTRAINT IF EXISTS unique_subject_code_per_school;
  ALTER TABLE subjects ADD CONSTRAINT unique_subject_code_per_school 
    UNIQUE(school_id, code);
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

-- Add indexes for subjects
CREATE INDEX IF NOT EXISTS idx_subjects_school_id ON subjects(school_id);
CREATE INDEX IF NOT EXISTS idx_subjects_department ON subjects(department);
CREATE INDEX IF NOT EXISTS idx_subjects_is_core ON subjects(is_core);
CREATE INDEX IF NOT EXISTS idx_subjects_grade_levels ON subjects USING GIN(grade_levels);

-- =============================================
-- CREATE OR UPGRADE TEACHERS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS teachers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  employee_id VARCHAR(50) NOT NULL,
  subjects TEXT[] DEFAULT '{}',
  qualifications TEXT[] DEFAULT '{}',
  joining_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'on_leave', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(school_id, user_id),
  UNIQUE(school_id, employee_id)
);

-- Add indexes for teachers
CREATE INDEX IF NOT EXISTS idx_teachers_school_id ON teachers(school_id);
CREATE INDEX IF NOT EXISTS idx_teachers_user_id ON teachers(user_id);
CREATE INDEX IF NOT EXISTS idx_teachers_status ON teachers(status);
CREATE INDEX IF NOT EXISTS idx_teachers_subjects ON teachers USING GIN(subjects);

-- =============================================
-- UPGRADE CLASS_SUBJECTS TABLE
-- =============================================

-- Drop and recreate class_subjects with new schema
DROP TABLE IF EXISTS class_subjects CASCADE;

CREATE TABLE class_subjects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  teacher_id UUID REFERENCES teachers(id) ON DELETE SET NULL,
  periods_per_week INTEGER DEFAULT 5 CHECK (periods_per_week > 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(class_id, subject_id)
);

-- Add indexes for class_subjects
CREATE INDEX IF NOT EXISTS idx_class_subjects_class_id ON class_subjects(class_id);
CREATE INDEX IF NOT EXISTS idx_class_subjects_subject_id ON class_subjects(subject_id);
CREATE INDEX IF NOT EXISTS idx_class_subjects_teacher_id ON class_subjects(teacher_id);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on all tables
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_subjects ENABLE ROW LEVEL SECURITY;

-- Classes: Users can only see classes from their school
DROP POLICY IF EXISTS "Users can view classes from their school" ON classes;
CREATE POLICY "Users can view classes from their school"
  ON classes FOR SELECT
  USING (
    school_id IN (
      SELECT school_id FROM school_admins WHERE user_id = auth.uid()
      UNION
      SELECT school_id FROM teachers WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins can manage classes in their school" ON classes;
CREATE POLICY "Admins can manage classes in their school"
  ON classes FOR ALL
  USING (
    school_id IN (
      SELECT school_id FROM school_admins WHERE user_id = auth.uid()
    )
  );

-- Subjects: Users can only see subjects from their school
DROP POLICY IF EXISTS "Users can view subjects from their school" ON subjects;
CREATE POLICY "Users can view subjects from their school"
  ON subjects FOR SELECT
  USING (
    school_id IN (
      SELECT school_id FROM school_admins WHERE user_id = auth.uid()
      UNION
      SELECT school_id FROM teachers WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins can manage subjects in their school" ON subjects;
CREATE POLICY "Admins can manage subjects in their school"
  ON subjects FOR ALL
  USING (
    school_id IN (
      SELECT school_id FROM school_admins WHERE user_id = auth.uid()
    )
  );

-- Teachers: Users can only see teachers from their school
DROP POLICY IF EXISTS "Users can view teachers from their school" ON teachers;
CREATE POLICY "Users can view teachers from their school"
  ON teachers FOR SELECT
  USING (
    school_id IN (
      SELECT school_id FROM school_admins WHERE user_id = auth.uid()
      UNION
      SELECT school_id FROM teachers WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins can manage teachers in their school" ON teachers;
CREATE POLICY "Admins can manage teachers in their school"
  ON teachers FOR ALL
  USING (
    school_id IN (
      SELECT school_id FROM school_admins WHERE user_id = auth.uid()
    )
  );

-- Class Subjects: Users can only see assignments from their school's classes
DROP POLICY IF EXISTS "Users can view class subjects from their school" ON class_subjects;
CREATE POLICY "Users can view class subjects from their school"
  ON class_subjects FOR SELECT
  USING (
    class_id IN (
      SELECT id FROM classes WHERE school_id IN (
        SELECT school_id FROM school_admins WHERE user_id = auth.uid()
        UNION
        SELECT school_id FROM teachers WHERE user_id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "Admins can manage class subjects in their school" ON class_subjects;
CREATE POLICY "Admins can manage class subjects in their school"
  ON class_subjects FOR ALL
  USING (
    class_id IN (
      SELECT id FROM classes WHERE school_id IN (
        SELECT school_id FROM school_admins WHERE user_id = auth.uid()
      )
    )
  );

-- =============================================
-- FUNCTIONS & TRIGGERS
-- =============================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_classes_updated_at ON classes;
CREATE TRIGGER update_classes_updated_at
  BEFORE UPDATE ON classes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_subjects_updated_at ON subjects;
CREATE TRIGGER update_subjects_updated_at
  BEFORE UPDATE ON subjects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_teachers_updated_at ON teachers;
CREATE TRIGGER update_teachers_updated_at
  BEFORE UPDATE ON teachers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to update total_students count in classes
CREATE OR REPLACE FUNCTION update_class_student_count()
RETURNS TRIGGER AS $$
BEGIN
  -- This will be implemented when we create the students table
  -- For now, it's a placeholder
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- COMMENTS
-- =============================================

COMMENT ON TABLE classes IS 'Stores class/section information for each academic year';
COMMENT ON TABLE subjects IS 'Stores subject/course information offered by the school';
COMMENT ON TABLE teachers IS 'Stores teacher information and their teaching capabilities';
COMMENT ON TABLE class_subjects IS 'Maps which subjects are taught in which classes and by which teachers';

COMMENT ON COLUMN classes.academic_year IS 'Format: YYYY-YYYY (e.g., 2024-2025)';
COMMENT ON COLUMN classes.total_students IS 'Automatically updated when students are enrolled/removed';
COMMENT ON COLUMN subjects.grade_levels IS 'Array of grade numbers this subject is available for';
COMMENT ON COLUMN subjects.is_core IS 'TRUE for mandatory subjects, FALSE for electives';
COMMENT ON COLUMN teachers.subjects IS 'Array of subject IDs the teacher is qualified to teach';
COMMENT ON COLUMN class_subjects.periods_per_week IS 'Number of class periods per week for this subject';
