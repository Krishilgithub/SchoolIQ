-- =====================================================
-- ASSIGNMENTS MODULE - LEARNING WORKFLOW ENGINE
-- =====================================================
-- 
-- Purpose: Assignment creation, submission, grading workflow
-- Features: Draft mode, scheduled publish, file attachments, grade history
-- Performance: Indexed queries, pagination-ready
--
-- Tables: assignments, assignment_attachments, submissions, submission_files, grades, grade_history
-- Views: assignment_overview, submission_overview
-- Triggers: Auto-versioning grades, submission lock, notifications
-- Functions: calculate_submission_stats, detect_late_submissions
-- =====================================================

-- =====================================================
-- SECTION 1: ASSIGNMENTS
-- Core assignment table with draft & publish workflow
-- =====================================================

CREATE TABLE IF NOT EXISTS assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  academic_year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
  
  -- Assignment scope
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  section_id UUID REFERENCES sections(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  
  -- Basic details
  title VARCHAR(255) NOT NULL,
  description TEXT,
  instructions TEXT,
  
  -- Dates & deadlines
  assigned_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date TIMESTAMPTZ NOT NULL,
  allow_late_submission BOOLEAN DEFAULT FALSE,
  late_submission_deadline TIMESTAMPTZ,
  
  -- Publishing workflow
  status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'published', 'closed', 'archived')),
  is_draft BOOLEAN GENERATED ALWAYS AS (status = 'draft') STORED,
  scheduled_publish_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  
  -- Grading configuration
  total_marks DECIMAL(10,2) NOT NULL DEFAULT 100,
  passing_marks DECIMAL(10,2),
  grading_rubric JSONB, -- Structured rubric with criteria
  
  -- Submission settings
  submission_type VARCHAR(50) DEFAULT 'file' CHECK (submission_type IN ('file', 'text', 'link', 'file_and_text')),
  max_file_size_mb INTEGER DEFAULT 10,
  allowed_file_types TEXT[], -- e.g., ['pdf', 'docx', 'jpg']
  max_files_per_submission INTEGER DEFAULT 5,
  
  -- Features
  enable_peer_review BOOLEAN DEFAULT FALSE,
  enable_plagiarism_check BOOLEAN DEFAULT FALSE,
  send_notification BOOLEAN DEFAULT TRUE,
  
  -- Statistics (cached)
  total_students INTEGER DEFAULT 0,
  submitted_count INTEGER DEFAULT 0,
  graded_count INTEGER DEFAULT 0,
  
  -- Metadata
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Soft delete
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES profiles(id) ON DELETE SET NULL
);

-- Indexes for performance
CREATE INDEX idx_assignments_school ON assignments(school_id) WHERE is_deleted = FALSE;
CREATE INDEX idx_assignments_class ON assignments(class_id, section_id) WHERE is_deleted = FALSE;
CREATE INDEX idx_assignments_subject ON assignments(subject_id) WHERE is_deleted = FALSE;
CREATE INDEX idx_assignments_teacher ON assignments(teacher_id) WHERE is_deleted = FALSE;
CREATE INDEX idx_assignments_status ON assignments(status) WHERE is_deleted = FALSE;
CREATE INDEX idx_assignments_due_date ON assignments(due_date) WHERE is_deleted = FALSE;
CREATE INDEX idx_assignments_draft ON assignments(is_draft) WHERE is_draft = TRUE;

-- Composite index for teacher's active assignments
CREATE INDEX idx_assignments_teacher_active ON assignments(teacher_id, status, due_date DESC) 
  WHERE is_deleted = FALSE AND status IN ('published', 'scheduled');

COMMENT ON TABLE assignments IS 'Assignments with draft mode, scheduled publish, and grading workflow';
COMMENT ON COLUMN assignments.status IS 'draft, scheduled, published, closed, archived';
COMMENT ON COLUMN assignments.grading_rubric IS 'JSONB structure: {criteria: [{name, points, description}]}';

-- =====================================================
-- SECTION 2: ASSIGNMENT ATTACHMENTS
-- Files attached by teacher to assignment
-- =====================================================

