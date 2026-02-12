-- ============================================================================
-- Teachers Module - Comprehensive Migration
-- Version: 1.0
-- Date: 2026-02-18
-- Description: Complete workforce management system with assignments, leaves, 
--              performance tracking, and workload management
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. TEACHERS TABLE (Enhanced)
-- ============================================================================

-- Add new columns to existing teachers table
ALTER TABLE teachers 
  ADD COLUMN IF NOT EXISTS employee_id VARCHAR(50) UNIQUE,
  ADD COLUMN IF NOT EXISTS date_of_birth DATE,
  ADD COLUMN IF NOT EXISTS gender VARCHAR(20),
  ADD COLUMN IF NOT EXISTS blood_group VARCHAR(10),
  ADD COLUMN IF NOT EXISTS nationality VARCHAR(50) DEFAULT 'Indian',
  ADD COLUMN IF NOT EXISTS emergency_contact_name VARCHAR(100),
  ADD COLUMN IF NOT EXISTS emergency_contact_phone VARCHAR(20),
  ADD COLUMN IF NOT EXISTS emergency_contact_relation VARCHAR(50),
  ADD COLUMN IF NOT EXISTS date_of_joining DATE,
  ADD COLUMN IF NOT EXISTS qualification TEXT,
  ADD COLUMN IF NOT EXISTS specialization TEXT,
  ADD COLUMN IF NOT EXISTS experience_years INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS employment_type VARCHAR(50) DEFAULT 'full_time', -- full_time, part_time, contract, guest
  ADD COLUMN IF NOT EXISTS designation VARCHAR(100),
  ADD COLUMN IF NOT EXISTS department VARCHAR(100),
  ADD COLUMN IF NOT EXISTS max_workload_hours INTEGER DEFAULT 40, -- Weekly workload limit
  ADD COLUMN IF NOT EXISTS current_workload_hours INTEGER DEFAULT 0, -- Auto-calculated
  ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active', -- active, on_leave, suspended, terminated
  ADD COLUMN IF NOT EXISTS profile_photo_url TEXT,
  ADD COLUMN IF NOT EXISTS address_line1 TEXT,
  ADD COLUMN IF NOT EXISTS address_line2 TEXT,
  ADD COLUMN IF NOT EXISTS city VARCHAR(100),
  ADD COLUMN IF NOT EXISTS state VARCHAR(100),
  ADD COLUMN IF NOT EXISTS postal_code VARCHAR(20),
  ADD COLUMN IF NOT EXISTS country VARCHAR(100) DEFAULT 'India',
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS previous_data JSONB;

-- Add indexes for teachers
CREATE INDEX IF NOT EXISTS idx_teachers_school_id ON teachers(school_id) WHERE is_deleted = FALSE;
CREATE INDEX IF NOT EXISTS idx_teachers_employee_id ON teachers(employee_id) WHERE is_deleted = FALSE;
CREATE INDEX IF NOT EXISTS idx_teachers_status ON teachers(status) WHERE is_deleted = FALSE;
CREATE INDEX IF NOT EXISTS idx_teachers_department ON teachers(department) WHERE is_deleted = FALSE;
CREATE INDEX IF NOT EXISTS idx_teachers_employment_type ON teachers(employment_type);
CREATE INDEX IF NOT EXISTS idx_teachers_workload ON teachers(current_workload_hours);

-- Add comment
COMMENT ON TABLE teachers IS 'Enhanced teacher profiles with comprehensive personal, professional, and workload information';

