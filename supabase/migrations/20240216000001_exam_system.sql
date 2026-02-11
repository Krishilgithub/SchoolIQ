-- =====================================================
-- EXAM SYSTEM MIGRATION
-- Purpose: Enterprise-level exam management with moderation
-- Features: Multiple exam types, marks history, approval workflow
-- =====================================================

-- =====================================================
-- 1. CORE TABLES
-- =====================================================

-- Exam Types Configuration
CREATE TABLE IF NOT EXISTS exam_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL, -- Unit Test, Mid-term, Final Term
    code VARCHAR(50),
    weightage DECIMAL(5,2), -- Percentage contribution to final grade
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(school_id, code)
);

-- Grading Schemes
CREATE TABLE IF NOT EXISTS grading_schemes_new (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    grading_type VARCHAR(20) DEFAULT 'percentage' CHECK (grading_type IN ('percentage', 'gpa', 'letter', 'points')),
    is_default BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Grade Boundaries (A, B, C, etc.)
CREATE TABLE IF NOT EXISTS grade_boundaries_new (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    grading_scheme_id UUID NOT NULL REFERENCES grading_schemes_new(id) ON DELETE CASCADE,
    grade VARCHAR(10) NOT NULL, -- A+, A, B+, etc.
    min_percentage DECIMAL(5,2) NOT NULL,
    max_percentage DECIMAL(5,2) NOT NULL,
    grade_point DECIMAL(4,2), -- For GPA calculation
    description TEXT, -- Excellent, Good, etc.
    display_order INTEGER,
    CONSTRAINT valid_percentage_range CHECK (min_percentage >= 0 AND max_percentage <= 100),
    CONSTRAINT valid_range CHECK (max_percentage > min_percentage)
);

-- Exams (Master Table)
CREATE TABLE IF NOT EXISTS exam_master (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    academic_year_id UUID REFERENCES academic_years(id) ON DELETE CASCADE,
    term_id UUID REFERENCES terms(id) ON DELETE SET NULL,
    exam_type_id UUID REFERENCES exam_types(id) ON DELETE SET NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'ongoing', 'completed', 'cancelled')),
    grading_scheme_id UUID REFERENCES grading_schemes_new(id) ON DELETE SET NULL,
    start_date DATE,
    end_date DATE,
    result_declaration_date DATE,
    is_published BOOLEAN DEFAULT false,
    published_at TIMESTAMPTZ,
    published_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB
);

-- Exam Papers (Individual Subject Exams)
CREATE TABLE IF NOT EXISTS exam_papers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    exam_id UUID NOT NULL REFERENCES exam_master(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    section_id UUID REFERENCES sections(id) ON DELETE CASCADE,
    paper_code VARCHAR(50),
    paper_name VARCHAR(200),
    exam_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    duration_minutes INTEGER GENERATED ALWAYS AS (
        EXTRACT(EPOCH FROM (end_time - start_time)) / 60
    ) STORED,
    max_marks DECIMAL(6,2) NOT NULL DEFAULT 100,
    passing_marks DECIMAL(6,2),
    room_id UUID REFERENCES rooms(id) ON DELETE SET NULL,
    invigilator_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    instructions TEXT,
    paper_pattern JSONB, -- MCQ, descriptive, practical mix
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'ongoing', 'completed', 'postponed', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(exam_id, subject_id, class_id, section_id)
);

-- Student Marks (The Critical Table)
CREATE TABLE IF NOT EXISTS student_marks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    exam_paper_id UUID NOT NULL REFERENCES exam_papers(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    marks_obtained DECIMAL(6,2),
    max_marks DECIMAL(6,2) NOT NULL,
    percentage DECIMAL(5,2) GENERATED ALWAYS AS (
        CASE 
            WHEN max_marks > 0 THEN (marks_obtained / max_marks * 100)
            ELSE 0
        END
    ) STORED,
    grade VARCHAR(10),
    grade_points DECIMAL(4,2),
    is_absent BOOLEAN DEFAULT false,
    is_grace_marks BOOLEAN DEFAULT false,
    grace_marks DECIMAL(5,2) DEFAULT 0,
    remarks TEXT,
    entered_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    entered_at TIMESTAMPTZ,
    moderated_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    moderated_at TIMESTAMPTZ,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'moderated', 'approved', 'published')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(exam_paper_id, student_id),
    CONSTRAINT valid_marks CHECK (marks_obtained <= max_marks),
    CONSTRAINT valid_grace CHECK (grace_marks >= 0)
);