CREATE TABLE IF NOT EXISTS assignment_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  
  -- File details
  file_name VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  file_size_bytes BIGINT,
  file_type VARCHAR(50),
  mime_type VARCHAR(100),
  
  -- Metadata
  uploaded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Display order
  display_order INTEGER DEFAULT 0
);

-- Indexes
CREATE INDEX idx_assignment_attachments_assignment ON assignment_attachments(assignment_id);
CREATE INDEX idx_assignment_attachments_school ON assignment_attachments(school_id);

COMMENT ON TABLE assignment_attachments IS 'Files attached by teacher to assignment instructions';

-- =====================================================
-- SECTION 3: SUBMISSIONS
-- Student submissions with lock-after-deadline
-- =====================================================

CREATE TABLE IF NOT EXISTS submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  
  -- Submission details
  submission_text TEXT,
  submission_link TEXT,
  
  -- Status tracking
  status VARCHAR(20) NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'submitted', 'resubmitted', 'graded', 'returned')),
  
  -- Submission timing
  submitted_at TIMESTAMPTZ,
  is_late BOOLEAN DEFAULT FALSE,
  minutes_late INTEGER,
  
  -- Locking mechanism (prevent edits after submission unless allowed)
  is_locked BOOLEAN DEFAULT FALSE,
  locked_at TIMESTAMPTZ,
  
  -- Resubmission handling
  resubmission_count INTEGER DEFAULT 0,
  allow_resubmission BOOLEAN DEFAULT FALSE,
  resubmitted_at TIMESTAMPTZ,
  
  -- Grading (denormalized for performance)
  score DECIMAL(10,2),
  grade VARCHAR(10),
  graded_at TIMESTAMPTZ,
  graded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  
  -- Feedback
  feedback TEXT,
  feedback_attachments JSONB, -- URLs to feedback files
  
  -- Plagiarism (future feature)
  plagiarism_score DECIMAL(5,2),
  plagiarism_report_url TEXT,
  
  -- Peer review (future feature)
  peer_review_enabled BOOLEAN DEFAULT FALSE,
  peer_reviewers UUID[], -- Array of student IDs
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Unique constraint: one submission per student per assignment
  CONSTRAINT unique_submission_per_student UNIQUE(assignment_id, student_id)
);

-- Indexes for performance
CREATE INDEX idx_submissions_school ON submissions(school_id);
CREATE INDEX idx_submissions_assignment ON submissions(assignment_id);
CREATE INDEX idx_submissions_student ON submissions(student_id);
CREATE INDEX idx_submissions_status ON submissions(status);
CREATE INDEX idx_submissions_graded ON submissions(graded_at) WHERE status = 'graded';
CREATE INDEX idx_submissions_late ON submissions(is_late) WHERE is_late = TRUE;

-- Composite index for teacher grading workflow
CREATE INDEX idx_submissions_assignment_status ON submissions(assignment_id, status);

COMMENT ON TABLE submissions IS 'Student submissions with lock-after-deadline and grade tracking';
COMMENT ON COLUMN submissions.is_locked IS 'Locked submissions cannot be edited (after due date)';
COMMENT ON COLUMN submissions.resubmission_count IS 'Track number of resubmissions';

-- =====================================================
-- SECTION 4: SUBMISSION FILES
-- Files uploaded by students
-- =====================================================

CREATE TABLE IF NOT EXISTS submission_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  
  -- File details
  file_name VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  file_size_bytes BIGINT,
  file_type VARCHAR(50),
  mime_type VARCHAR(100),
  
  -- Versioning (for resubmissions)
  version INTEGER DEFAULT 1,
  is_current BOOLEAN DEFAULT TRUE,
  
  -- Metadata
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  uploaded_by UUID REFERENCES profiles(id) ON DELETE SET NULL
);

-- Indexes
CREATE INDEX idx_submission_files_submission ON submission_files(submission_id);
CREATE INDEX idx_submission_files_school ON submission_files(school_id);
CREATE INDEX idx_submission_files_current ON submission_files(submission_id, is_current) WHERE is_current = TRUE;

COMMENT ON TABLE submission_files IS 'Files uploaded by students for submissions';
COMMENT ON COLUMN submission_files.version IS 'Increments on resubmission';