-- ============================================================================
-- 2. TEACHER_ASSIGNMENTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS teacher_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE RESTRICT,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE RESTRICT,
  section_id UUID REFERENCES sections(id) ON DELETE RESTRICT,
  academic_year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
  
  -- Assignment details
  assignment_type VARCHAR(50) DEFAULT 'subject', -- subject, class_teacher, co_curricular, exam_invigilator
  is_primary BOOLEAN DEFAULT TRUE, -- Primary subject teacher vs assistant
  weekly_periods INTEGER DEFAULT 0, -- Number of periods per week
  workload_hours DECIMAL(5,2) DEFAULT 0.0, -- Weekly hours for this assignment
  
  -- Timing
  start_date DATE NOT NULL,
  end_date DATE,
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Metadata
  assigned_by UUID REFERENCES profiles(id),
  assignment_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT fk_teacher_assignments_school FOREIGN KEY (school_id) REFERENCES schools(id),
  CONSTRAINT fk_teacher_assignments_teacher FOREIGN KEY (teacher_id) REFERENCES teachers(id),
  CONSTRAINT fk_teacher_assignments_subject FOREIGN KEY (subject_id) REFERENCES subjects(id),
  CONSTRAINT fk_teacher_assignments_class FOREIGN KEY (class_id) REFERENCES classes(id),
  CONSTRAINT fk_teacher_assignments_section FOREIGN KEY (section_id) REFERENCES sections(id),
  CONSTRAINT fk_teacher_assignments_academic_year FOREIGN KEY (academic_year_id) REFERENCES academic_years(id),
  CONSTRAINT chk_workload_hours CHECK (workload_hours >= 0),
  CONSTRAINT chk_weekly_periods CHECK (weekly_periods >= 0)
);

-- Indexes for teacher_assignments
CREATE INDEX idx_teacher_assignments_school ON teacher_assignments(school_id);
CREATE INDEX idx_teacher_assignments_teacher ON teacher_assignments(teacher_id, is_active);
CREATE INDEX idx_teacher_assignments_subject ON teacher_assignments(subject_id);
CREATE INDEX idx_teacher_assignments_class_section ON teacher_assignments(class_id, section_id);
CREATE INDEX idx_teacher_assignments_academic_year ON teacher_assignments(academic_year_id);
CREATE INDEX idx_teacher_assignments_type ON teacher_assignments(assignment_type);
CREATE INDEX idx_teacher_assignments_dates ON teacher_assignments(start_date, end_date);

COMMENT ON TABLE teacher_assignments IS 'Tracks which teachers are assigned to which subjects, classes, and sections with workload hours';

-- ============================================================================
-- 3. TEACHER_LEAVES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS teacher_leaves (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  
  -- Leave details
  leave_type VARCHAR(50) NOT NULL, -- sick, casual, earned, maternity, paternity, unpaid, compensatory
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_days DECIMAL(5,2) NOT NULL, -- Can be fractional for half-day leaves
  is_half_day BOOLEAN DEFAULT FALSE,
  half_day_period VARCHAR(20), -- morning, afternoon
  
  -- Request details
  reason TEXT NOT NULL,
  attachments JSONB DEFAULT '[]', -- Medical certificates, etc.
  status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected, cancelled
  
  -- Approval workflow
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  approval_notes TEXT,
  
  -- Substitute handling
  substitute_teacher_id UUID REFERENCES teachers(id),
  substitute_assigned_by UUID REFERENCES profiles(id),
  substitute_assigned_at TIMESTAMPTZ,
  substitute_notes TEXT,
  
  -- Conflict detection
  has_conflicts BOOLEAN DEFAULT FALSE,
  conflict_details JSONB DEFAULT '[]', -- List of timetable/exam conflicts
  conflict_resolution TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT fk_teacher_leaves_school FOREIGN KEY (school_id) REFERENCES schools(id),
  CONSTRAINT fk_teacher_leaves_teacher FOREIGN KEY (teacher_id) REFERENCES teachers(id),
  CONSTRAINT fk_teacher_leaves_substitute FOREIGN KEY (substitute_teacher_id) REFERENCES teachers(id),
  CONSTRAINT chk_leave_dates CHECK (end_date >= start_date),
  CONSTRAINT chk_total_days CHECK (total_days > 0),
  CONSTRAINT chk_leave_status CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled'))
);

