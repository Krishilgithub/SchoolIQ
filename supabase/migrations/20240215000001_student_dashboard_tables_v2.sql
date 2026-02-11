-- =====================================================
-- Student Dashboard Database Schema (v2 - No Conflicts)
-- =====================================================
-- This migration creates all tables needed for the student dashboard
-- with renamed tables to avoid conflicts with existing schema

-- =====================================================
-- 1. CLASS ENROLLMENTS
-- =====================================================
-- Table: class_enrollments (tracks which classes a student is enrolled in)
CREATE TABLE IF NOT EXISTS class_enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  class_id UUID REFERENCES classes(id) ON DELETE SET NULL,
  section_id UUID REFERENCES sections(id) ON DELETE SET NULL,
  enrollment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'dropped', 'completed')),
  grade TEXT,
  attendance_percentage DECIMAL(5,2) DEFAULT 0.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(student_id, class_id, section_id)
);

-- =====================================================
-- 2. ASSIGNMENTS
-- =====================================================
-- Table: student_assignments (homework, projects, quizzes assigned to students)
CREATE TABLE IF NOT EXISTS student_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
  title TEXT NOT NULL,
  description TEXT,
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
  teacher_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  assignment_type TEXT NOT NULL CHECK (assignment_type IN ('homework', 'project', 'quiz', 'lab', 'essay')),
  due_date TIMESTAMPTZ NOT NULL,
  max_points INTEGER NOT NULL DEFAULT 100,
  attachments JSONB DEFAULT '[]'::jsonb,
  instructions TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('draft', 'active', 'closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- 3. ASSIGNMENT SUBMISSIONS
-- =====================================================
-- Table: assignment_submissions (student submissions for assignments)
CREATE TABLE IF NOT EXISTS assignment_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
  assignment_id UUID NOT NULL REFERENCES student_assignments(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  submission_text TEXT,
  attachments JSONB DEFAULT '[]'::jsonb,
  submitted_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'not_submitted' CHECK (status IN ('not_submitted', 'draft', 'submitted', 'late', 'graded')),
  score INTEGER,
  feedback TEXT,
  graded_at TIMESTAMPTZ,
  graded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  resubmission_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(assignment_id, student_id)
);

-- =====================================================
-- 4. STUDENT EXAMS
-- =====================================================
-- Table: student_exams (exam schedule for students)
CREATE TABLE IF NOT EXISTS student_exams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
  title TEXT NOT NULL,
  description TEXT,
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
  exam_date TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  total_marks INTEGER NOT NULL DEFAULT 100,
  exam_type TEXT NOT NULL CHECK (exam_type IN ('midterm', 'final', 'unit_test', 'quiz', 'practical')),
  syllabus TEXT[] DEFAULT ARRAY[]::TEXT[],
  instructions TEXT,
  venue TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- 5. STUDENT EXAM RESULTS
-- =====================================================
-- Table: student_exam_results (exam results for students)
CREATE TABLE IF NOT EXISTS student_exam_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
  exam_id UUID NOT NULL REFERENCES student_exams(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  marks_obtained DECIMAL(6,2) NOT NULL,
  total_marks INTEGER NOT NULL,
  percentage DECIMAL(5,2) GENERATED ALWAYS AS ((marks_obtained / total_marks) * 100) STORED,
  grade TEXT,
  rank INTEGER,
  remarks TEXT,
  is_absent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(exam_id, student_id)
);

-- =====================================================
-- 6. STUDENT ATTENDANCE
-- =====================================================
-- Table: student_attendance (daily attendance tracking)
CREATE TABLE IF NOT EXISTS student_attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  class_id UUID REFERENCES classes(id) ON DELETE SET NULL,
  date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late', 'excused')),
  remarks TEXT,
  marked_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(student_id, class_id, date)
);

