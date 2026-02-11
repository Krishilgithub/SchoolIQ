-- Student Dashboard Tables Migration
-- This migration creates all necessary tables for the complete student dashboard functionality

-- ============================================================================
-- 1. CLASS ENROLLMENTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS class_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  enrollment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'dropped', 'completed')),
  academic_year TEXT NOT NULL,
  semester TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, class_id, academic_year, semester)
);

-- ============================================================================
-- 2. ASSIGNMENTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  assignment_type TEXT DEFAULT 'homework' CHECK (assignment_type IN ('homework', 'project', 'quiz', 'lab', 'essay')),
  total_points INTEGER DEFAULT 100,
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  assigned_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  instructions TEXT,
  attachments JSONB DEFAULT '[]'::jsonb,
  rubric JSONB,
  allow_late_submission BOOLEAN DEFAULT FALSE,
  late_penalty_percent INTEGER DEFAULT 10,
  status TEXT DEFAULT 'active' CHECK (status IN ('draft', 'active', 'closed', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 3. ASSIGNMENT SUBMISSIONS
-- ============================================================================
CREATE TABLE IF NOT EXISTS assignment_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  submission_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'pending' CHECK (status IN ('draft', 'submitted', 'late', 'graded', 'returned')),
  content TEXT,
  attachments JSONB DEFAULT '[]'::jsonb,
  score INTEGER,
  feedback TEXT,
  graded_by UUID REFERENCES profiles(id),
  graded_at TIMESTAMP WITH TIME ZONE,
  resubmission_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(assignment_id, student_id)
);

-- ============================================================================
-- 4. EXAMS
-- ============================================================================
CREATE TABLE IF NOT EXISTS exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES profiles(id),
  title TEXT NOT NULL,
  description TEXT,
  exam_type TEXT DEFAULT 'written' CHECK (exam_type IN ('written', 'practical', 'oral', 'online', 'midterm', 'final')),
  exam_date TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER NOT NULL,
  total_marks INTEGER NOT NULL,
  passing_marks INTEGER NOT NULL,
  syllabus TEXT[],
  instructions TEXT,
  room_number TEXT,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 5. EXAM RESULTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS exam_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  marks_obtained INTEGER NOT NULL,
  grade TEXT,
  rank INTEGER,
  percentage DECIMAL(5,2),
  remarks TEXT,
  evaluated_by UUID REFERENCES profiles(id),
  evaluated_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(exam_id, student_id)
);

-- ============================================================================
-- 6. STUDENT ATTENDANCE
-- ============================================================================
CREATE TABLE IF NOT EXISTS student_attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status TEXT DEFAULT 'present' CHECK (status IN ('present', 'absent', 'late', 'excused', 'sick')),
  marked_by UUID NOT NULL REFERENCES profiles(id),
  remarks TEXT,
  marked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, class_id, date)
);

-- ============================================================================
-- 7. CLASS SCHEDULE
-- ============================================================================
CREATE TABLE IF NOT EXISTS class_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  teacher_id UUID REFERENCES profiles(id),
  subject TEXT NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  room_number TEXT,
  academic_year TEXT NOT NULL,
  semester TEXT NOT NULL,
  effective_from DATE,
  effective_until DATE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 8. LEARNING RESOURCES
-- ============================================================================
CREATE TABLE IF NOT EXISTS learning_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES profiles(id),
  title TEXT NOT NULL,
  description TEXT,
  resource_type TEXT DEFAULT 'document' CHECK (resource_type IN ('document', 'video', 'link', 'slides', 'notes', 'ebook')),
  file_url TEXT,
  external_url TEXT,
  file_size_bytes BIGINT,
  mime_type TEXT,
  tags TEXT[],
  is_public BOOLEAN DEFAULT FALSE,
  download_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 9. STUDENT MESSAGES
-- ============================================================================
CREATE TABLE IF NOT EXISTS student_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  message_type TEXT DEFAULT 'personal' CHECK (message_type IN ('personal', 'announcement', 'alert', 'assignment', 'exam')),
  parent_message_id UUID REFERENCES student_messages(id),
  attachments JSONB DEFAULT '[]'::jsonb,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 10. RESOURCE BOOKMARKS
-- ============================================================================
CREATE TABLE IF NOT EXISTS resource_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  resource_id UUID NOT NULL REFERENCES learning_resources(id) ON DELETE CASCADE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, resource_id)
);

