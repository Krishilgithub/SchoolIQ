-- =====================================================
-- RESULTS SYSTEM MIGRATION
-- Purpose: Result calculation, analytics, and report cards
-- Features: GPA calculation, rankings, report templates, analytics
-- =====================================================

-- =====================================================
-- 1. CORE TABLES
-- =====================================================

-- Consolidated Results (Calculated from Marks)
CREATE TABLE IF NOT EXISTS student_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    exam_id UUID NOT NULL REFERENCES exam_master(id) ON DELETE CASCADE,
    class_id UUID REFERENCES classes(id) ON DELETE SET NULL,
    section_id UUID REFERENCES sections(id) ON DELETE SET NULL,
    total_marks_obtained DECIMAL(8,2),
    total_max_marks DECIMAL(8,2),
    overall_percentage DECIMAL(5,2),
    overall_grade VARCHAR(10),
    overall_gpa DECIMAL(4,2),
    class_rank INTEGER,
    section_rank INTEGER,
    is_passed BOOLEAN DEFAULT true,
    subjects_passed INTEGER DEFAULT 0,
    subjects_failed INTEGER DEFAULT 0,
    remarks TEXT,
    calculated_at TIMESTAMPTZ,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'calculated', 'verified', 'published')),
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id, exam_id)
);

-- Individual Subject Results
CREATE TABLE IF NOT EXISTS result_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    student_result_id UUID NOT NULL REFERENCES student_results(id) ON DELETE CASCADE,
    student_mark_id UUID REFERENCES student_marks(id) ON DELETE SET NULL,
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    marks_obtained DECIMAL(6,2),
    max_marks DECIMAL(6,2),
    percentage DECIMAL(5,2),
    grade VARCHAR(10),
    grade_points DECIMAL(4,2),
    is_passed BOOLEAN DEFAULT true,
    is_absent BOOLEAN DEFAULT false,
    practical_marks DECIMAL(6,2),
    theory_marks DECIMAL(6,2),
    internal_marks DECIMAL(6,2),
    remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Class/Section Rankings
CREATE TABLE IF NOT EXISTS student_rankings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    student_result_id UUID NOT NULL REFERENCES student_results(id) ON DELETE CASCADE,
    ranking_type VARCHAR(20) NOT NULL CHECK (ranking_type IN ('class', 'section', 'school', 'subject')),
    rank_value INTEGER NOT NULL,
    total_students INTEGER,
    percentile DECIMAL(5,2),
    subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_result_id, ranking_type, subject_id)
);

-- Report Card Templates
CREATE TABLE IF NOT EXISTS report_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    template_type VARCHAR(50) DEFAULT 'standard' CHECK (template_type IN ('standard', 'detailed', 'compact', 'cbse', 'icse', 'custom')),
    layout_config JSONB NOT NULL, -- Header, sections, footer design
    include_photo BOOLEAN DEFAULT true,
    include_attendance BOOLEAN DEFAULT true,
    include_remarks BOOLEAN DEFAULT true,
    include_graph BOOLEAN DEFAULT false,
    include_ranking BOOLEAN DEFAULT true,
    header_html TEXT,
    footer_html TEXT,
    css_styles TEXT,
    is_default BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Generated Report Cards
CREATE TABLE IF NOT EXISTS report_cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    student_result_id UUID NOT NULL REFERENCES student_results(id) ON DELETE CASCADE,
    template_id UUID REFERENCES report_templates(id) ON DELETE SET NULL,
    pdf_url TEXT, -- Stored PDF location
    generated_at TIMESTAMPTZ DEFAULT NOW(),
    generated_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    file_size_bytes INTEGER,
    is_sent_to_parent BOOLEAN DEFAULT false,
    sent_at TIMESTAMPTZ,
    download_count INTEGER DEFAULT 0,
    last_downloaded_at TIMESTAMPTZ,
    status VARCHAR(20) DEFAULT 'generated' CHECK (status IN ('generated', 'sent', 'downloaded', 'archived')),
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_result_id, template_id)
);

-- Result Analytics (Cached Calculations)
CREATE TABLE IF NOT EXISTS result_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    exam_id UUID NOT NULL REFERENCES exam_master(id) ON DELETE CASCADE,
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    section_id UUID REFERENCES sections(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
    analytics_type VARCHAR(50) NOT NULL CHECK (analytics_type IN ('overall', 'class', 'section', 'subject', 'teacher')),
    total_students INTEGER,
    students_appeared INTEGER,
    students_absent INTEGER,
    students_passed INTEGER,
    students_failed INTEGER,
    pass_percentage DECIMAL(5,2),
    highest_marks DECIMAL(6,2),
    lowest_marks DECIMAL(6,2),
    average_marks DECIMAL(6,2),
    median_marks DECIMAL(6,2),
    std_deviation DECIMAL(6,2),
    grade_distribution JSONB, -- {"A+": 5, "A": 10, "B+": 15, ...}
    performance_bands JSONB, -- {"90-100": 5, "80-89": 10, ...}
    calculated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(exam_id, class_id, section_id, subject_id, analytics_type)
);

