-- =====================================================
-- ATTENDANCE MODULE - HIGH-FREQUENCY SYSTEM
-- =====================================================
-- 
-- Purpose: Daily attendance tracking with performance optimization
-- Features: Bulk marking, locking, caching, risk alerts
-- Performance: Indexed queries, summary cache, idempotent saves
--
-- Tables: attendance_sessions, attendance_records, attendance_summary_cache
-- Views: student_attendance_overview, class_attendance_summary
-- Triggers: Auto-update summary cache, lock enforcement
-- Functions: calculate_attendance_percentage, detect_chronic_absenteeism
-- =====================================================

-- =====================================================
-- SECTION 1: ATTENDANCE SESSIONS
-- Tracks each attendance marking session (one per class per day)
-- =====================================================

CREATE TABLE IF NOT EXISTS attendance_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  academic_year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  section_id UUID REFERENCES sections(id) ON DELETE CASCADE,
  
  -- Session details
  session_date DATE NOT NULL,
  session_type VARCHAR(50) DEFAULT 'daily', -- daily, half_day_morning, half_day_afternoon, event
  
  -- Marking metadata
  marked_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  marked_at TIMESTAMPTZ,
  is_locked BOOLEAN DEFAULT FALSE,
  locked_at TIMESTAMPTZ,
  locked_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  
  -- Summary statistics (cached)
  total_students INTEGER DEFAULT 0,
  present_count INTEGER DEFAULT 0,
  absent_count INTEGER DEFAULT 0,
  late_count INTEGER DEFAULT 0,
  excused_count INTEGER DEFAULT 0,
  
  -- Notes
  notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Unique constraint: one session per class/section per date
  CONSTRAINT unique_session_per_day UNIQUE(school_id, class_id, section_id, session_date, session_type)
);

-- Indexes for performance
CREATE INDEX idx_attendance_sessions_school ON attendance_sessions(school_id);
CREATE INDEX idx_attendance_sessions_date ON attendance_sessions(session_date DESC);
CREATE INDEX idx_attendance_sessions_class ON attendance_sessions(class_id, section_id);
CREATE INDEX idx_attendance_sessions_marked_by ON attendance_sessions(marked_by);
CREATE INDEX idx_attendance_sessions_locked ON attendance_sessions(is_locked) WHERE is_locked = FALSE;

COMMENT ON TABLE attendance_sessions IS 'Attendance marking sessions - one per class per day';
COMMENT ON COLUMN attendance_sessions.is_locked IS 'Locked sessions cannot be edited (after deadline)';
COMMENT ON COLUMN attendance_sessions.session_type IS 'daily, half_day_morning, half_day_afternoon, event';

-- =====================================================
-- SECTION 2: ATTENDANCE RECORDS
-- Individual student attendance records
-- =====================================================

CREATE TABLE IF NOT EXISTS attendance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES attendance_sessions(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  
  -- Attendance status
  status VARCHAR(20) NOT NULL CHECK (status IN ('present', 'absent', 'late', 'excused', 'half_day')),
  
  -- Late arrival details
  arrival_time TIME,
  minutes_late INTEGER,
  
  -- Absence details
  is_excused BOOLEAN DEFAULT FALSE,
  excuse_reason TEXT,
  excuse_document_url TEXT,
  
  -- Marking metadata
  marked_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  marked_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Modification tracking
  previous_status VARCHAR(20),
  modified_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  modified_at TIMESTAMPTZ,
  
  -- Notes
  remarks TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Critical constraint: ONE record per student per session (idempotent saves)
  CONSTRAINT unique_student_session UNIQUE(student_id, session_id)
);

-- Indexes for high-frequency queries
CREATE INDEX idx_attendance_records_school ON attendance_records(school_id);
CREATE INDEX idx_attendance_records_session ON attendance_records(session_id);
CREATE INDEX idx_attendance_records_student ON attendance_records(student_id);
CREATE INDEX idx_attendance_records_status ON attendance_records(status);
CREATE INDEX idx_attendance_records_date_lookup ON attendance_records(student_id, marked_at DESC);