-- =====================================================
-- 7. CLASS SCHEDULE
-- =====================================================
-- Table: class_schedule (weekly timetable for classes)
CREATE TABLE IF NOT EXISTS class_schedule (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
  teacher_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  venue TEXT,
  is_recurring BOOLEAN DEFAULT TRUE,
  effective_from DATE DEFAULT CURRENT_DATE,
  effective_until DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- 8. LEARNING RESOURCES
-- =====================================================
-- Table: learning_resources (study materials, documents, videos)
CREATE TABLE IF NOT EXISTS learning_resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
  title TEXT NOT NULL,
  description TEXT,
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
  resource_type TEXT NOT NULL CHECK (resource_type IN ('document', 'video', 'link', 'presentation', 'image')),
  file_url TEXT,
  file_size_bytes BIGINT,
  thumbnail_url TEXT,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  uploaded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  view_count INTEGER DEFAULT 0,
  download_count INTEGER DEFAULT 0,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- 9. STUDENT MESSAGES
-- =====================================================
-- Table: student_messages (messaging system for students)
CREATE TABLE IF NOT EXISTS student_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  parent_message_id UUID REFERENCES student_messages(id) ON DELETE CASCADE,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  attachments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- 10. RESOURCE BOOKMARKS
-- =====================================================
-- Table: resource_bookmarks (students can bookmark resources)
CREATE TABLE IF NOT EXISTS resource_bookmarks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  resource_id UUID NOT NULL REFERENCES learning_resources(id) ON DELETE CASCADE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(student_id, resource_id)
);

-- =====================================================
-- 11. STUDY SESSIONS
-- =====================================================
-- Table: study_sessions (track study time for students)
CREATE TABLE IF NOT EXISTS study_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
  resource_id UUID REFERENCES learning_resources(id) ON DELETE SET NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  duration_minutes INTEGER GENERATED ALWAYS AS (EXTRACT(EPOCH FROM (end_time - start_time)) / 60) STORED,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- 12. STUDENT PROGRESS
-- =====================================================
-- Table: student_progress (aggregate progress metrics)
CREATE TABLE IF NOT EXISTS student_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
  assignments_completed INTEGER DEFAULT 0,
  assignments_total INTEGER DEFAULT 0,
  average_score DECIMAL(5,2) DEFAULT 0.00,
  attendance_percentage DECIMAL(5,2) DEFAULT 0.00,
  study_time_minutes INTEGER DEFAULT 0,
  last_calculated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(student_id, class_id, subject_id)
);

-- =====================================================
-- INDEXES
-- =====================================================
-- Class Enrollments Indexes
CREATE INDEX IF NOT EXISTS idx_class_enrollments_student ON class_enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_class_enrollments_class ON class_enrollments(class_id);
CREATE INDEX IF NOT EXISTS idx_class_enrollments_status ON class_enrollments(status);

-- Assignments Indexes
CREATE INDEX IF NOT EXISTS idx_student_assignments_class ON student_assignments(class_id);
CREATE INDEX IF NOT EXISTS idx_student_assignments_subject ON student_assignments(subject_id);
CREATE INDEX IF NOT EXISTS idx_student_assignments_teacher ON student_assignments(teacher_id);
CREATE INDEX IF NOT EXISTS idx_student_assignments_due_date ON student_assignments(due_date);
CREATE INDEX IF NOT EXISTS idx_student_assignments_status ON student_assignments(status);

-- Assignment Submissions Indexes
CREATE INDEX IF NOT EXISTS idx_assignment_submissions_assignment ON assignment_submissions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_assignment_submissions_student ON assignment_submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_assignment_submissions_status ON assignment_submissions(status);

-- Student Exams Indexes
CREATE INDEX IF NOT EXISTS idx_student_exams_class ON student_exams(class_id);
CREATE INDEX IF NOT EXISTS idx_student_exams_subject ON student_exams(subject_id);
CREATE INDEX IF NOT EXISTS idx_student_exams_date ON student_exams(exam_date);
CREATE INDEX IF NOT EXISTS idx_student_exams_status ON student_exams(status);

-- Student Exam Results Indexes
CREATE INDEX IF NOT EXISTS idx_student_exam_results_exam ON student_exam_results(exam_id);
CREATE INDEX IF NOT EXISTS idx_student_exam_results_student ON student_exam_results(student_id);

-- Student Attendance Indexes
CREATE INDEX IF NOT EXISTS idx_student_attendance_student ON student_attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_student_attendance_class ON student_attendance(class_id);
CREATE INDEX IF NOT EXISTS idx_student_attendance_date ON student_attendance(date);

