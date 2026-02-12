-- =====================================================
-- ATTENDANCE MODULE - CORRECTED FOR EXISTING SCHEMA
-- =====================================================

-- 1. ATTENDANCE SESSIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS attendance_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  academic_year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  section_id UUID REFERENCES sections(id) ON DELETE CASCADE,
  session_date DATE NOT NULL,
  session_type VARCHAR(50) DEFAULT 'daily',
  marked_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  marked_at TIMESTAMPTZ,
  is_locked BOOLEAN DEFAULT FALSE,
  locked_at TIMESTAMPTZ,
  locked_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  total_students INTEGER DEFAULT 0,
  present_count INTEGER DEFAULT 0,
  absent_count INTEGER DEFAULT 0,
  late_count INTEGER DEFAULT 0,
  excused_count INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_session_per_day UNIQUE(school_id, class_id, section_id, session_date, session_type)
);

CREATE INDEX idx_attendance_sessions_school ON attendance_sessions(school_id);
CREATE INDEX idx_attendance_sessions_date ON attendance_sessions(session_date DESC);
CREATE INDEX idx_attendance_sessions_class ON attendance_sessions(class_id, section_id);
CREATE INDEX idx_attendance_sessions_year ON attendance_sessions(academic_year_id);

COMMENT ON TABLE attendance_sessions IS 'Attendance sessions for tracking daily attendance by class';

-- 2. ATTENDANCE RECORDS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS attendance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES attendance_sessions(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL CHECK (status IN ('present', 'absent', 'late', 'excused', 'half_day')),
  arrival_time TIME,
  minutes_late INTEGER,
  is_excused BOOLEAN DEFAULT FALSE,
  excuse_reason TEXT,
  marked_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  marked_at TIMESTAMPTZ DEFAULT NOW(),
  previous_status VARCHAR(20),
  modified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_student_session UNIQUE(student_id, session_id)
);

CREATE INDEX idx_attendance_records_school ON attendance_records(school_id);
CREATE INDEX idx_attendance_records_session ON attendance_records(session_id);
CREATE INDEX idx_attendance_records_student ON attendance_records(student_id);
CREATE INDEX idx_attendance_records_status ON attendance_records(status);
CREATE INDEX idx_attendance_records_date ON attendance_records(marked_at);

COMMENT ON TABLE attendance_records IS 'Individual student attendance records';

-- 3. ATTENDANCE SUMMARY CACHE TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS attendance_summary_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  summary_type VARCHAR(50) NOT NULL,
  reference_id UUID NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_days INTEGER DEFAULT 0,
  present_days INTEGER DEFAULT 0,
  absent_days INTEGER DEFAULT 0,
  late_days INTEGER DEFAULT 0,
  excused_days INTEGER DEFAULT 0,
  attendance_percentage DECIMAL(5,2),
  chronic_absence_flag BOOLEAN DEFAULT FALSE,
  at_risk_flag BOOLEAN DEFAULT FALSE,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_summary_cache UNIQUE(school_id, summary_type, reference_id, period_start, period_end)
);

CREATE INDEX idx_attendance_cache_school ON attendance_summary_cache(school_id);
CREATE INDEX idx_attendance_cache_type ON attendance_summary_cache(summary_type, reference_id);
CREATE INDEX idx_attendance_cache_period ON attendance_summary_cache(period_start, period_end);
CREATE INDEX idx_attendance_cache_at_risk ON attendance_summary_cache(at_risk_flag) WHERE at_risk_flag = TRUE;

COMMENT ON TABLE attendance_summary_cache IS 'Cached attendance summaries for performance';

-- 4. VIEWS
-- =====================================================