-- Marks History (Audit Trail)
CREATE TABLE IF NOT EXISTS marks_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    student_mark_id UUID NOT NULL REFERENCES student_marks(id) ON DELETE CASCADE,
    old_marks DECIMAL(6,2),
    new_marks DECIMAL(6,2),
    old_grade VARCHAR(10),
    new_grade VARCHAR(10),
    change_reason TEXT,
    changed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    changed_at TIMESTAMPTZ DEFAULT NOW(),
    change_type VARCHAR(50), -- correction, re-evaluation, moderation
    approved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    approved_at TIMESTAMPTZ
);

-- Moderation Workflow
CREATE TABLE IF NOT EXISTS moderation_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    exam_paper_id UUID NOT NULL REFERENCES exam_papers(id) ON DELETE CASCADE,
    submitted_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    moderator_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_review', 'approved', 'rejected', 'revision_required')),
    total_students INTEGER,
    marks_entered INTEGER,
    comments TEXT,
    moderator_comments TEXT,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Re-evaluation Requests
CREATE TABLE IF NOT EXISTS reevaluation_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    student_mark_id UUID NOT NULL REFERENCES student_marks(id) ON DELETE CASCADE,
    requested_by UUID REFERENCES profiles(id) ON DELETE SET NULL, -- Student/Parent
    request_date DATE NOT NULL DEFAULT CURRENT_DATE,
    reason TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'in_progress', 'completed', 'rejected')),
    fee_paid DECIMAL(10,2),
    original_marks DECIMAL(6,2),
    revised_marks DECIMAL(6,2),
    marks_changed BOOLEAN DEFAULT false,
    evaluator_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    evaluator_remarks TEXT,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Result Publication Control
CREATE TABLE IF NOT EXISTS result_publications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    exam_id UUID NOT NULL REFERENCES exam_master(id) ON DELETE CASCADE,
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    section_id UUID REFERENCES sections(id) ON DELETE CASCADE,
    publication_date DATE NOT NULL,
    is_published BOOLEAN DEFAULT false,
    published_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    published_at TIMESTAMPTZ,
    notify_parents BOOLEAN DEFAULT true,
    notify_students BOOLEAN DEFAULT true,
    notification_sent_at TIMESTAMPTZ,
    access_code VARCHAR(50), -- For secure access
    remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 2. INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX idx_exam_types_school ON exam_types(school_id) WHERE is_active = true;
CREATE INDEX idx_grading_schemes_school ON grading_schemes_new(school_id) WHERE is_active = true;
CREATE INDEX idx_grade_boundaries_scheme ON grade_boundaries_new(grading_scheme_id, display_order);
CREATE INDEX idx_exam_master_school_year ON exam_master(school_id, academic_year_id, status);
CREATE INDEX idx_exam_papers_exam ON exam_papers(exam_id, exam_date);
CREATE INDEX idx_exam_papers_class ON exam_papers(class_id, section_id, exam_date);
CREATE INDEX idx_student_marks_paper ON student_marks(exam_paper_id, status);
CREATE INDEX idx_student_marks_student ON student_marks(student_id);
CREATE INDEX idx_marks_history_mark ON marks_history(student_mark_id, changed_at DESC);
CREATE INDEX idx_moderation_requests_status ON moderation_requests(status, submitted_at DESC);
CREATE INDEX idx_reevaluation_requests_status ON reevaluation_requests(status, request_date DESC);
CREATE INDEX idx_result_publications_exam ON result_publications(exam_id, is_published);

-- =====================================================
-- 3. TRIGGERS
-- =====================================================