-- Class Schedule Indexes
CREATE INDEX IF NOT EXISTS idx_class_schedule_class ON class_schedule(class_id);
CREATE INDEX IF NOT EXISTS idx_class_schedule_subject ON class_schedule(subject_id);
CREATE INDEX IF NOT EXISTS idx_class_schedule_teacher ON class_schedule(teacher_id);
CREATE INDEX IF NOT EXISTS idx_class_schedule_day ON class_schedule(day_of_week);

-- Learning Resources Indexes
CREATE INDEX IF NOT EXISTS idx_learning_resources_class ON learning_resources(class_id);
CREATE INDEX IF NOT EXISTS idx_learning_resources_subject ON learning_resources(subject_id);
CREATE INDEX IF NOT EXISTS idx_learning_resources_type ON learning_resources(resource_type);
CREATE INDEX IF NOT EXISTS idx_learning_resources_uploaded_by ON learning_resources(uploaded_by);

-- Student Messages Indexes
CREATE INDEX IF NOT EXISTS idx_student_messages_sender ON student_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_student_messages_recipient ON student_messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_student_messages_parent ON student_messages(parent_message_id);
CREATE INDEX IF NOT EXISTS idx_student_messages_created ON student_messages(created_at DESC);

-- Resource Bookmarks Indexes
CREATE INDEX IF NOT EXISTS idx_resource_bookmarks_student ON resource_bookmarks(student_id);
CREATE INDEX IF NOT EXISTS idx_resource_bookmarks_resource ON resource_bookmarks(resource_id);

-- Study Sessions Indexes
CREATE INDEX IF NOT EXISTS idx_study_sessions_student ON study_sessions(student_id);
CREATE INDEX IF NOT EXISTS idx_study_sessions_subject ON study_sessions(subject_id);
CREATE INDEX IF NOT EXISTS idx_study_sessions_start ON study_sessions(start_time);