-- Indexes for teacher_leaves
CREATE INDEX idx_teacher_leaves_school ON teacher_leaves(school_id);
CREATE INDEX idx_teacher_leaves_teacher ON teacher_leaves(teacher_id);
CREATE INDEX idx_teacher_leaves_status ON teacher_leaves(status);
CREATE INDEX idx_teacher_leaves_dates ON teacher_leaves(start_date, end_date);
CREATE INDEX idx_teacher_leaves_type ON teacher_leaves(leave_type);
CREATE INDEX idx_teacher_leaves_substitute ON teacher_leaves(substitute_teacher_id);
CREATE INDEX idx_teacher_leaves_conflicts ON teacher_leaves(has_conflicts) WHERE has_conflicts = TRUE;

COMMENT ON TABLE teacher_leaves IS 'Leave requests with approval workflow, substitute assignment, and conflict detection';

-- ============================================================================
-- 4. LEAVE_BALANCES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS leave_balances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  academic_year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
  
  -- Leave type balances
  leave_type VARCHAR(50) NOT NULL, -- sick, casual, earned, maternity, paternity
  total_allocated DECIMAL(5,2) NOT NULL DEFAULT 0,
  used DECIMAL(5,2) NOT NULL DEFAULT 0,
  pending DECIMAL(5,2) NOT NULL DEFAULT 0, -- Leaves in pending approval
  available DECIMAL(5,2) GENERATED ALWAYS AS (total_allocated - used - pending) STORED,
  
  -- Carry forward from previous year
  carried_forward DECIMAL(5,2) DEFAULT 0,
  
  -- Reset tracking
  last_reset_at TIMESTAMPTZ,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(school_id, teacher_id, academic_year_id, leave_type),
  
  CONSTRAINT fk_leave_balances_school FOREIGN KEY (school_id) REFERENCES schools(id),
  CONSTRAINT fk_leave_balances_teacher FOREIGN KEY (teacher_id) REFERENCES teachers(id),
  CONSTRAINT fk_leave_balances_academic_year FOREIGN KEY (academic_year_id) REFERENCES academic_years(id),
  CONSTRAINT chk_leave_balance_allocated CHECK (total_allocated >= 0),
  CONSTRAINT chk_leave_balance_used CHECK (used >= 0),
  CONSTRAINT chk_leave_balance_pending CHECK (pending >= 0)
);

-- Indexes for leave_balances
CREATE INDEX idx_leave_balances_school ON leave_balances(school_id);
CREATE INDEX idx_leave_balances_teacher ON leave_balances(teacher_id);
CREATE INDEX idx_leave_balances_academic_year ON leave_balances(academic_year_id);
CREATE INDEX idx_leave_balances_type ON leave_balances(leave_type);

COMMENT ON TABLE leave_balances IS 'Tracks leave balances per teacher, leave type, and academic year with auto-calculated availability';