-- ============================================================================
-- 11. STUDY SESSIONS (Track student study time)
-- ============================================================================
CREATE TABLE IF NOT EXISTS study_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  class_id UUID REFERENCES classes(id) ON DELETE SET NULL,
  subject TEXT NOT NULL,
  session_date DATE NOT NULL,
  duration_minutes INTEGER NOT NULL,
  topics_covered TEXT[],
  notes TEXT,
  mood TEXT CHECK (mood IN ('excellent', 'good', 'okay', 'struggling', 'frustrated')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 12. STUDENT PROGRESS TRACKER
-- ============================================================================
CREATE TABLE IF NOT EXISTS student_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES profiles (id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  academic_year TEXT NOT NULL,
  semester TEXT NOT NULL,
  total_assignments INTEGER DEFAULT 0,
  completed_assignments INTEGER DEFAULT 0,
  average_score DECIMAL(5,2),
  attendance_percentage DECIMAL(5,2),
  current_grade TEXT,
  rank_in_class INTEGER,
  strengths TEXT[],
  improvements_needed TEXT[],
  teacher_notes TEXT,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, class_id, academic_year, semester)
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Class Enrollments
CREATE INDEX idx_class_enrollments_student ON class_enrollments(student_id);
CREATE INDEX idx_class_enrollments_class ON class_enrollments(class_id);
CREATE INDEX idx_class_enrollments_status ON class_enrollments(status);

-- Assignments
CREATE INDEX idx_assignments_class ON assignments(class_id);
CREATE INDEX idx_assignments_teacher ON assignments(teacher_id);
CREATE INDEX idx_assignments_due_date ON assignments(due_date);
CREATE INDEX idx_assignments_status ON assignments(status);

-- Assignment Submissions
CREATE INDEX idx_submissions_assignment ON assignment_submissions(assignment_id);
CREATE INDEX idx_submissions_student ON assignment_submissions(student_id);
CREATE INDEX idx_submissions_status ON assignment_submissions(status);

-- Exams
CREATE INDEX idx_exams_class ON exams(class_id);
CREATE INDEX idx_exams_date ON exams(exam_date);
CREATE INDEX idx_exams_status ON exams(status);

-- Exam Results
CREATE INDEX idx_exam_results_exam ON exam_results(exam_id);
CREATE INDEX idx_exam_results_student ON exam_results(student_id);

-- Attendance
CREATE INDEX idx_attendance_student ON student_attendance(student_id);
CREATE INDEX idx_attendance_class ON student_attendance(class_id);
CREATE INDEX idx_attendance_date ON student_attendance(date);

-- Schedule
CREATE INDEX idx_schedule_class ON class_schedule(class_id);
CREATE INDEX idx_schedule_day ON class_schedule(day_of_week);
CREATE INDEX idx_schedule_active ON class_schedule(is_active);

-- Resources
CREATE INDEX idx_resources_class ON learning_resources(class_id);
CREATE INDEX idx_resources_type ON learning_resources(resource_type);
CREATE INDEX idx_resources_teacher ON learning_resources(teacher_id);

-- Messages
CREATE INDEX idx_messages_sender ON student_messages(sender_id);
CREATE INDEX idx_messages_recipient ON student_messages(recipient_id);
CREATE INDEX idx_messages_read ON student_messages(is_read);
CREATE INDEX idx_messages_created ON student_messages(created_at DESC);

-- Bookmarks
CREATE INDEX idx_bookmarks_student ON resource_bookmarks(student_id);
CREATE INDEX idx_bookmarks_resource ON resource_bookmarks(resource_id);

-- Study Sessions
CREATE INDEX idx_study_sessions_student ON study_sessions(student_id);
CREATE INDEX idx_study_sessions_date ON study_sessions(session_date);

-- Progress
CREATE INDEX idx_progress_student ON student_progress(student_id);
CREATE INDEX idx_progress_class ON student_progress(class_id);

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE class_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_results ENABLE ROW LEVEL SECURITY;
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
  USING (auth.uid() = student_id);

CREATE POLICY "Teachers can view enrollments for their classes"
  ON class_enrollments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM classes
      WHERE classes.id = class_enrollments.class_id
      AND classes.teacher_id = auth.uid()
    )
  );

-- Assignments Policies
CREATE POLICY "Students can view assignments for their enrolled classes"
  ON assignments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM class_enrollments
      WHERE class_enrollments.class_id = assignments.class_id
      AND class_enrollments.student_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can manage their assignments"
  ON assignments FOR ALL
  USING (teacher_id = auth.uid());

-- Assignment Submissions Policies
CREATE POLICY "Students can manage their own submissions"
  ON assignment_submissions FOR ALL
  USING (student_id = auth.uid());

CREATE POLICY "Teachers can view submissions for their assignments"
  ON assignment_submissions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM assignments
      WHERE assignments.id = assignment_submissions.assignment_id
      AND assignments.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can grade submissions"
  ON assignment_submissions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM assignments
      WHERE assignments.id = assignment_submissions.assignment_id
      AND assignments.teacher_id = auth.uid()
    )
  );

-- Attendance Policies
CREATE POLICY "Students can view their own attendance"
  ON student_attendance FOR SELECT
  USING (student_id = auth.uid());