-- Composite index for common query: student attendance over date range
CREATE INDEX idx_attendance_student_date_range ON attendance_records(student_id, marked_at);

COMMENT ON TABLE attendance_records IS 'Individual student attendance records - UNIQUE per student per session';
COMMENT ON CONSTRAINT unique_student_session ON attendance_records IS 'Ensures idempotent saves - no duplicate records';

-- =====================================================
-- SECTION 3: ATTENDANCE SUMMARY CACHE
-- Pre-aggregated data for performance (dashboard queries)
-- =====================================================

CREATE TABLE IF NOT EXISTS attendance_summary_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  
  -- Aggregation scope
  summary_type VARCHAR(50) NOT NULL, -- student_monthly, class_daily, class_monthly, school_monthly
  reference_id UUID NOT NULL, -- student_id, class_id, or school_id depending on type
  
  -- Time period
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  
  -- Aggregated counts
  total_days INTEGER DEFAULT 0,
  present_days INTEGER DEFAULT 0,
  absent_days INTEGER DEFAULT 0,
  late_days INTEGER DEFAULT 0,
  excused_days INTEGER DEFAULT 0,
  
  -- Calculated metrics
  attendance_percentage DECIMAL(5,2), -- e.g., 95.50
  chronic_absence_flag BOOLEAN DEFAULT FALSE, -- TRUE if < 90%
  consecutive_absences INTEGER DEFAULT 0,
  
  -- Cache metadata
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  
  -- Unique constraint
  CONSTRAINT unique_summary_cache UNIQUE(school_id, summary_type, reference_id, period_start, period_end)
);

-- Indexes for cache lookups
CREATE INDEX idx_attendance_cache_school ON attendance_summary_cache(school_id);
CREATE INDEX idx_attendance_cache_type_ref ON attendance_summary_cache(summary_type, reference_id);
CREATE INDEX idx_attendance_cache_period ON attendance_summary_cache(period_start, period_end);
CREATE INDEX idx_attendance_cache_chronic ON attendance_summary_cache(chronic_absence_flag) WHERE chronic_absence_flag = TRUE;

COMMENT ON TABLE attendance_summary_cache IS 'Pre-aggregated attendance data for performance optimization';
COMMENT ON COLUMN attendance_summary_cache.summary_type IS 'student_monthly, class_daily, class_monthly, school_monthly';
COMMENT ON COLUMN attendance_summary_cache.chronic_absence_flag IS 'Risk alert: attendance < 90%';

-- =====================================================
-- SECTION 4: VIEWS FOR COMMON QUERIES
-- =====================================================

-- View: Student Attendance Overview (with cached percentages)
CREATE OR REPLACE VIEW student_attendance_overview AS
SELECT 
  s.id as student_id,
  s.admission_number,
  s.first_name,
  s.last_name,
  s.class_id,
  s.section_id,
  c.name as class_name,
  sec.name as section_name,
  
  -- Current month stats (from cache)
  COALESCE(cache_month.attendance_percentage, 0) as current_month_percentage,
  COALESCE(cache_month.present_days, 0) as current_month_present,
  COALESCE(cache_month.absent_days, 0) as current_month_absent,
  COALESCE(cache_month.late_days, 0) as current_month_late,
  COALESCE(cache_month.consecutive_absences, 0) as consecutive_absences,
  COALESCE(cache_month.chronic_absence_flag, FALSE) as at_risk,
  
  -- Recent records count
  (SELECT COUNT(*) 
   FROM attendance_records ar
   WHERE ar.student_id = s.id 
   AND ar.marked_at >= CURRENT_DATE - INTERVAL '30 days'
  ) as recent_records_count
  
FROM students s
LEFT JOIN classes c ON s.class_id = c.id
LEFT JOIN sections sec ON s.section_id = sec.id
LEFT JOIN attendance_summary_cache cache_month ON (
  cache_month.reference_id = s.id 
  AND cache_month.summary_type = 'student_monthly'
  AND cache_month.period_start = DATE_TRUNC('month', CURRENT_DATE)::DATE
)
WHERE s.is_deleted = FALSE;

COMMENT ON VIEW student_attendance_overview IS 'Quick lookup for student attendance with cached percentages';