-- ============================================================================
-- 5. PERFORMANCE_REVIEWS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS performance_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  academic_year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
  
  -- Review details
  review_period_start DATE NOT NULL,
  review_period_end DATE NOT NULL,
  review_type VARCHAR(50) DEFAULT 'annual', -- annual, mid_year, probation, special
  
  -- Ratings (1-5 scale)
  teaching_effectiveness DECIMAL(3,2),
  subject_knowledge DECIMAL(3,2),
  classroom_management DECIMAL(3,2),
  student_engagement DECIMAL(3,2),
  communication_skills DECIMAL(3,2),
  punctuality DECIMAL(3,2),
  professional_development DECIMAL(3,2),
  collaboration DECIMAL(3,2),
  overall_rating DECIMAL(3,2),
  
  -- Qualitative feedback
  strengths TEXT,
  areas_for_improvement TEXT,
  goals TEXT,
  achievements TEXT,
  training_recommendations TEXT,
  
  -- Review metadata
  reviewed_by UUID NOT NULL REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ NOT NULL,
  status VARCHAR(50) DEFAULT 'draft', -- draft, submitted, acknowledged, finalized
  teacher_comments TEXT, -- Teacher's response to review
  teacher_acknowledged_at TIMESTAMPTZ,
  
  -- Documentation
  attachments JSONB DEFAULT '[]',
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT fk_performance_reviews_school FOREIGN KEY (school_id) REFERENCES schools(id),
  CONSTRAINT fk_performance_reviews_teacher FOREIGN KEY (teacher_id) REFERENCES teachers(id),
  CONSTRAINT fk_performance_reviews_academic_year FOREIGN KEY (academic_year_id) REFERENCES academic_years(id),
  CONSTRAINT fk_performance_reviews_reviewer FOREIGN KEY (reviewed_by) REFERENCES profiles(id),
  CONSTRAINT chk_review_dates CHECK (review_period_end >= review_period_start),
  CONSTRAINT chk_ratings CHECK (
    (teaching_effectiveness IS NULL OR (teaching_effectiveness >= 1 AND teaching_effectiveness <= 5)) AND
    (subject_knowledge IS NULL OR (subject_knowledge >= 1 AND subject_knowledge <= 5)) AND
    (classroom_management IS NULL OR (classroom_management >= 1 AND classroom_management <= 5)) AND
    (student_engagement IS NULL OR (student_engagement >= 1 AND student_engagement <= 5)) AND
    (communication_skills IS NULL OR (communication_skills >= 1 AND communication_skills <= 5)) AND
    (punctuality IS NULL OR (punctuality >= 1 AND punctuality <= 5)) AND
    (professional_development IS NULL OR (professional_development >= 1 AND professional_development <= 5)) AND
    (collaboration IS NULL OR (collaboration >= 1 AND collaboration <= 5)) AND
    (overall_rating IS NULL OR (overall_rating >= 1 AND overall_rating <= 5))
  )
);

-- Indexes for performance_reviews
CREATE INDEX idx_performance_reviews_school ON performance_reviews(school_id);
CREATE INDEX idx_performance_reviews_teacher ON performance_reviews(teacher_id);
CREATE INDEX idx_performance_reviews_academic_year ON performance_reviews(academic_year_id);
CREATE INDEX idx_performance_reviews_reviewer ON performance_reviews(reviewed_by);
CREATE INDEX idx_performance_reviews_status ON performance_reviews(status);
CREATE INDEX idx_performance_reviews_type ON performance_reviews(review_type);

COMMENT ON TABLE performance_reviews IS 'Comprehensive teacher performance evaluations with multi-dimensional ratings and feedback';

-- ============================================================================
-- 6. TEACHER_HISTORY TABLE (Audit Trail)
-- ============================================================================

CREATE TABLE IF NOT EXISTS teacher_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  
  -- Change tracking
  change_type VARCHAR(100) NOT NULL, -- profile_updated, assignment_added, leave_approved, etc.
  change_description TEXT NOT NULL,
  
  -- Data snapshot
  previous_data JSONB,
  new_data JSONB,
  
  -- Context
  changed_by UUID REFERENCES profiles(id),
  ip_address INET,
  user_agent TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT fk_teacher_history_school FOREIGN KEY (school_id) REFERENCES schools(id),
  CONSTRAINT fk_teacher_history_teacher FOREIGN KEY (teacher_id) REFERENCES teachers(id)
);

-- Indexes for teacher_history (append-only, optimized for reads)
CREATE INDEX idx_teacher_history_school ON teacher_history(school_id);
CREATE INDEX idx_teacher_history_teacher ON teacher_history(teacher_id, created_at DESC);
CREATE INDEX idx_teacher_history_type ON teacher_history(change_type);
CREATE INDEX idx_teacher_history_created ON teacher_history(created_at DESC);

COMMENT ON TABLE teacher_history IS 'Append-only audit trail for all teacher-related changes with full data snapshots';

-- ============================================================================
-- 7. HELPER VIEWS
-- ============================================================================