-- Student Attendance Overview (CORRECTED - uses enrollments join)
CREATE OR REPLACE VIEW student_attendance_overview AS
SELECT 
  s.id as student_id,
  s.school_id,
  s.first_name,
  s.last_name,
  s.admission_number,
  sec.class_id,
  c.name as class_name,
  e.section_id,
  sec.name as section_name,
  COUNT(DISTINCT ar.id) as total_sessions,
  COUNT(DISTINCT CASE WHEN ar.status = 'present' THEN ar.id END) as present_count,
  COUNT(DISTINCT CASE WHEN ar.status = 'absent' THEN ar.id END) as absent_count,
  COUNT(DISTINCT CASE WHEN ar.status = 'late' THEN ar.id END) as late_count,
  COUNT(DISTINCT CASE WHEN ar.status = 'excused' THEN ar.id END) as excused_count,
  ROUND(
    CASE 
      WHEN COUNT(DISTINCT ar.id) > 0 THEN 
        (COUNT(DISTINCT CASE WHEN ar.status = 'present' THEN ar.id END)::DECIMAL / COUNT(DISTINCT ar.id)) * 100
      ELSE 0 
    END, 2
  ) as attendance_percentage,
  MAX(ar.marked_at) as last_attendance_date
FROM students s
LEFT JOIN enrollments e ON s.id = e.student_id AND e.status = 'active'
LEFT JOIN sections sec ON e.section_id = sec.id
LEFT JOIN classes c ON sec.class_id = c.id
LEFT JOIN attendance_records ar ON s.id = ar.student_id
WHERE s.is_active = TRUE
GROUP BY s.id, s.school_id, s.first_name, s.last_name, s.admission_number, 
         sec.class_id, c.name, e.section_id, sec.name;

-- Class Attendance Summary
CREATE OR REPLACE VIEW class_attendance_summary AS
SELECT 
  ats.id as session_id,
  ats.school_id,
  ats.class_id,
  c.name as class_name,
  ats.section_id,
  sec.name as section_name,
  ats.session_date,
  ats.session_type,
  ats.total_students,
  ats.present_count,
  ats.absent_count,
  ats.late_count,
  ats.excused_count,
  ROUND(
    CASE 
      WHEN ats.total_students > 0 THEN 
        (ats.present_count::DECIMAL / ats.total_students) * 100
      ELSE 0 
    END, 2
  ) as attendance_percentage,
  ats.is_locked,
  ats.marked_at,
  p.first_name || ' ' || p.last_name as marked_by_name
FROM attendance_sessions ats
JOIN classes c ON ats.class_id = c.id
LEFT JOIN sections sec ON ats.section_id = sec.id
LEFT JOIN profiles p ON ats.marked_by = p.id
ORDER BY ats.session_date DESC, c.name, sec.name;

-- 5. FUNCTIONS
-- =====================================================