-- Performance Trends (Historical Data)
CREATE TABLE IF NOT EXISTS performance_trends (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
    academic_year_id UUID REFERENCES academic_years(id) ON DELETE CASCADE,
    exam_sequence INTEGER, -- 1st exam, 2nd exam, etc.
    marks_obtained DECIMAL(6,2),
    percentage DECIMAL(5,2),
    grade VARCHAR(10),
    rank INTEGER,
    trend VARCHAR(20) CHECK (trend IN ('improving', 'declining', 'stable', 'fluctuating')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Result Comparison (Student vs Class Average)
CREATE TABLE IF NOT EXISTS result_comparisons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    student_result_id UUID NOT NULL REFERENCES student_results(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
    student_percentage DECIMAL(5,2),
    class_average DECIMAL(5,2),
    difference DECIMAL(5,2),
    position_relative_to_average VARCHAR(20) CHECK (position_relative_to_average IN ('above', 'below', 'at')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_result_id, subject_id)
);

-- Subject-wise Performance Metrics
CREATE TABLE IF NOT EXISTS subject_performance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    exam_id UUID NOT NULL REFERENCES exam_master(id) ON DELETE CASCADE,
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    section_id UUID REFERENCES sections(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    average_percentage DECIMAL(5,2),
    pass_percentage DECIMAL(5,2),
    highest_percentage DECIMAL(5,2),
    lowest_percentage DECIMAL(5,2),
    students_above_80 INTEGER,
    students_60_to_80 INTEGER,
    students_40_to_60 INTEGER,
    students_below_40 INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(exam_id, class_id, section_id, subject_id)
);

-- =====================================================
-- 2. INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX idx_student_results_student ON student_results(student_id, exam_id);
CREATE INDEX idx_student_results_class ON student_results(class_id, section_id, exam_id);
CREATE INDEX idx_student_results_status ON student_results(status, published_at DESC);
CREATE INDEX idx_result_items_result ON result_items(student_result_id);
CREATE INDEX idx_result_items_subject ON result_items(subject_id);
CREATE INDEX idx_rankings_result_type ON student_rankings(student_result_id, ranking_type);
CREATE INDEX idx_report_templates_school ON report_templates(school_id) WHERE is_active = true;
CREATE INDEX idx_report_cards_result ON report_cards(student_result_id);
CREATE INDEX idx_result_analytics_exam ON result_analytics(exam_id, analytics_type);
CREATE INDEX idx_performance_trends_student ON performance_trends(student_id, subject_id, exam_sequence);
CREATE INDEX idx_result_comparisons_result ON result_comparisons(student_result_id);
CREATE INDEX idx_subject_performance_exam ON subject_performance(exam_id, subject_id);

-- =====================================================
-- 3. TRIGGERS
-- =====================================================

-- Update timestamps
CREATE OR REPLACE FUNCTION update_result_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER student_results_updated_at
    BEFORE UPDATE ON student_results
    FOR EACH ROW
    EXECUTE FUNCTION update_result_updated_at();

CREATE TRIGGER report_templates_updated_at
    BEFORE UPDATE ON report_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_result_updated_at();

-- =====================================================
-- 4. CALCULATION FUNCTIONS
-- =====================================================

-- Calculate Overall Result for a Student
CREATE OR REPLACE FUNCTION calculate_student_result(p_student_id UUID, p_exam_id UUID)
RETURNS UUID AS $$
DECLARE
    v_result_id UUID;
    v_total_obtained DECIMAL(8,2);
    v_total_max DECIMAL(8,2);
    v_overall_percentage DECIMAL(5,2);
    v_subjects_passed INTEGER;
    v_subjects_failed INTEGER;
    v_class_id UUID;
    v_section_id UUID;
BEGIN
    -- Get student's class and section
    SELECT class_id, section_id INTO v_class_id, v_section_id
    FROM class_enrollments
    WHERE student_id = p_student_id AND status = 'active'
    ORDER BY created_at DESC
    LIMIT 1;

    -- Calculate totals from marks
    SELECT 
        SUM(marks_obtained),
        SUM(max_marks),
        COUNT(*) FILTER (WHERE NOT is_absent AND marks_obtained >= (
            SELECT ep.passing_marks FROM exam_papers ep WHERE ep.id = sm.exam_paper_id
        )),
        COUNT(*) FILTER (WHERE NOT is_absent AND marks_obtained < (
            SELECT ep.passing_marks FROM exam_papers ep WHERE ep.id = sm.exam_paper_id
        ))
    INTO v_total_obtained, v_total_max, v_subjects_passed, v_subjects_failed
    FROM student_marks sm
    JOIN exam_papers ep ON sm.exam_paper_id = ep.id
    WHERE sm.student_id = p_student_id
    AND ep.exam_id = p_exam_id
    AND sm.status = 'published';

    v_overall_percentage := CASE 
        WHEN v_total_max > 0 THEN (v_total_obtained / v_total_max * 100)
        ELSE 0
    END;

    -- Insert or update result
    INSERT INTO student_results (
        student_id,
        exam_id,
        class_id,
        section_id,
        total_marks_obtained,
        total_max_marks,
        overall_percentage,
        subjects_passed,
        subjects_failed,
        is_passed,
        status,
        calculated_at
    ) VALUES (
        p_student_id,
        p_exam_id,
        v_class_id,
        v_section_id,
        v_total_obtained,
        v_total_max,
        v_overall_percentage,
        v_subjects_passed,
        v_subjects_failed,
        (v_subjects_failed = 0),
        'calculated',
        NOW()
    )
    ON CONFLICT (student_id, exam_id) 
    DO UPDATE SET
        total_marks_obtained = EXCLUDED.total_marks_obtained,
        total_max_marks = EXCLUDED.total_max_marks,
        overall_percentage = EXCLUDED.overall_percentage,
        subjects_passed = EXCLUDED.subjects_passed,
        subjects_failed = EXCLUDED.subjects_failed,
        is_passed = EXCLUDED.is_passed,
        calculated_at = NOW()
    RETURNING id INTO v_result_id;

    -- Calculate result items
    DELETE FROM result_items WHERE student_result_id = v_result_id;
    
    INSERT INTO result_items (
        student_result_id,
        student_mark_id,
        subject_id,
        marks_obtained,
        max_marks,
        percentage,
        grade,
        grade_points,
        is_passed,
        is_absent
    )
    SELECT 
        v_result_id,
        sm.id,
        ep.subject_id,
        sm.marks_obtained,
        sm.max_marks,
        sm.percentage,
        sm.grade,
        sm.grade_points,
        (NOT sm.is_absent AND sm.marks_obtained >= ep.passing_marks),
        sm.is_absent
    FROM student_marks sm
    JOIN exam_papers ep ON sm.exam_paper_id = ep.id
    WHERE sm.student_id = p_student_id
    AND ep.exam_id = p_exam_id
    AND sm.status = 'published';

    RETURN v_result_id;
END;
$$ LANGUAGE plpgsql;

-- Calculate Rankings
CREATE OR REPLACE FUNCTION calculate_rankings(p_exam_id UUID, p_class_id UUID DEFAULT NULL, p_section_id UUID DEFAULT NULL)
RETURNS VOID AS $$
BEGIN
    -- Class-wide rankings
    WITH ranked_students AS (
        SELECT 
            id,
            ROW_NUMBER() OVER (
                PARTITION BY class_id, section_id 
                ORDER BY overall_percentage DESC, total_marks_obtained DESC
            ) as rank,
            COUNT(*) OVER (PARTITION BY class_id, section_id) as total
        FROM student_results
        WHERE exam_id = p_exam_id
        AND (p_class_id IS NULL OR class_id = p_class_id)
        AND (p_section_id IS NULL OR section_id = p_section_id)
        AND status IN ('calculated', 'verified', 'published')
    )
    INSERT INTO student_rankings (student_result_id, ranking_type, rank_value, total_students, percentile)
    SELECT 
        id,
        'section',
        rank,
        total,
        ((total - rank + 1)::DECIMAL / total * 100)
    FROM ranked_students
    ON CONFLICT (student_result_id, ranking_type, subject_id) 
    DO UPDATE SET
        rank_value = EXCLUDED.rank_value,
        total_students = EXCLUDED.total_students,
        percentile = EXCLUDED.percentile;

    -- Update rank in student_results
    UPDATE student_results sr
    SET section_rank = srk.rank_value
    FROM student_rankings srk
    WHERE sr.id = srk.student_result_id
    AND srk.ranking_type = 'section'
    AND sr.exam_id = p_exam_id;
END;
$$ LANGUAGE plpgsql;

-- Generate Analytics
CREATE OR REPLACE FUNCTION generate_result_analytics(p_exam_id UUID)
RETURNS VOID AS $$
BEGIN
    -- Overall analytics
    INSERT INTO result_analytics (
        exam_id,
        analytics_type,
        total_students,
        students_appeared,
        students_absent,
        students_passed,
        students_failed,
        pass_percentage,
        highest_marks,
        lowest_marks,
        average_marks
    )
    SELECT 
        p_exam_id,
        'overall',
        COUNT(*),
        COUNT(*) FILTER (WHERE subjects_failed + subjects_passed > 0),
        COUNT(*) - COUNT(*) FILTER (WHERE subjects_failed + subjects_passed > 0),
        COUNT(*) FILTER (WHERE is_passed = true),
        COUNT(*) FILTER (WHERE is_passed = false),
        (COUNT(*) FILTER (WHERE is_passed = true)::DECIMAL / 
            NULLIF(COUNT(*) FILTER (WHERE subjects_failed + subjects_passed > 0), 0) * 100),
        MAX(overall_percentage),
        MIN(overall_percentage),
        AVG(overall_percentage)
    FROM student_results
    WHERE exam_id = p_exam_id
    AND status IN ('calculated', 'verified', 'published')
    ON CONFLICT (exam_id, class_id, section_id, subject_id, analytics_type)
    DO UPDATE SET
        total_students = EXCLUDED.total_students,
        students_appeared = EXCLUDED.students_appeared,
        students_passed = EXCLUDED.students_passed,
        students_failed = EXCLUDED.students_failed,
        pass_percentage = EXCLUDED.pass_percentage,
        highest_marks = EXCLUDED.highest_marks,
        lowest_marks = EXCLUDED.lowest_marks,
        average_marks = EXCLUDED.average_marks,
        calculated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 5. RLS POLICIES
-- =====================================================

ALTER TABLE student_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE result_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_rankings ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE result_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_trends ENABLE ROW LEVEL SECURITY;
ALTER TABLE result_comparisons ENABLE ROW LEVEL SECURITY;
ALTER TABLE subject_performance ENABLE ROW LEVEL SECURITY;

-- Student results access
CREATE POLICY student_results_access ON student_results
    FOR ALL USING (
        student_id IN (
            SELECT id FROM students 
            WHERE school_id IN (SELECT school_id FROM profiles WHERE id = auth.uid())
            OR user_id = auth.uid()
        )
    );

-- Result items access
CREATE POLICY result_items_access ON result_items
    FOR ALL USING (
        student_result_id IN (
            SELECT sr.id FROM student_results sr
            JOIN students s ON sr.student_id = s.id
            WHERE s.school_id IN (SELECT school_id FROM profiles WHERE id = auth.uid())
            OR s.user_id = auth.uid()
        )
    );

-- Rankings access
CREATE POLICY rankings_access ON student_rankings
    FOR ALL USING (
        student_result_id IN (
            SELECT sr.id FROM student_results sr
            JOIN students s ON sr.student_id = s.id
            WHERE s.school_id IN (SELECT school_id FROM profiles WHERE id = auth.uid())
        )
    );

-- Report templates access
CREATE POLICY report_templates_access ON report_templates
    FOR ALL USING (
        school_id IN (SELECT school_id FROM profiles WHERE id = auth.uid())
    );

-- Report cards access
CREATE POLICY report_cards_access ON report_cards
    FOR ALL USING (
        student_result_id IN (
            SELECT sr.id FROM student_results sr
            JOIN students s ON sr.student_id = s.id
            WHERE s.school_id IN (SELECT school_id FROM profiles WHERE id = auth.uid())
            OR s.user_id = auth.uid()
        )
    );

-- Analytics access (school staff only)
CREATE POLICY analytics_access ON result_analytics
    FOR ALL USING (
        exam_id IN (
            SELECT id FROM exam_master 
            WHERE school_id IN (SELECT school_id FROM profiles WHERE id = auth.uid())
        )
    );

-- Performance trends access
CREATE POLICY performance_trends_access ON performance_trends
    FOR ALL USING (
        student_id IN (
            SELECT id FROM students 
            WHERE school_id IN (SELECT school_id FROM profiles WHERE id = auth.uid())
            OR user_id = auth.uid()
        )
    );

-- Result comparisons access
CREATE POLICY result_comparisons_access ON result_comparisons
    FOR ALL USING (
        student_result_id IN (
            SELECT sr.id FROM student_results sr
            JOIN students s ON sr.student_id = s.id
            WHERE s.school_id IN (SELECT school_id FROM profiles WHERE id = auth.uid())
            OR s.user_id = auth.uid()
        )
    );

-- Subject performance access
CREATE POLICY subject_performance_access ON subject_performance
    FOR ALL USING (
        exam_id IN (
            SELECT id FROM exam_master 
            WHERE school_id IN (SELECT school_id FROM profiles WHERE id = auth.uid())
        )
    );