-- Update timestamps
CREATE OR REPLACE FUNCTION update_exam_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER exam_master_updated_at
    BEFORE UPDATE ON exam_master
    FOR EACH ROW
    EXECUTE FUNCTION update_exam_updated_at();

CREATE TRIGGER exam_papers_updated_at
    BEFORE UPDATE ON exam_papers
    FOR EACH ROW
    EXECUTE FUNCTION update_exam_updated_at();

CREATE TRIGGER student_marks_updated_at
    BEFORE UPDATE ON student_marks
    FOR EACH ROW
    EXECUTE FUNCTION update_exam_updated_at();

-- Auto-calculate grade on marks update
CREATE OR REPLACE FUNCTION calculate_grade_on_marks_update()
RETURNS TRIGGER AS $$
DECLARE
    v_scheme_id UUID;
    v_percentage DECIMAL(5,2);
    v_grade VARCHAR(10);
    v_grade_points DECIMAL(4,2);
BEGIN
    -- Get grading scheme
    SELECT e.grading_scheme_id INTO v_scheme_id
    FROM exam_papers ep
    JOIN exam_master e ON ep.exam_id = e.id
    WHERE ep.id = NEW.exam_paper_id;

    IF v_scheme_id IS NOT NULL AND NOT NEW.is_absent THEN
        -- Calculate percentage (already done by generated column)
        v_percentage := (NEW.marks_obtained / NEW.max_marks * 100);

        -- Find matching grade
        SELECT grade, grade_point INTO v_grade, v_grade_points
        FROM grade_boundaries_new
        WHERE grading_scheme_id = v_scheme_id
        AND v_percentage >= min_percentage
        AND v_percentage <= max_percentage
        ORDER BY min_percentage DESC
        LIMIT 1;

        NEW.grade := v_grade;
        NEW.grade_points := v_grade_points;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_grade_trigger
    BEFORE INSERT OR UPDATE OF marks_obtained ON student_marks
    FOR EACH ROW
    WHEN (NEW.marks_obtained IS NOT NULL)
    EXECUTE FUNCTION calculate_grade_on_marks_update();

