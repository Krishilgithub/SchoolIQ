-- Migration: Academic Module Tables
-- Created: 2026-02-10
-- Description: Creates tables for classes, subjects, teachers, and class-subject assignments

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- CLASSES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS classes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL, -- e.g., "10A", "Grade 5 - Section B"
  grade_level INTEGER NOT NULL CHECK (grade_level >= 1 AND grade_level <= 12),
  section VARCHAR(10) NOT NULL, -- A, B, C, etc.
  academic_year VARCHAR(20) NOT NULL, -- e.g., "2024-2025"
  class_teacher_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  total_students INTEGER DEFAULT 0 CHECK (total_students >= 0),
  capacity INTEGER CHECK (capacity IS NULL OR capacity > 0),
  room_number VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure unique class per grade/section/year combination
  UNIQUE(school_id, grade_level, section, academic_year)
);

-- Indexes for classes
CREATE INDEX idx_classes_school_id ON classes(school_id);
CREATE INDEX idx_classes_academic_year ON classes(academic_year);
CREATE INDEX idx_classes_grade_level ON classes(grade_level);
CREATE INDEX idx_classes_class_teacher_id ON classes(class_teacher_id);

-- =============================================
-- SUBJECTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS subjects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL, -- e.g., "Mathematics", "Physics"
  code VARCHAR(50) NOT NULL, -- e.g., "MATH101", "PHY201"
  description TEXT,
  department VARCHAR(100), -- e.g., "Science", "Arts", "Commerce"
  credit_hours DECIMAL(3,1), -- e.g., 3.0, 4.5
  is_core BOOLEAN DEFAULT true, -- Core subject vs elective
  grade_levels INTEGER[] NOT NULL DEFAULT '{}', -- Array of grades [9, 10, 11, 12]
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure unique code per school
  UNIQUE(school_id, code)
);

-- Indexes for subjects
CREATE INDEX idx_subjects_school_id ON subjects(school_id);
CREATE INDEX idx_subjects_department ON subjects(department);
CREATE INDEX idx_subjects_is_core ON subjects(is_core);
CREATE INDEX idx_subjects_grade_levels ON subjects USING GIN(grade_levels); -- GIN index for array search

-- =============================================
-- TEACHERS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS teachers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  employee_id VARCHAR(50) NOT NULL,
  subjects TEXT[] DEFAULT '{}', -- Array of subject IDs they can teach
  qualifications TEXT[] DEFAULT '{}', -- Array of qualifications
  joining_date DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'on_leave', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure unique teacher per school
  UNIQUE(school_id, user_id),
  UNIQUE(school_id, employee_id)
);

-- Indexes for teachers
CREATE INDEX idx_teachers_school_id ON teachers(school_id);
CREATE INDEX idx_teachers_user_id ON teachers(user_id);
CREATE INDEX idx_teachers_status ON teachers(status);
CREATE INDEX idx_teachers_subjects ON teachers USING GIN(subjects);

-- =============================================
-- CLASS_SUBJECTS TABLE (Junction Table)
-- =============================================
CREATE TABLE IF NOT EXISTS class_subjects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  teacher_id UUID REFERENCES teachers(user_id) ON DELETE SET NULL,
  periods_per_week INTEGER DEFAULT 5 CHECK (periods_per_week > 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure unique class-subject combination
  UNIQUE(class_id, subject_id)
);

-- Indexes for class_subjects
CREATE INDEX idx_class_subjects_class_id ON class_subjects(class_id);
CREATE INDEX idx_class_subjects_subject_id ON class_subjects(subject_id);
CREATE INDEX idx_class_subjects_teacher_id ON class_subjects(teacher_id);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on all tables
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_subjects ENABLE ROW LEVEL SECURITY;

-- Classes: Users can only see classes from their school
CREATE POLICY "Users can view classes from their school"
  ON classes FOR SELECT
  USING (
    school_id IN (
      SELECT school_id FROM school_admins WHERE user_id = auth.uid()
      UNION
      SELECT school_id FROM teachers WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage classes in their school"
  ON classes FOR ALL
  USING (
    school_id IN (
      SELECT school_id FROM school_admins WHERE user_id = auth.uid()
    )
  );

-- Subjects: Users can only see subjects from their school
CREATE POLICY "Users can view subjects from their school"
  ON subjects FOR SELECT
  USING (
    school_id IN (
      SELECT school_id FROM school_admins WHERE user_id = auth.uid()
      UNION
      SELECT school_id FROM teachers WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage subjects in their school"
  ON subjects FOR ALL
  USING (
    school_id IN (
      SELECT school_id FROM school_admins WHERE user_id = auth.uid()
    )
  );

-- Teachers: Users can only see teachers from their school
CREATE POLICY "Users can view teachers from their school"
  ON teachers FOR SELECT
  USING (
    school_id IN (
      SELECT school_id FROM school_admins WHERE user_id = auth.uid()
      UNION
      SELECT school_id FROM teachers WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage teachers in their school"
  ON teachers FOR ALL
  USING (
    school_id IN (
      SELECT school_id FROM school_admins WHERE user_id = auth.uid()
    )
  );

-- Class Subjects: Users can only see assignments from their school's classes
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
CREATE TRIGGER update_classes_updated_at
  BEFORE UPDATE ON classes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subjects_updated_at
  BEFORE UPDATE ON subjects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

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