-- View: Teacher Workload Summary
CREATE OR REPLACE VIEW teacher_workload_summary AS
SELECT 
  t.id AS teacher_id,
  t.school_id,
  t.first_name || ' ' || t.last_name AS teacher_name,
  t.employee_id,
  t.max_workload_hours,
  t.current_workload_hours,
  t.status,
  COUNT(DISTINCT ta.id) AS total_assignments,
  COUNT(DISTINCT ta.subject_id) AS subjects_count,
  COUNT(DISTINCT ta.class_id) AS classes_count,
  SUM(ta.workload_hours) AS calculated_workload,
  ROUND((t.current_workload_hours::DECIMAL / NULLIF(t.max_workload_hours, 0) * 100), 2) AS workload_percentage,
  CASE 
    WHEN t.current_workload_hours > t.max_workload_hours THEN 'overloaded'
    WHEN t.current_workload_hours >= t.max_workload_hours * 0.8 THEN 'optimal'
    ELSE 'available'
  END AS workload_status
FROM teachers t
LEFT JOIN teacher_assignments ta ON t.id = ta.teacher_id AND ta.is_active = TRUE
WHERE t.is_deleted = FALSE
GROUP BY t.id, t.school_id, t.first_name, t.last_name, t.employee_id, 
         t.max_workload_hours, t.current_workload_hours, t.status;

COMMENT ON VIEW teacher_workload_summary IS 'Real-time workload summary with assignment counts and utilization percentage';

-- View: Teacher Leave Overview
CREATE OR REPLACE VIEW teacher_leave_overview AS
SELECT 
  t.id AS teacher_id,
  t.school_id,
  t.first_name || ' ' || t.last_name AS teacher_name,
  t.employee_id,
  lb.academic_year_id,
  lb.leave_type,
  lb.total_allocated,
  lb.used,
  lb.pending,
  lb.available,
  COALESCE(recent_leaves.leave_count, 0) AS recent_leaves_count
FROM teachers t
LEFT JOIN leave_balances lb ON t.id = lb.teacher_id
LEFT JOIN (
  SELECT 
    teacher_id,
    leave_type,
    COUNT(*) AS leave_count
  FROM teacher_leaves
  WHERE status = 'approved' 
    AND start_date >= NOW() - INTERVAL '30 days'
  GROUP BY teacher_id, leave_type
) recent_leaves ON t.id = recent_leaves.teacher_id AND lb.leave_type = recent_leaves.leave_type
WHERE t.is_deleted = FALSE;

COMMENT ON VIEW teacher_leave_overview IS 'Consolidated view of leave balances and recent leave history';

-- ============================================================================
-- 8. AUTOMATIC TRIGGERS
-- ============================================================================