-- Update Session Counts
CREATE OR REPLACE FUNCTION update_attendance_session_counts()
RETURNS TRIGGER AS $$
BEGIN
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
      AND status = 'excused'
    ),
    updated_at = NOW()
  WHERE id = COALESCE(NEW.session_id, OLD.session_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Prevent Locked Session Edits
CREATE OR REPLACE FUNCTION prevent_locked_session_edit()
RETURNS TRIGGER AS $$
DECLARE
  v_is_locked BOOLEAN;
BEGIN
  SELECT is_locked INTO v_is_locked
  FROM attendance_sessions
  WHERE id = NEW.session_id;
  
  IF v_is_locked THEN
    RAISE EXCEPTION 'Cannot modify attendance for locked session';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Track Attendance Changes
CREATE OR REPLACE FUNCTION track_attendance_change()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
    NEW.previous_status := OLD.status;
    NEW.modified_at := NOW();
  END IF;
  
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update Attendance Cache
CREATE OR REPLACE FUNCTION update_attendance_cache()
RETURNS TRIGGER AS $$
BEGIN
  -- Student cache
  INSERT INTO attendance_summary_cache (
    school_id, summary_type, reference_id, period_start, period_end,
    total_days, present_days, absent_days, late_days, excused_days,
    attendance_percentage, chronic_absence_flag, at_risk_flag
  )
  SELECT 
    NEW.school_id,
    'student',
    NEW.student_id,
    DATE_TRUNC('month', NEW.marked_at)::DATE,
    (DATE_TRUNC('month', NEW.marked_at) + INTERVAL '1 month - 1 day')::DATE,
    COUNT(*),
    COUNT(*) FILTER (WHERE status = 'present'),
    COUNT(*) FILTER (WHERE status = 'absent'),
    COUNT(*) FILTER (WHERE status = 'late'),
    COUNT(*) FILTER (WHERE status = 'excused'),
    ROUND((COUNT(*) FILTER (WHERE status = 'present')::DECIMAL / COUNT(*)) * 100, 2),
    (COUNT(*) FILTER (WHERE status = 'absent')::DECIMAL / COUNT(*)) >= 0.1,
    (COUNT(*) FILTER (WHERE status = 'absent')::DECIMAL / COUNT(*)) >= 0.15
  FROM attendance_records
  WHERE student_id = NEW.student_id
    AND marked_at >= DATE_TRUNC('month', NEW.marked_at)
    AND marked_at < DATE_TRUNC('month', NEW.marked_at) + INTERVAL '1 month'
  ON CONFLICT (school_id, summary_type, reference_id, period_start, period_end)
  DO UPDATE SET
    total_days = EXCLUDED.total_days,
    present_days = EXCLUDED.present_days,
    absent_days = EXCLUDED.absent_days,
    late_days = EXCLUDED.late_days,
    excused_days = EXCLUDED.excused_days,
    attendance_percentage = EXCLUDED.attendance_percentage,
    chronic_absence_flag = EXCLUDED.chronic_absence_flag,
    at_risk_flag = EXCLUDED.at_risk_flag,
    last_updated = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Calculate Attendance Percentage
CREATE OR REPLACE FUNCTION calculate_student_attendance_percentage(
  p_student_id UUID,
  p_start_date DATE DEFAULT NULL,
  p_end_date DATE DEFAULT NULL
)
RETURNS DECIMAL AS $$
DECLARE
  v_percentage DECIMAL;
BEGIN
  SELECT 
    ROUND(
      CASE 
        WHEN COUNT(*) > 0 THEN 
          (COUNT(*) FILTER (WHERE status = 'present')::DECIMAL / COUNT(*)) * 100
        ELSE 0 
      END, 2
    )
  INTO v_percentage
  FROM attendance_records ar
  WHERE ar.student_id = p_student_id
    AND (p_start_date IS NULL OR ar.marked_at >= p_start_date)
    AND (p_end_date IS NULL OR ar.marked_at <= p_end_date);
  
  RETURN COALESCE(v_percentage, 0);
END;
$$ LANGUAGE plpgsql;

-- Get At-Risk Students
CREATE OR REPLACE FUNCTION get_at_risk_students(
  p_school_id UUID,
  p_threshold DECIMAL DEFAULT 85.0,
  p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
  student_id UUID,
  student_name TEXT,
  class_name TEXT,
  section_name TEXT,
  attendance_percentage DECIMAL,
  absent_days INTEGER,
  total_days INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id,
    s.first_name || ' ' || s.last_name,
    c.name,
    sec.name,
    ROUND(
      (COUNT(*) FILTER (WHERE ar.status = 'present')::DECIMAL / COUNT(*)) * 100, 2
    ) as attendance_pct,
    COUNT(*) FILTER (WHERE ar.status = 'absent')::INTEGER,
    COUNT(*)::INTEGER
  FROM students s
  LEFT JOIN enrollments e ON s.id = e.student_id AND e.status = 'active'
  LEFT JOIN sections sec ON e.section_id = sec.id
  LEFT JOIN classes c ON sec.class_id = c.id
  LEFT JOIN attendance_records ar ON s.id = ar.student_id 
    AND ar.marked_at >= CURRENT_DATE - p_days
  WHERE s.school_id = p_school_id
    AND s.is_active = TRUE
  GROUP BY s.id, s.first_name, s.last_name, c.name, sec.name
  HAVING 
    COUNT(*) > 0 
    AND ROUND((COUNT(*) FILTER (WHERE ar.status = 'present')::DECIMAL / COUNT(*)) * 100, 2) < p_threshold
  ORDER BY attendance_pct ASC;
END;
$$ LANGUAGE plpgsql;

-- Bulk Create Attendance Session
CREATE OR REPLACE FUNCTION bulk_create_attendance_session(
  p_school_id UUID,
  p_class_id UUID,
  p_section_id UUID,
  p_session_date DATE,
  p_academic_year_id UUID,
  p_marked_by UUID
)
RETURNS UUID AS $$
DECLARE
  v_session_id UUID;
  v_student_record RECORD;
BEGIN
  -- Create or get session
  INSERT INTO attendance_sessions (
    school_id, academic_year_id, class_id, section_id, session_date, marked_by
  )
  VALUES (
    p_school_id, p_academic_year_id, p_class_id, p_section_id, p_session_date, p_marked_by
  )
  ON CONFLICT (school_id, class_id, section_id, session_date, session_type)
  DO UPDATE SET updated_at = NOW()
  RETURNING id INTO v_session_id;
  
  -- Create records for all students in section
  FOR v_student_record IN
    SELECT DISTINCT s.id, p_school_id as school_id
    FROM students s
    JOIN enrollments e ON s.id = e.student_id
    WHERE e.section_id = p_section_id
      AND e.status = 'active'
      AND s.is_active = TRUE
  LOOP
    INSERT INTO attendance_records (
      school_id, session_id, student_id, status, marked_by
    )
    VALUES (
      v_student_record.school_id, v_session_id, v_student_record.id, 'present', p_marked_by
    )
    ON CONFLICT (student_id, session_id) DO NOTHING;
  END LOOP;
  
  RETURN v_session_id;
END;
$$ LANGUAGE plpgsql;

-- 6. TRIGGERS
-- =====================================================

CREATE TRIGGER trigger_update_session_counts
  AFTER INSERT OR UPDATE OR DELETE ON attendance_records
  FOR EACH ROW
  EXECUTE FUNCTION update_attendance_session_counts();

CREATE TRIGGER trigger_prevent_locked_edit
  BEFORE UPDATE ON attendance_records
  FOR EACH ROW
  EXECUTE FUNCTION prevent_locked_session_edit();

CREATE TRIGGER trigger_track_changes
  BEFORE UPDATE ON attendance_records
  FOR EACH ROW
  EXECUTE FUNCTION track_attendance_change();

CREATE TRIGGER trigger_update_cache
  AFTER INSERT OR UPDATE ON attendance_records
  FOR EACH ROW
  EXECUTE FUNCTION update_attendance_cache();

CREATE TRIGGER trigger_update_sessions_timestamp
  BEFORE UPDATE ON attendance_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_records_timestamp
  BEFORE UPDATE ON attendance_records
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 7. ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE attendance_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_summary_cache ENABLE ROW LEVEL SECURITY;

-- Sessions policies
CREATE POLICY "Users can view attendance sessions from their school"
  ON attendance_sessions FOR SELECT
  USING (attendance_sessions.school_id IN (SELECT profiles.school_id FROM profiles WHERE profiles.id = auth.uid()));

CREATE POLICY "Teachers can manage attendance sessions"
  ON attendance_sessions FOR ALL
  USING (
    attendance_sessions.school_id IN (
      SELECT profiles.school_id FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('teacher', 'admin', 'super_admin')
    )
  );

-- Records policies
CREATE POLICY "Users can view attendance records from their school"
  ON attendance_records FOR SELECT
  USING (attendance_records.school_id IN (SELECT profiles.school_id FROM profiles WHERE profiles.id = auth.uid()));

CREATE POLICY "Teachers can manage attendance records"
  ON attendance_records FOR ALL
  USING (
    attendance_records.school_id IN (
      SELECT profiles.school_id FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('teacher', 'admin', 'super_admin')
    )
  );

-- Cache policies
CREATE POLICY "Users can view attendance cache from their school"
  ON attendance_summary_cache FOR SELECT
  USING (attendance_summary_cache.school_id IN (SELECT profiles.school_id FROM profiles WHERE profiles.id = auth.uid()));

CREATE POLICY "System can manage attendance cache"
  ON attendance_summary_cache FOR ALL
  USING (TRUE);