-- =====================================================
-- SECTION 5: GRADES
-- Grading records with auto-save support
-- =====================================================

CREATE TABLE IF NOT EXISTS grades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  
  -- Grade details
  score DECIMAL(10,2) NOT NULL,
  total_marks DECIMAL(10,2) NOT NULL,
  percentage DECIMAL(5,2) GENERATED ALWAYS AS (ROUND((score / total_marks * 100), 2)) STORED,
  grade_letter VARCHAR(10), -- A+, A, B+, etc.
  
  -- Rubric-based grading
  rubric_scores JSONB, -- {criterion_id: score} mapping
  
  -- Grading metadata
  graded_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  graded_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Comments & feedback
  comments TEXT,
  strengths TEXT,
  areas_for_improvement TEXT,
  
  -- Status
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'revised')),
  published_at TIMESTAMPTZ,
  
  -- Auto-save tracking
  last_saved_at TIMESTAMPTZ DEFAULT NOW(),
  is_auto_saved BOOLEAN DEFAULT FALSE,
  
  -- Version control
  version INTEGER DEFAULT 1,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Unique constraint (can be updated, but only one current grade per submission)
  CONSTRAINT unique_grade_per_submission UNIQUE(submission_id)
);

-- Indexes
CREATE INDEX idx_grades_school ON grades(school_id);
CREATE INDEX idx_grades_assignment ON grades(assignment_id);
CREATE INDEX idx_grades_student ON grades(student_id);
CREATE INDEX idx_grades_graded_by ON grades(graded_by);
CREATE INDEX idx_grades_status ON grades(status);

COMMENT ON TABLE grades IS 'Grading records with auto-save and version control';
COMMENT ON COLUMN grades.rubric_scores IS 'JSONB: {criterion_id: score} for rubric-based grading';
COMMENT ON COLUMN grades.is_auto_saved IS 'TRUE if saved automatically (draft state)';

-- =====================================================
-- SECTION 6: GRADE HISTORY
-- Versioning and audit trail for grade changes
-- =====================================================

CREATE TABLE IF NOT EXISTS grade_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  grade_id UUID NOT NULL REFERENCES grades(id) ON DELETE CASCADE,
  submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  
  -- Historical data (snapshots)
  previous_score DECIMAL(10,2),
  new_score DECIMAL(10,2),
  previous_grade_letter VARCHAR(10),
  new_grade_letter VARCHAR(10),
  previous_comments TEXT,
  new_comments TEXT,
  
  -- Change metadata
  change_type VARCHAR(50), -- created, updated, published, revised
  changed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  changed_at TIMESTAMPTZ DEFAULT NOW(),
  change_reason TEXT,
  
  -- Full snapshot (for complete audit)
  grade_snapshot JSONB,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_grade_history_grade ON grade_history(grade_id);
CREATE INDEX idx_grade_history_submission ON grade_history(submission_id);
CREATE INDEX idx_grade_history_school ON grade_history(school_id);
CREATE INDEX idx_grade_history_changed_at ON grade_history(changed_at DESC);

COMMENT ON TABLE grade_history IS 'Complete audit trail of all grade changes';
COMMENT ON COLUMN grade_history.grade_snapshot IS 'Full JSONB snapshot of grade at time of change';

-- =====================================================
-- SECTION 7: VIEWS FOR COMMON QUERIES
-- =====================================================

-- View: Assignment Overview (with submission statistics)
CREATE OR REPLACE VIEW assignment_overview AS
SELECT 
  a.id,
  a.school_id,
  a.title,
  a.description,
  a.status,
  a.due_date,
  a.total_marks,
  
  -- Class/Subject info
  c.name as class_name,
  sec.name as section_name,
  sub.name as subject_name,
  
  -- Teacher info
  t.first_name || ' ' || t.last_name as teacher_name,
  
  -- Submission statistics
  a.total_students,
  a.submitted_count,
  a.graded_count,
  
  -- Calculated metrics
  CASE 
    WHEN a.total_students > 0 
    THEN ROUND((a.submitted_count::DECIMAL / a.total_students * 100), 2)
    ELSE 0 
  END as submission_percentage,
  
  CASE 
    WHEN a.submitted_count > 0 
    THEN ROUND((a.graded_count::DECIMAL / a.submitted_count * 100), 2)
    ELSE 0 
  END as grading_progress_percentage,
  
  -- Status flags
  CASE WHEN a.due_date < NOW() THEN TRUE ELSE FALSE END as is_overdue,
  CASE WHEN a.due_date::DATE = CURRENT_DATE THEN TRUE ELSE FALSE END as is_due_today,
  
  -- Timestamps
  a.published_at,
  a.created_at,
  a.updated_at
  