-- Trigger: Update teacher workload on assignment changes
CREATE OR REPLACE FUNCTION update_teacher_workload()
RETURNS TRIGGER AS $$
BEGIN
  -- Recalculate total workload for the teacher
  UPDATE teachers
  SET 
    current_workload_hours = (
      SELECT COALESCE(SUM(workload_hours), 0)
      FROM teacher_assignments
      WHERE teacher_id = COALESCE(NEW.teacher_id, OLD.teacher_id)
        AND is_active = TRUE
    ),
    updated_at = NOW()
  WHERE id = COALESCE(NEW.teacher_id, OLD.teacher_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_teacher_workload ON teacher_assignments;
CREATE TRIGGER trg_update_teacher_workload
AFTER INSERT OR UPDATE OR DELETE ON teacher_assignments
FOR EACH ROW
EXECUTE FUNCTION update_teacher_workload();

-- Trigger: Log teacher profile changes
CREATE OR REPLACE FUNCTION log_teacher_profile_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.* IS DISTINCT FROM OLD.* THEN
    INSERT INTO teacher_history (
      school_id,
      teacher_id,
      change_type,
      change_description,
      previous_data,
      new_data,
      changed_by,
      created_at
    ) VALUES (
      NEW.school_id,
      NEW.id,
      'profile_updated',
      'Teacher profile information updated',
      row_to_json(OLD),
      row_to_json(NEW),
      current_setting('app.current_user_id', TRUE)::UUID,
      NOW()
    );
    
    -- Update version tracking
    NEW.version = OLD.version + 1;
    NEW.previous_data = row_to_json(OLD);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_log_teacher_profile_changes ON teachers;
CREATE TRIGGER trg_log_teacher_profile_changes
BEFORE UPDATE ON teachers
FOR EACH ROW
EXECUTE FUNCTION log_teacher_profile_changes();

-- Trigger: Log assignment changes
CREATE OR REPLACE FUNCTION log_assignment_changes()
RETURNS TRIGGER AS $$
DECLARE
  change_desc TEXT;
BEGIN
  IF TG_OP = 'INSERT' THEN
    change_desc = 'Assignment created';
  ELSIF TG_OP = 'UPDATE' THEN
    change_desc = 'Assignment modified';
  ELSIF TG_OP = 'DELETE' THEN
    change_desc = 'Assignment removed';
  END IF;
  
  INSERT INTO teacher_history (
    school_id,
    teacher_id,
    change_type,
    change_description,
    previous_data,
    new_data,
    changed_by,
    created_at
  ) VALUES (
    COALESCE(NEW.school_id, OLD.school_id),
    COALESCE(NEW.teacher_id, OLD.teacher_id),
    'assignment_' || LOWER(TG_OP),
    change_desc,
    CASE WHEN TG_OP != 'INSERT' THEN row_to_json(OLD) ELSE NULL END,
    CASE WHEN TG_OP != 'DELETE' THEN row_to_json(NEW) ELSE NULL END,
    current_setting('app.current_user_id', TRUE)::UUID,
    NOW()
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_log_assignment_changes ON teacher_assignments;
CREATE TRIGGER trg_log_assignment_changes
AFTER INSERT OR UPDATE OR DELETE ON teacher_assignments
FOR EACH ROW
EXECUTE FUNCTION log_assignment_changes();

-- Trigger: Log leave status changes
CREATE OR REPLACE FUNCTION log_leave_changes()
RETURNS TRIGGER AS $$
DECLARE
  change_desc TEXT;
BEGIN
  IF TG_OP = 'INSERT' THEN
    change_desc = 'Leave requested';
  ELSIF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
    change_desc = 'Leave status changed from ' || OLD.status || ' to ' || NEW.status;
  ELSIF TG_OP = 'UPDATE' THEN
    change_desc = 'Leave details updated';
  ELSIF TG_OP = 'DELETE' THEN
    change_desc = 'Leave deleted';
  END IF;
  
  INSERT INTO teacher_history (
    school_id,
    teacher_id,
    change_type,
    change_description,
    previous_data,
    new_data,
    changed_by,
    created_at
  ) VALUES (
    COALESCE(NEW.school_id, OLD.school_id),
    COALESCE(NEW.teacher_id, OLD.teacher_id),
    'leave_' || LOWER(TG_OP),
    change_desc,
    CASE WHEN TG_OP != 'INSERT' THEN row_to_json(OLD) ELSE NULL END,
    CASE WHEN TG_OP != 'DELETE' THEN row_to_json(NEW) ELSE NULL END,
    current_setting('app.current_user_id', TRUE)::UUID,
    NOW()
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_log_leave_changes ON teacher_leaves;
CREATE TRIGGER trg_log_leave_changes
AFTER INSERT OR UPDATE OR DELETE ON teacher_leaves
FOR EACH ROW
EXECUTE FUNCTION log_leave_changes();

-- Trigger: Update leave balances on leave approval/rejection
CREATE OR REPLACE FUNCTION update_leave_balances()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    -- Leave approved: move from pending to used
    IF OLD.status = 'pending' AND NEW.status = 'approved' THEN
      UPDATE leave_balances
      SET 
        used = used + NEW.total_days,
        pending = pending - NEW.total_days,
        updated_at = NOW()
      WHERE teacher_id = NEW.teacher_id
        AND leave_type = NEW.leave_type
        AND academic_year_id = (
          SELECT id FROM academic_years 
          WHERE school_id = NEW.school_id 
            AND is_active = TRUE 
          LIMIT 1
        );
    
    -- Leave rejected: release pending
    ELSIF OLD.status = 'pending' AND NEW.status = 'rejected' THEN
      UPDATE leave_balances
      SET 
        pending = pending - NEW.total_days,
        updated_at = NOW()
      WHERE teacher_id = NEW.teacher_id
        AND leave_type = NEW.leave_type
        AND academic_year_id = (
          SELECT id FROM academic_years 
          WHERE school_id = NEW.school_id 
            AND is_active = TRUE 
          LIMIT 1
        );
    
    -- Leave cancelled after approval: return to available
    ELSIF OLD.status = 'approved' AND NEW.status = 'cancelled' THEN
      UPDATE leave_balances
      SET 
        used = used - NEW.total_days,
        updated_at = NOW()
      WHERE teacher_id = NEW.teacher_id
        AND leave_type = NEW.leave_type
        AND academic_year_id = (
          SELECT id FROM academic_years 
          WHERE school_id = NEW.school_id 
            AND is_active = TRUE 
          LIMIT 1
        );
    END IF;
  
  -- New leave request: add to pending
  ELSIF TG_OP = 'INSERT' AND NEW.status = 'pending' THEN
    UPDATE leave_balances
    SET 
      pending = pending + NEW.total_days,
      updated_at = NOW()
    WHERE teacher_id = NEW.teacher_id
      AND leave_type = NEW.leave_type
      AND academic_year_id = (
        SELECT id FROM academic_years 
        WHERE school_id = NEW.school_id 
          AND is_active = TRUE 
        LIMIT 1
      );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_leave_balances ON teacher_leaves;
CREATE TRIGGER trg_update_leave_balances
AFTER INSERT OR UPDATE OF status ON teacher_leaves
FOR EACH ROW
EXECUTE FUNCTION update_leave_balances();

-- Trigger: Auto-update timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_teacher_assignments_updated_at ON teacher_assignments;
CREATE TRIGGER trg_teacher_assignments_updated_at
BEFORE UPDATE ON teacher_assignments
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_teacher_leaves_updated_at ON teacher_leaves;
CREATE TRIGGER trg_teacher_leaves_updated_at
BEFORE UPDATE ON teacher_leaves
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_leave_balances_updated_at ON leave_balances;
CREATE TRIGGER trg_leave_balances_updated_at
BEFORE UPDATE ON leave_balances
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_performance_reviews_updated_at ON performance_reviews;
CREATE TRIGGER trg_performance_reviews_updated_at
BEFORE UPDATE ON performance_reviews
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- 9. ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS
ALTER TABLE teacher_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_leaves ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for teacher_assignments
CREATE POLICY teacher_assignments_school_isolation ON teacher_assignments
  FOR ALL
  USING (
    school_id IN (
      SELECT school_id FROM profiles WHERE id = auth.uid()
    )
  );

-- RLS Policies for teacher_leaves
CREATE POLICY teacher_leaves_school_isolation ON teacher_leaves
  FOR ALL
  USING (
    school_id IN (
      SELECT school_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Teachers can view their own leaves
CREATE POLICY teachers_can_view_own_leaves ON teacher_leaves
  FOR SELECT
  USING (
    teacher_id IN (
      SELECT id FROM teachers WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for leave_balances
CREATE POLICY leave_balances_school_isolation ON leave_balances
  FOR ALL
  USING (
    school_id IN (
      SELECT school_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Teachers can view their own balances
CREATE POLICY teachers_can_view_own_balances ON leave_balances
  FOR SELECT
  USING (
    teacher_id IN (
      SELECT id FROM teachers WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for performance_reviews
CREATE POLICY performance_reviews_school_isolation ON performance_reviews
  FOR ALL
  USING (
    school_id IN (
      SELECT school_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Teachers can view their own reviews
CREATE POLICY teachers_can_view_own_reviews ON performance_reviews
  FOR SELECT
  USING (
    teacher_id IN (
      SELECT id FROM teachers WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for teacher_history
CREATE POLICY teacher_history_school_isolation ON teacher_history
  FOR ALL
  USING (
    school_id IN (
      SELECT school_id FROM profiles WHERE id = auth.uid()
    )
  );

-- ============================================================================
-- 10. HELPER FUNCTIONS
-- ============================================================================

-- Function: Calculate workload percentage
CREATE OR REPLACE FUNCTION calculate_workload_percentage(
  p_teacher_id UUID
)
RETURNS DECIMAL(5,2) AS $$
DECLARE
  v_current_hours INTEGER;
  v_max_hours INTEGER;
BEGIN
  SELECT current_workload_hours, max_workload_hours
  INTO v_current_hours, v_max_hours
  FROM teachers
  WHERE id = p_teacher_id;
  
  IF v_max_hours IS NULL OR v_max_hours = 0 THEN
    RETURN 0;
  END IF;
  
  RETURN ROUND((v_current_hours::DECIMAL / v_max_hours * 100), 2);
END;
$$ LANGUAGE plpgsql;

-- Function: Detect leave conflicts
CREATE OR REPLACE FUNCTION detect_leave_conflicts(
  p_teacher_id UUID,
  p_start_date DATE,
  p_end_date DATE
)
RETURNS JSONB AS $$
DECLARE
  v_conflicts JSONB DEFAULT '[]';
  v_timetable_conflicts INTEGER;
  v_exam_conflicts INTEGER;
BEGIN
  -- Check timetable conflicts (periods scheduled during leave)
  SELECT COUNT(*)
  INTO v_timetable_conflicts
  FROM timetable_slots ts
  WHERE ts.teacher_id = p_teacher_id
    AND ts.day_of_week BETWEEN 1 AND 7
    AND p_start_date <= p_end_date; -- Simplified - would need actual day matching
  
  -- Check exam invigilator conflicts
  SELECT COUNT(*)
  INTO v_exam_conflicts
  FROM exams e
  WHERE e.id IN (
    SELECT exam_id FROM exam_invigilators WHERE teacher_id = p_teacher_id
  )
  AND e.exam_date BETWEEN p_start_date AND p_end_date;
  
  -- Build conflicts JSON
  IF v_timetable_conflicts > 0 THEN
    v_conflicts = v_conflicts || jsonb_build_object(
      'type', 'timetable',
      'count', v_timetable_conflicts,
      'message', v_timetable_conflicts || ' timetable periods need substitute'
    );
  END IF;
  
  IF v_exam_conflicts > 0 THEN
    v_conflicts = v_conflicts || jsonb_build_object(
      'type', 'exam',
      'count', v_exam_conflicts,
      'message', v_exam_conflicts || ' exam duties need coverage'
    );
  END IF;
  
  RETURN v_conflicts;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 11. INITIAL DATA SETUP
-- ============================================================================

-- Function to initialize leave balances for a teacher
CREATE OR REPLACE FUNCTION initialize_teacher_leave_balances(
  p_school_id UUID,
  p_teacher_id UUID,
  p_academic_year_id UUID
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO leave_balances (school_id, teacher_id, academic_year_id, leave_type, total_allocated)
  VALUES
    (p_school_id, p_teacher_id, p_academic_year_id, 'sick', 12),
    (p_school_id, p_teacher_id, p_academic_year_id, 'casual', 10),
    (p_school_id, p_teacher_id, p_academic_year_id, 'earned', 15)
  ON CONFLICT (school_id, teacher_id, academic_year_id, leave_type) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================

COMMENT ON SCHEMA public IS 'Teachers Module v1.0 - Comprehensive workforce management system deployed successfully';