-- Record marks changes in history
CREATE OR REPLACE FUNCTION record_marks_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.marks_obtained IS DISTINCT FROM NEW.marks_obtained THEN
        INSERT INTO marks_history (
            student_mark_id,
            old_marks,
            new_marks,
            old_grade,
            new_grade,
            changed_by,
            change_type
        ) VALUES (
            NEW.id,
            OLD.marks_obtained,
            NEW.marks_obtained,
            OLD.grade,
            NEW.grade,
            auth.uid(),
            CASE 
                WHEN NEW.status = 'moderated' THEN 'moderation'
                WHEN OLD.status = 'published' THEN 're-evaluation'
                ELSE 'correction'
            END
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER marks_change_history
    AFTER UPDATE ON student_marks
    FOR EACH ROW
    WHEN (OLD.marks_obtained IS DISTINCT FROM NEW.marks_obtained)
    EXECUTE FUNCTION record_marks_change();

-- =====================================================
-- 4. HELPER FUNCTIONS
-- =====================================================

-- Calculate class statistics
CREATE OR REPLACE FUNCTION calculate_class_statistics(p_exam_paper_id UUID)
RETURNS TABLE (
    total_students BIGINT,
    appeared BIGINT,
    absent BIGINT,
    passed BIGINT,
    failed BIGINT,
    highest_marks DECIMAL,
    lowest_marks DECIMAL,
    average_marks DECIMAL,
    pass_percentage DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::BIGINT,
        COUNT(*) FILTER (WHERE NOT is_absent)::BIGINT,
        COUNT(*) FILTER (WHERE is_absent)::BIGINT,
        COUNT(*) FILTER (WHERE NOT is_absent AND marks_obtained >= (
            SELECT passing_marks FROM exam_papers WHERE id = p_exam_paper_id
        ))::BIGINT,
        COUNT(*) FILTER (WHERE NOT is_absent AND marks_obtained < (
            SELECT passing_marks FROM exam_papers WHERE id = p_exam_paper_id
        ))::BIGINT,
        MAX(marks_obtained),
        MIN(marks_obtained) FILTER (WHERE NOT is_absent),
        AVG(marks_obtained) FILTER (WHERE NOT is_absent),
        (COUNT(*) FILTER (WHERE NOT is_absent AND marks_obtained >= (
            SELECT passing_marks FROM exam_papers WHERE id = p_exam_paper_id
        ))::DECIMAL / NULLIF(COUNT(*) FILTER (WHERE NOT is_absent), 0) * 100)
    FROM student_marks
    WHERE exam_paper_id = p_exam_paper_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 5. RLS POLICIES
-- =====================================================

ALTER TABLE exam_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE grading_schemes_new ENABLE ROW LEVEL SECURITY;
ALTER TABLE grade_boundaries_new ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_papers ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_marks ENABLE ROW LEVEL SECURITY;
ALTER TABLE marks_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE reevaluation_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE result_publications ENABLE ROW LEVEL SECURITY;

-- School-based access for most tables
CREATE POLICY exam_types_school_access ON exam_types
    FOR ALL USING (
        school_id IN (SELECT school_id FROM profiles WHERE id = auth.uid())
    );

CREATE POLICY grading_schemes_school_access ON grading_schemes_new
    FOR ALL USING (
        school_id IN (SELECT school_id FROM profiles WHERE id = auth.uid())
    );

CREATE POLICY grade_boundaries_access ON grade_boundaries_new
    FOR ALL USING (
        grading_scheme_id IN (
            SELECT id FROM grading_schemes_new 
            WHERE school_id IN (SELECT school_id FROM profiles WHERE id = auth.uid())
        )
    );

CREATE POLICY exam_master_school_access ON exam_master
    FOR ALL USING (
        school_id IN (SELECT school_id FROM profiles WHERE id = auth.uid())
    );

CREATE POLICY exam_papers_access ON exam_papers
    FOR ALL USING (
        exam_id IN (
            SELECT id FROM exam_master 
            WHERE school_id IN (SELECT school_id FROM profiles WHERE id = auth.uid())
        )
    );

CREATE POLICY student_marks_access ON student_marks
    FOR ALL USING (
        exam_paper_id IN (
            SELECT ep.id FROM exam_papers ep
            JOIN exam_master e ON ep.exam_id = e.id
            WHERE e.school_id IN (SELECT school_id FROM profiles WHERE id = auth.uid())
        )
        OR student_id IN (
            SELECT id FROM students WHERE user_id = auth.uid()
        )
    );

CREATE POLICY marks_history_access ON marks_history
    FOR SELECT USING (
        student_mark_id IN (
            SELECT sm.id FROM student_marks sm
            JOIN exam_papers ep ON sm.exam_paper_id = ep.id
            JOIN exam_master e ON ep.exam_id = e.id
            WHERE e.school_id IN (SELECT school_id FROM profiles WHERE id = auth.uid())
        )
    );

CREATE POLICY moderation_requests_access ON moderation_requests
    FOR ALL USING (
        exam_paper_id IN (
            SELECT ep.id FROM exam_papers ep
            JOIN exam_master e ON ep.exam_id = e.id
            WHERE e.school_id IN (SELECT school_id FROM profiles WHERE id = auth.uid())
        )
    );

CREATE POLICY reevaluation_requests_access ON reevaluation_requests
    FOR ALL USING (
        student_mark_id IN (
            SELECT sm.id FROM student_marks sm
            JOIN exam_papers ep ON sm.exam_paper_id = ep.id
            JOIN exam_master e ON ep.exam_id = e.id
            WHERE e.school_id IN (SELECT school_id FROM profiles WHERE id = auth.uid())
        )
    );

CREATE POLICY result_publications_access ON result_publications
    FOR ALL USING (
        exam_id IN (
            SELECT id FROM exam_master 
            WHERE school_id IN (SELECT school_id FROM profiles WHERE id = auth.uid())
        )
    );