FROM assignments a
JOIN classes c ON a.class_id = c.id
LEFT JOIN sections sec ON a.section_id = sec.id
JOIN subjects sub ON a.subject_id = sub.id
JOIN teachers t ON a.teacher_id = t.id
WHERE a.is_deleted = FALSE;

COMMENT ON VIEW assignment_overview IS 'Quick lookup for assignments with statistics';

-- View: Submission Overview (for grading workflow)
CREATE OR REPLACE VIEW submission_overview AS
SELECT 
  s.id,
  s.assignment_id,
  s.student_id,
  s.status,
  s.submitted_at,
  s.is_late,
  s.score,
  s.grade,
  
  -- Student info
  st.admission_number,
  st.first_name || ' ' || st.last_name as student_name,
  st.email as student_email,
  
  -- Assignment info
  a.title as assignment_title,
  a.total_marks,
  a.due_date,
  
  -- File count
  (SELECT COUNT(*) FROM submission_files sf 
   WHERE sf.submission_id = s.id AND sf.is_current = TRUE
  ) as file_count,
  
  -- Grading info
  s.graded_by,
  s.graded_at,
  
  -- Timestamps
  s.created_at,
  s.updated_at
  
FROM submissions s
JOIN students st ON s.student_id = st.id
JOIN assignments a ON s.assignment_id = a.id
WHERE st.is_deleted = FALSE AND a.is_deleted = FALSE;

COMMENT ON VIEW submission_overview IS 'Quick lookup for submissions with student/assignment details';

-- =====================================================
-- SECTION 8: TRIGGERS FOR AUTO-UPDATES
-- =====================================================