CREATE POLICY "Teachers can manage attendance"
  ON student_attendance FOR ALL
  USING (marked_by = auth.uid());

-- Messages Policies
CREATE POLICY "Users can view their sent messages"
  ON student_messages FOR SELECT
  USING (sender_id = auth.uid());

CREATE POLICY "Users can view their received messages"
  ON student_messages FOR SELECT
  USING (recipient_id = auth.uid());

CREATE POLICY "Users can send messages"
  ON student_messages FOR INSERT
  WITH CHECK (sender_id = auth.uid());

-- Bookmarks Policies
CREATE POLICY "Students can manage their bookmarks"
  ON resource_bookmarks FOR ALL
  USING (student_id = auth.uid());

-- Study Sessions Policies
CREATE POLICY "Students can manage their study sessions"
  ON study_sessions FOR ALL
  USING (student_id = auth.uid());

-- Progress Policies
CREATE POLICY "Students can view their own progress"
  ON student_progress FOR SELECT
  USING (student_id = auth.uid());

CREATE POLICY "Teachers can view progress for their classes"
  ON student_progress FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM classes
      WHERE classes.id = student_progress.class_id
      AND classes.teacher_id = auth.uid()
    )
  );

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables
CREATE TRIGGER update_class_enrollments_updated_at
  BEFORE UPDATE ON class_enrollments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assignments_updated_at
  BEFORE UPDATE ON assignments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assignment_submissions_updated_at
  BEFORE UPDATE ON assignment_submissions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_exams_updated_at
  BEFORE UPDATE ON exams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_exam_results_updated_at
  BEFORE UPDATE ON exam_results
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_class_schedule_updated_at
  BEFORE UPDATE ON class_schedule
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_learning_resources_updated_at
  BEFORE UPDATE ON learning_resources
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_student_messages_updated_at
  BEFORE UPDATE ON student_messages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate student progress automatically
CREATE OR REPLACE FUNCTION calculate_student_progress()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO student_progress (
    student_id,
    class_id,
    academic_year,
    semester,
    total_assignments,
    completed_assignments,
    average_score,
    attendance_percentage
  )
  SELECT
    NEW.student_id,
    NEW.class_id,
    '2023-2024', -- TODO: Make dynamic
    'Fall 2023', -- TODO: Make dynamic
    COUNT(DISTINCT a.id),
    COUNT(DISTINCT CASE WHEN asub.status = 'graded' THEN asub.id END),
    AVG(CASE WHEN asub.score IS NOT NULL THEN (asub.score::DECIMAL / a.total_points::DECIMAL * 100) END),
    (SELECT 
      COUNT(CASE WHEN sa.status = 'present' THEN 1 END)::DECIMAL / NULLIF(COUNT(*)::DECIMAL, 0) * 100
     FROM student_attendance sa
     WHERE sa.student_id = NEW.student_id AND sa.class_id = NEW.class_id
    )
  FROM class_enrollments ce
  LEFT JOIN assignments a ON a.class_id = ce.class_id
  LEFT JOIN assignment_submissions asub ON asub.assignment_id = a.id AND asub.student_id = ce.student_id
  WHERE ce.student_id = NEW.student_id AND ce.class_id = NEW.class_id
  GROUP BY ce.student_id, ce.class_id
  ON CONFLICT (student_id, class_id, academic_year, semester)
  DO UPDATE SET
    total_assignments = EXCLUDED.total_assignments,
    completed_assignments = EXCLUDED.completed_assignments,
    average_score = EXCLUDED.average_score,
    attendance_percentage = EXCLUDED.attendance_percentage,
    last_updated = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update progress when submissions are graded
CREATE TRIGGER update_progress_on_submission
  AFTER INSERT OR UPDATE ON assignment_submissions
  FOR EACH ROW
  WHEN (NEW.status = 'graded')
  EXECUTE FUNCTION calculate_student_progress();

COMMENT ON TABLE class_enrollments IS 'Student enrollment records for classes';
COMMENT ON TABLE assignments IS 'Assignments created by teachers';
COMMENT ON TABLE assignment_submissions IS 'Student submissions for assignments';
COMMENT ON TABLE exams IS 'Exam schedule and details';
COMMENT ON TABLE exam_results IS 'Student exam results and grades';
COMMENT ON TABLE student_attendance IS 'Daily attendance records for students';
COMMENT ON TABLE class_schedule IS 'Class timetable and schedule';
COMMENT ON TABLE learning_resources IS 'Educational resources shared by teachers';
COMMENT ON TABLE student_messages IS 'Communication between students and teachers';
COMMENT ON TABLE resource_bookmarks IS 'Student bookmarks for learning resources';
COMMENT ON TABLE study_sessions IS 'Student study time tracking';
COMMENT ON TABLE student_progress IS 'Aggregated student progress metrics';