-- Student Progress Indexes
CREATE INDEX IF NOT EXISTS idx_student_progress_student ON student_progress(student_id);
CREATE INDEX IF NOT EXISTS idx_student_progress_class ON student_progress(class_id);
CREATE INDEX IF NOT EXISTS idx_student_progress_subject ON student_progress(subject_id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================
-- Enable RLS on all tables
ALTER TABLE class_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_exam_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_progress ENABLE ROW LEVEL SECURITY;

-- Class Enrollments Policies
CREATE POLICY "Students can view their own enrollments"
  ON class_enrollments FOR SELECT
  USING (auth.uid() IN (SELECT user_id FROM students WHERE id = student_id));

-- Assignment Submissions Policies
CREATE POLICY "Students can view their own submissions"
  ON assignment_submissions FOR SELECT
  USING (auth.uid() IN (SELECT user_id FROM students WHERE id = student_id));

CREATE POLICY "Students can create their own submissions"
  ON assignment_submissions FOR INSERT
  WITH CHECK (auth.uid() IN (SELECT user_id FROM students WHERE id = student_id));

CREATE POLICY "Students can update their own submissions"
  ON assignment_submissions FOR UPDATE
  USING (auth.uid() IN (SELECT user_id FROM students WHERE id = student_id));

-- Student Exam Results Policies
CREATE POLICY "Students can view their own exam results"
  ON student_exam_results FOR SELECT
  USING (auth.uid() IN (SELECT user_id FROM students WHERE id = student_id));

-- Student Attendance Policies
CREATE POLICY "Students can view their own attendance"
  ON student_attendance FOR SELECT
  USING (auth.uid() IN (SELECT user_id FROM students WHERE id = student_id));

-- Student Messages Policies
CREATE POLICY "Users can view messages they sent or received"
  ON student_messages FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can send messages"
  ON student_messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update messages they received"
  ON student_messages FOR UPDATE
  USING (auth.uid() = recipient_id);

-- Resource Bookmarks Policies
CREATE POLICY "Students can manage their own bookmarks"
  ON resource_bookmarks FOR ALL
  USING (auth.uid() IN (SELECT user_id FROM students WHERE id = student_id));

-- Study Sessions Policies
CREATE POLICY "Students can manage their own study sessions"
  ON study_sessions FOR ALL
  USING (auth.uid() IN (SELECT user_id FROM students WHERE id = student_id));

-- Student Progress Policies
CREATE POLICY "Students can view their own progress"
  ON student_progress FOR SELECT
  USING (auth.uid() IN (SELECT user_id FROM students WHERE id = student_id));

-- Student Assignments Policies (read-only for students)
CREATE POLICY "Students can view assignments for their enrolled classes"
  ON student_assignments FOR SELECT
  USING (
    class_id IN (
      SELECT class_id FROM class_enrollments 
      WHERE student_id IN (SELECT id FROM students WHERE user_id = auth.uid())
    )
  );

-- Student Exams Policies (read-only for students)
CREATE POLICY "Students can view exams for their enrolled classes"
  ON student_exams FOR SELECT
  USING (
    class_id IN (
      SELECT class_id FROM class_enrollments 
      WHERE student_id IN (SELECT id FROM students WHERE user_id = auth.uid())
    )
  );

-- Class Schedule Policies (read-only for students)
CREATE POLICY "Students can view schedule for their enrolled classes"
  ON class_schedule FOR SELECT
  USING (
    class_id IN (
      SELECT class_id FROM class_enrollments 
      WHERE student_id IN (SELECT id FROM students WHERE user_id = auth.uid())
    )
  );

-- Learning Resources Policies
CREATE POLICY "Students can view resources for their enrolled classes"
  ON learning_resources FOR SELECT
  USING (
    is_public = true OR 
    class_id IN (
      SELECT class_id FROM class_enrollments 
      WHERE student_id IN (SELECT id FROM students WHERE user_id = auth.uid())
    )
  );

-- =====================================================
-- TRIGGERS
-- =====================================================
-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_class_enrollments_updated_at BEFORE UPDATE ON class_enrollments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_student_assignments_updated_at BEFORE UPDATE ON student_assignments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assignment_submissions_updated_at BEFORE UPDATE ON assignment_submissions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_student_exams_updated_at BEFORE UPDATE ON student_exams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_student_exam_results_updated_at BEFORE UPDATE ON student_exam_results
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_student_attendance_updated_at BEFORE UPDATE ON student_attendance
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_class_schedule_updated_at BEFORE UPDATE ON class_schedule
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_learning_resources_updated_at BEFORE UPDATE ON learning_resources
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_student_messages_updated_at BEFORE UPDATE ON student_messages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_student_progress_updated_at BEFORE UPDATE ON student_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- UTILITY FUNCTIONS
-- =====================================================
-- Function to calculate student progress
CREATE OR REPLACE FUNCTION calculate_student_progress(p_student_id UUID, p_class_id UUID)
RETURNS void AS $$
BEGIN
  INSERT INTO student_progress (
    student_id,
    class_id,
    assignments_completed,
    assignments_total,
    average_score,
    attendance_percentage,
    study_time_minutes,
    last_calculated_at
  )
  SELECT
    p_student_id,
    p_class_id,
    COUNT(CASE WHEN asub.status = 'graded' THEN 1 END) as assignments_completed,
    COUNT(asgn.id) as assignments_total,
    COALESCE(AVG(asub.score), 0) as average_score,
    COALESCE(
      (SELECT 
        (COUNT(CASE WHEN status = 'present' THEN 1 END)::decimal / NULLIF(COUNT(*), 0)) * 100
      FROM student_attendance
      WHERE student_id = p_student_id AND class_id = p_class_id),
      0
    ) as attendance_percentage,
    COALESCE(
      (SELECT SUM(duration_minutes)
      FROM study_sessions
      WHERE student_id = p_student_id),
      0
    ) as study_time_minutes,
    NOW()
  FROM student_assignments asgn
  LEFT JOIN assignment_submissions asub ON asgn.id = asub.assignment_id AND asub.student_id = p_student_id
  WHERE asgn.class_id = p_class_id
  ON CONFLICT (student_id, class_id, subject_id)
  DO UPDATE SET
    assignments_completed = EXCLUDED.assignments_completed,
    assignments_total = EXCLUDED.assignments_total,
    average_score = EXCLUDED.average_score,
    attendance_percentage = EXCLUDED.attendance_percentage,
    study_time_minutes = EXCLUDED.study_time_minutes,
    last_calculated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- COMPLETE
-- =====================================================
-- Migration complete. All 12 tables created with indexes, RLS, triggers, and functions.