-- Function: Update assignment statistics when submission changes
CREATE OR REPLACE FUNCTION update_assignment_submission_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Recalculate counts for the assignment
  UPDATE assignments
  SET 
    submitted_count = (
      SELECT COUNT(*) 
      FROM submissions 
      WHERE assignment_id = COALESCE(NEW.assignment_id, OLD.assignment_id)
      AND status IN ('submitted', 'resubmitted', 'graded', 'returned')
    ),
    graded_count = (
      SELECT COUNT(*) 
      FROM submissions 
      WHERE assignment_id = COALESCE(NEW.assignment_id, OLD.assignment_id)
      AND status = 'graded'
    ),
    updated_at = NOW()
  WHERE id = COALESCE(NEW.assignment_id, OLD.assignment_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger: Auto-update assignment stats
DROP TRIGGER IF EXISTS trigger_update_assignment_stats ON submissions;
CREATE TRIGGER trigger_update_assignment_stats
  AFTER INSERT OR UPDATE OR DELETE ON submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_assignment_submission_stats();

-- Function: Auto-lock submission after due date
CREATE OR REPLACE FUNCTION auto_lock_submission_on_submit()
RETURNS TRIGGER AS $$
DECLARE
  assignment_due_date TIMESTAMPTZ;
  allow_late BOOLEAN;
BEGIN
  -- Get assignment due date and late submission setting
  SELECT due_date, allow_late_submission 
  INTO assignment_due_date, allow_late
  FROM assignments 
  WHERE id = NEW.assignment_id;
  
  -- If submitted after due date and late not allowed, lock it
  IF NEW.status IN ('submitted', 'resubmitted') THEN
    IF NOW() > assignment_due_date THEN
      NEW.is_late := TRUE;
      NEW.minutes_late := EXTRACT(EPOCH FROM (NOW() - assignment_due_date)) / 60;
      
      IF NOT allow_late THEN
        NEW.is_locked := TRUE;
        NEW.locked_at := NOW();
      END IF;
    END IF;
    
    -- Set submitted_at if not already set
    IF NEW.submitted_at IS NULL THEN
      NEW.submitted_at := NOW();
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Auto-lock on submit
DROP TRIGGER IF EXISTS trigger_auto_lock_submission ON submissions;
CREATE TRIGGER trigger_auto_lock_submission
  BEFORE INSERT OR UPDATE ON submissions
  FOR EACH ROW
  WHEN (NEW.status IN ('submitted', 'resubmitted'))
  EXECUTE FUNCTION auto_lock_submission_on_submit();

-- Function: Prevent editing locked submissions
CREATE OR REPLACE FUNCTION prevent_locked_submission_edit()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.is_locked AND NOT OLD.allow_resubmission THEN
    RAISE EXCEPTION 'Cannot modify locked submission. Resubmission not allowed.';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Prevent locked submission edits
DROP TRIGGER IF EXISTS trigger_prevent_locked_submission_edit ON submissions;
CREATE TRIGGER trigger_prevent_locked_submission_edit
  BEFORE UPDATE ON submissions
  FOR EACH ROW
  WHEN (OLD.is_locked = TRUE)
  EXECUTE FUNCTION prevent_locked_submission_edit();

-- Function: Track grade changes in history
CREATE OR REPLACE FUNCTION track_grade_changes()
RETURNS TRIGGER AS $$
DECLARE
  change_type_val VARCHAR(50);
BEGIN
  IF TG_OP = 'INSERT' THEN
    change_type_val := 'created';
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.status = 'draft' AND NEW.status = 'published' THEN
      change_type_val := 'published';
    ELSIF OLD.score != NEW.score OR OLD.comments != NEW.comments THEN
      change_type_val := 'updated';
    ELSE
      RETURN NEW; -- No significant change
    END IF;
  END IF;
  
  -- Insert into history
  INSERT INTO grade_history (
    school_id, grade_id, submission_id,
    previous_score, new_score,
    previous_grade_letter, new_grade_letter,
    previous_comments, new_comments,
    change_type, changed_by, changed_at,
    grade_snapshot
  ) VALUES (
    NEW.school_id, NEW.id, NEW.submission_id,
    OLD.score, NEW.score,
    OLD.grade_letter, NEW.grade_letter,
    OLD.comments, NEW.comments,
    change_type_val, NEW.graded_by, NOW(),
    to_jsonb(NEW)
  );
  
  -- Increment version
  IF TG_OP = 'UPDATE' THEN
    NEW.version := OLD.version + 1;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Track grade changes
DROP TRIGGER IF EXISTS trigger_track_grade_changes ON grades;
CREATE TRIGGER trigger_track_grade_changes
  AFTER INSERT OR UPDATE ON grades
  FOR EACH ROW
  EXECUTE FUNCTION track_grade_changes();

-- Function: Sync grade to submission
CREATE OR REPLACE FUNCTION sync_grade_to_submission()
RETURNS TRIGGER AS $$
BEGIN
  -- Update submission with grade info
  UPDATE submissions
  SET 
    score = NEW.score,
    grade = NEW.grade_letter,
    graded_at = NEW.graded_at,
    graded_by = NEW.graded_by,
    status = CASE 
      WHEN NEW.status = 'published' THEN 'graded'
      ELSE status 
    END,
    updated_at = NOW()
  WHERE id = NEW.submission_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Sync grade to submission
DROP TRIGGER IF EXISTS trigger_sync_grade_to_submission ON grades;
CREATE TRIGGER trigger_sync_grade_to_submission
  AFTER INSERT OR UPDATE ON grades
  FOR EACH ROW
  EXECUTE FUNCTION sync_grade_to_submission();

-- Standard update timestamp triggers
DROP TRIGGER IF EXISTS trigger_assignments_updated_at ON assignments;
CREATE TRIGGER trigger_assignments_updated_at
  BEFORE UPDATE ON assignments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_submissions_updated_at ON submissions;
CREATE TRIGGER trigger_submissions_updated_at
  BEFORE UPDATE ON submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_grades_updated_at ON grades;
CREATE TRIGGER trigger_grades_updated_at
  BEFORE UPDATE ON grades
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- =====================================================
-- SECTION 9: HELPER FUNCTIONS
-- =====================================================

-- Function: Calculate submission statistics for assignment
CREATE OR REPLACE FUNCTION calculate_submission_stats(p_assignment_id UUID)
RETURNS TABLE(
  total_students INTEGER,
  submitted_count INTEGER,
  graded_count INTEGER,
  pending_count INTEGER,
  late_count INTEGER,
  avg_score DECIMAL(5,2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::INTEGER as total_students,
    COUNT(*) FILTER (WHERE s.status IN ('submitted', 'resubmitted', 'graded', 'returned'))::INTEGER as submitted_count,
    COUNT(*) FILTER (WHERE s.status = 'graded')::INTEGER as graded_count,
    COUNT(*) FILTER (WHERE s.status IN ('not_started', 'in_progress'))::INTEGER as pending_count,
    COUNT(*) FILTER (WHERE s.is_late = TRUE)::INTEGER as late_count,
    ROUND(AVG(s.score), 2) as avg_score
  FROM submissions s
  WHERE s.assignment_id = p_assignment_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION calculate_submission_stats IS 'Calculate submission statistics for an assignment';

-- Function: Detect late submissions
CREATE OR REPLACE FUNCTION detect_late_submissions(p_assignment_id UUID)
RETURNS TABLE(
  student_id UUID,
  student_name TEXT,
  submitted_at TIMESTAMPTZ,
  minutes_late INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.student_id,
    st.first_name || ' ' || st.last_name,
    s.submitted_at,
    s.minutes_late
  FROM submissions s
  JOIN students st ON s.student_id = st.id
  WHERE s.assignment_id = p_assignment_id
  AND s.is_late = TRUE
  ORDER BY s.minutes_late DESC;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION detect_late_submissions IS 'Get list of late submissions for an assignment';

-- Function: Auto-publish scheduled assignments
CREATE OR REPLACE FUNCTION auto_publish_scheduled_assignments()
RETURNS INTEGER AS $$
DECLARE
  published_count INTEGER;
BEGIN
  WITH updated AS (
    UPDATE assignments
    SET 
      status = 'published',
      published_at = NOW(),
      updated_at = NOW()
    WHERE status = 'scheduled'
    AND scheduled_publish_at <= NOW()
    RETURNING id
  )
  SELECT COUNT(*) INTO published_count FROM updated;
  
  RETURN published_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION auto_publish_scheduled_assignments IS 'Auto-publish assignments at scheduled time (run by cron)';

-- =====================================================
-- SECTION 10: RLS POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE submission_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE grade_history ENABLE ROW LEVEL SECURITY;

-- Policy: School isolation for assignments
CREATE POLICY assignments_school_isolation ON assignments
  FOR ALL
  USING (school_id = current_setting('app.current_school_id', TRUE)::UUID);

-- Policy: School isolation for assignment_attachments
CREATE POLICY assignment_attachments_school_isolation ON assignment_attachments
  FOR ALL
  USING (school_id = current_setting('app.current_school_id', TRUE)::UUID);

-- Policy: School isolation for submissions
CREATE POLICY submissions_school_isolation ON submissions
  FOR ALL
  USING (school_id = current_setting('app.current_school_id', TRUE)::UUID);

-- Policy: Students can only view their own submissions
CREATE POLICY submissions_student_self_access ON submissions
  FOR SELECT
  USING (
    school_id = current_setting('app.current_school_id', TRUE)::UUID
    AND student_id = current_setting('app.current_user_id', TRUE)::UUID
  );

-- Policy: School isolation for submission_files
CREATE POLICY submission_files_school_isolation ON submission_files
  FOR ALL
  USING (school_id = current_setting('app.current_school_id', TRUE)::UUID);

-- Policy: School isolation for grades
CREATE POLICY grades_school_isolation ON grades
  FOR ALL
  USING (school_id = current_setting('app.current_school_id', TRUE)::UUID);

-- Policy: School isolation for grade_history
CREATE POLICY grade_history_school_isolation ON grade_history
  FOR ALL
  USING (school_id = current_setting('app.current_school_id', TRUE)::UUID);

-- =====================================================
-- END OF ASSIGNMENTS MODULE
-- =====================================================