-- View: Class Attendance Summary (daily averages)
CREATE OR REPLACE VIEW class_attendance_summary AS
SELECT 
  asess.id as session_id,
  asess.class_id,
  asess.section_id,
  c.name as class_name,
  sec.name as section_name,
  asess.session_date,
  asess.session_type,
  
  -- Counts
  asess.total_students,
  asess.present_count,
  asess.absent_count,
  asess.late_count,
  asess.excused_count,
  
  -- Percentage
  CASE 
    WHEN asess.total_students > 0 
    THEN ROUND((asess.present_count::DECIMAL / asess.total_students * 100), 2)
    ELSE 0 
  END as attendance_percentage,
  
  -- Status
  asess.is_locked,
  asess.marked_by,
  asess.marked_at
  
FROM attendance_sessions asess
JOIN classes c ON asess.class_id = c.id
LEFT JOIN sections sec ON asess.section_id = sec.id
ORDER BY asess.session_date DESC, c.name, sec.name;

COMMENT ON VIEW class_attendance_summary IS 'Daily attendance summary by class/section';

-- =====================================================
-- SECTION 5: TRIGGERS FOR AUTO-UPDATES
-- =====================================================

-- Function: Update session summary counts when records change
CREATE OR REPLACE FUNCTION update_attendance_session_counts()
RETURNS TRIGGER AS $$
BEGIN
  -- Recalculate counts for the session
  UPDATE attendance_sessions
  SET 
    total_students = (
      SELECT COUNT(*) 
      FROM attendance_records 
      WHERE session_id = COALESCE(NEW.session_id, OLD.session_id)
    ),
    present_count = (
      SELECT COUNT(*) 
      FROM attendance_records 
      WHERE session_id = COALESCE(NEW.session_id, OLD.session_id) 
      AND status = 'present'
    ),
    absent_count = (
      SELECT COUNT(*) 
      FROM attendance_records 
      WHERE session_id = COALESCE(NEW.session_id, OLD.session_id) 
      AND status = 'absent'
    ),
    late_count = (
      SELECT COUNT(*) 
      FROM attendance_records 
      WHERE session_id = COALESCE(NEW.session_id, OLD.session_id) 
      AND status = 'late'
    ),
    excused_count = (
      SELECT COUNT(*) 
      FROM attendance_records 
      WHERE session_id = COALESCE(NEW.session_id, OLD.session_id) 
      AND (status = 'excused' OR is_excused = TRUE)
    ),
    updated_at = NOW()
  WHERE id = COALESCE(NEW.session_id, OLD.session_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger: Auto-update session counts
DROP TRIGGER IF EXISTS trigger_update_session_counts ON attendance_records;
CREATE TRIGGER trigger_update_session_counts
  AFTER INSERT OR UPDATE OR DELETE ON attendance_records
  FOR EACH ROW
  EXECUTE FUNCTION update_attendance_session_counts();

-- Function: Track status changes in attendance records
CREATE OR REPLACE FUNCTION track_attendance_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- On update, track the previous status
  IF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
    NEW.previous_status := OLD.status;
    NEW.modified_at := NOW();
    -- modified_by should be set by application
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Track status changes
DROP TRIGGER IF EXISTS trigger_track_status_change ON attendance_records;
CREATE TRIGGER trigger_track_status_change
  BEFORE UPDATE ON attendance_records
  FOR EACH ROW
  EXECUTE FUNCTION track_attendance_status_change();

-- Function: Prevent editing locked sessions
CREATE OR REPLACE FUNCTION prevent_locked_session_edit()
RETURNS TRIGGER AS $$
DECLARE
  session_locked BOOLEAN;
BEGIN
  -- Check if session is locked
  SELECT is_locked INTO session_locked
  FROM attendance_sessions
  WHERE id = NEW.session_id;
  
  IF session_locked THEN
    RAISE EXCEPTION 'Cannot modify attendance for locked session';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Prevent locked session edits
DROP TRIGGER IF EXISTS trigger_prevent_locked_edit ON attendance_records;
CREATE TRIGGER trigger_prevent_locked_edit
  BEFORE INSERT OR UPDATE ON attendance_records
  FOR EACH ROW
  EXECUTE FUNCTION prevent_locked_session_edit();

-- Standard update timestamp triggers
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_attendance_sessions_updated_at ON attendance_sessions;
CREATE TRIGGER trigger_attendance_sessions_updated_at
  BEFORE UPDATE ON attendance_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_attendance_records_updated_at ON attendance_records;
CREATE TRIGGER trigger_attendance_records_updated_at
  BEFORE UPDATE ON attendance_records
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- =====================================================
-- SECTION 6: HELPER FUNCTIONS
-- =====================================================

-- Function: Calculate attendance percentage for student in date range
CREATE OR REPLACE FUNCTION calculate_attendance_percentage(
  p_student_id UUID,
  p_start_date DATE,
  p_end_date DATE
)
RETURNS DECIMAL(5,2) AS $$
DECLARE
  total_days INTEGER;
  present_days INTEGER;
  percentage DECIMAL(5,2);
BEGIN
  -- Count total days with records
  SELECT COUNT(*) INTO total_days
  FROM attendance_records ar
  JOIN attendance_sessions asess ON ar.session_id = asess.id
  WHERE ar.student_id = p_student_id
  AND asess.session_date BETWEEN p_start_date AND p_end_date;
  
  IF total_days = 0 THEN
    RETURN 0;
  END IF;
  
  -- Count present days (including late as present)
  SELECT COUNT(*) INTO present_days
  FROM attendance_records ar
  JOIN attendance_sessions asess ON ar.session_id = asess.id
  WHERE ar.student_id = p_student_id
  AND asess.session_date BETWEEN p_start_date AND p_end_date
  AND ar.status IN ('present', 'late');
  
  percentage := ROUND((present_days::DECIMAL / total_days * 100), 2);
  
  RETURN percentage;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION calculate_attendance_percentage IS 'Calculate attendance % for student in date range';

-- Function: Detect chronic absenteeism (< 90% attendance)
CREATE OR REPLACE FUNCTION detect_chronic_absenteeism()
RETURNS TABLE(
  student_id UUID,
  student_name TEXT,
  attendance_percentage DECIMAL(5,2),
  absent_days INTEGER,
  consecutive_absences INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id,
    s.first_name || ' ' || s.last_name,
    cache.attendance_percentage,
    cache.absent_days,
    cache.consecutive_absences
  FROM students s
  JOIN attendance_summary_cache cache ON cache.reference_id = s.id
  WHERE cache.summary_type = 'student_monthly'
  AND cache.period_start = DATE_TRUNC('month', CURRENT_DATE)::DATE
  AND cache.chronic_absence_flag = TRUE
  AND s.is_deleted = FALSE
  ORDER BY cache.attendance_percentage ASC;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION detect_chronic_absenteeism IS 'Returns students with < 90% attendance (risk alert)';

-- Function: Get consecutive absences for student
CREATE OR REPLACE FUNCTION get_consecutive_absences(p_student_id UUID)
RETURNS INTEGER AS $$
DECLARE
  consecutive_count INTEGER := 0;
  current_streak INTEGER := 0;
  record_status VARCHAR(20);
BEGIN
  -- Loop through recent records in reverse chronological order
  FOR record_status IN (
    SELECT ar.status
    FROM attendance_records ar
    JOIN attendance_sessions asess ON ar.session_id = asess.id
    WHERE ar.student_id = p_student_id
    ORDER BY asess.session_date DESC
    LIMIT 30
  ) LOOP
    IF record_status = 'absent' THEN
      current_streak := current_streak + 1;
    ELSE
      EXIT; -- Stop at first non-absent
    END IF;
  END LOOP;
  
  RETURN current_streak;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_consecutive_absences IS 'Count consecutive absent days for risk alerts';

-- =====================================================
-- SECTION 7: RLS POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE attendance_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_summary_cache ENABLE ROW LEVEL SECURITY;

-- Policy: School isolation for attendance_sessions
CREATE POLICY attendance_sessions_school_isolation ON attendance_sessions
  FOR ALL
  USING (school_id = current_setting('app.current_school_id', TRUE)::UUID);

-- Policy: School isolation for attendance_records
CREATE POLICY attendance_records_school_isolation ON attendance_records
  FOR ALL
  USING (school_id = current_setting('app.current_school_id', TRUE)::UUID);

-- Policy: School isolation for attendance_summary_cache
CREATE POLICY attendance_cache_school_isolation ON attendance_summary_cache
  FOR ALL
  USING (school_id = current_setting('app.current_school_id', TRUE)::UUID);

-- =====================================================
-- SECTION 8: INITIAL DATA / HELPER RPCs
-- =====================================================

-- RPC: Lock attendance session (after deadline)
CREATE OR REPLACE FUNCTION lock_attendance_session(
  p_session_id UUID,
  p_locked_by UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE attendance_sessions
  SET 
    is_locked = TRUE,
    locked_at = NOW(),
    locked_by = p_locked_by
  WHERE id = p_session_id
  AND is_locked = FALSE;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION lock_attendance_session IS 'Lock session to prevent further edits';

-- RPC: Refresh summary cache for student (called by background job)
CREATE OR REPLACE FUNCTION refresh_student_attendance_cache(
  p_student_id UUID,
  p_period_start DATE,
  p_period_end DATE
)
RETURNS VOID AS $$
DECLARE
  v_school_id UUID;
  v_total_days INTEGER;
  v_present_days INTEGER;
  v_absent_days INTEGER;
  v_late_days INTEGER;
  v_excused_days INTEGER;
  v_percentage DECIMAL(5,2);
  v_consecutive INTEGER;
BEGIN
  -- Get school_id
  SELECT school_id INTO v_school_id FROM students WHERE id = p_student_id;
  
  -- Calculate totals
  SELECT 
    COUNT(*),
    COUNT(*) FILTER (WHERE ar.status = 'present'),
    COUNT(*) FILTER (WHERE ar.status = 'absent'),
    COUNT(*) FILTER (WHERE ar.status = 'late'),
    COUNT(*) FILTER (WHERE ar.status = 'excused' OR ar.is_excused = TRUE)
  INTO v_total_days, v_present_days, v_absent_days, v_late_days, v_excused_days
  FROM attendance_records ar
  JOIN attendance_sessions asess ON ar.session_id = asess.id
  WHERE ar.student_id = p_student_id
  AND asess.session_date BETWEEN p_period_start AND p_period_end;
  
  -- Calculate percentage (counting late as present)
  IF v_total_days > 0 THEN
    v_percentage := ROUND(((v_present_days + v_late_days)::DECIMAL / v_total_days * 100), 2);
  ELSE
    v_percentage := 0;
  END IF;
  
  -- Get consecutive absences
  v_consecutive := get_consecutive_absences(p_student_id);
  
  -- Insert or update cache
  INSERT INTO attendance_summary_cache (
    school_id, summary_type, reference_id, period_start, period_end,
    total_days, present_days, absent_days, late_days, excused_days,
    attendance_percentage, chronic_absence_flag, consecutive_absences,
    last_updated
  ) VALUES (
    v_school_id, 'student_monthly', p_student_id, p_period_start, p_period_end,
    v_total_days, v_present_days, v_absent_days, v_late_days, v_excused_days,
    v_percentage, (v_percentage < 90), v_consecutive,
    NOW()
  )
  ON CONFLICT (school_id, summary_type, reference_id, period_start, period_end)
  DO UPDATE SET
    total_days = EXCLUDED.total_days,
    present_days = EXCLUDED.present_days,
    absent_days = EXCLUDED.absent_days,
    late_days = EXCLUDED.late_days,
    excused_days = EXCLUDED.excused_days,
    attendance_percentage = EXCLUDED.attendance_percentage,
    chronic_absence_flag = EXCLUDED.chronic_absence_flag,
    consecutive_absences = EXCLUDED.consecutive_absences,
    last_updated = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION refresh_student_attendance_cache IS 'Refresh cached attendance summary for student';

-- =====================================================
-- END OF ATTENDANCE MODULE
-- =====================================================
