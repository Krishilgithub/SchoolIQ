-- =====================================================
-- TIMETABLE SYSTEM MIGRATION
-- Purpose: Complete timetable management with conflict detection
-- Features: Versioning, clash detection, substitutions, audit trail
-- =====================================================

-- =====================================================
-- 1. CORE TABLES
-- =====================================================

-- Rooms/Venues
CREATE TABLE IF NOT EXISTS rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    room_number VARCHAR(50),
    building VARCHAR(100),
    capacity INTEGER,
    room_type VARCHAR(50), -- classroom, lab, auditorium, sports
    facilities TEXT[], -- projector, computers, etc
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(school_id, room_number)
);

-- Periods (Time Slots)
CREATE TABLE IF NOT EXISTS periods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL, -- Period 1, Period 2, Break, Lunch
    period_number INTEGER,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    duration_minutes INTEGER GENERATED ALWAYS AS (
        EXTRACT(EPOCH FROM (end_time - start_time)) / 60
    ) STORED,
    is_break BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

-- Timetables (Master Table)
CREATE TABLE IF NOT EXISTS timetables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    academic_year_id UUID REFERENCES academic_years(id) ON DELETE SET NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    effective_from DATE NOT NULL,
    effective_until DATE,
    is_current BOOLEAN DEFAULT false,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    published_at TIMESTAMPTZ,
    published_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    version INTEGER DEFAULT 1
);

-- Timetable Versions (History Tracking)
CREATE TABLE IF NOT EXISTS timetable_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    timetable_id UUID NOT NULL REFERENCES timetables(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    snapshot JSONB NOT NULL, -- Full timetable data snapshot
    changes_summary TEXT,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(timetable_id, version_number)
);

-- Timetable Entries (Individual Slots)
CREATE TABLE IF NOT EXISTS timetable_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    timetable_id UUID NOT NULL REFERENCES timetables(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sunday
    period_id UUID NOT NULL REFERENCES periods(id) ON DELETE CASCADE,
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    section_id UUID REFERENCES sections(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    room_id UUID REFERENCES rooms(id) ON DELETE SET NULL,
    is_substitution BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Teacher Assignments (Workload Tracking)
CREATE TABLE IF NOT EXISTS teacher_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    academic_year_id UUID REFERENCES academic_years(id) ON DELETE CASCADE,
    teacher_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    section_id UUID REFERENCES sections(id) ON DELETE CASCADE,
    periods_per_week INTEGER,
    is_class_teacher BOOLEAN DEFAULT false,
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Substitutions (Teacher Replacements)
CREATE TABLE IF NOT EXISTS substitutions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    timetable_entry_id UUID NOT NULL REFERENCES timetable_entries(id) ON DELETE CASCADE,
    original_teacher_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    substitute_teacher_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    date DATE NOT NULL,
    reason VARCHAR(200),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'completed', 'cancelled')),
    assigned_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    assigned_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conflicts Log (Audit Trail)
CREATE TABLE IF NOT EXISTS timetable_conflicts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    timetable_id UUID REFERENCES timetables(id) ON DELETE CASCADE,
    conflict_type VARCHAR(50) NOT NULL, -- teacher_clash, room_clash, class_clash
    severity VARCHAR(20) DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    description TEXT NOT NULL,
    affected_entries UUID[], -- Array of timetable_entry IDs
    resolution_status VARCHAR(20) DEFAULT 'unresolved' CHECK (resolution_status IN ('unresolved', 'resolved', 'ignored')),
    resolved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    resolved_at TIMESTAMPTZ,
    resolution_notes TEXT,
    detected_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB
);

-- =====================================================
-- 2. INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX idx_rooms_school ON rooms(school_id) WHERE is_available = true;
CREATE INDEX idx_periods_school ON periods(school_id) WHERE is_active = true;
CREATE INDEX idx_timetables_school_status ON timetables(school_id, status);
CREATE INDEX idx_timetables_current ON timetables(school_id) WHERE is_current = true;
CREATE INDEX idx_timetable_entries_timetable ON timetable_entries(timetable_id);
CREATE INDEX idx_timetable_entries_day_period ON timetable_entries(day_of_week, period_id);
CREATE INDEX idx_timetable_entries_class ON timetable_entries(class_id, section_id);
CREATE INDEX idx_timetable_entries_teacher ON timetable_entries(teacher_id);
CREATE INDEX idx_timetable_entries_room ON timetable_entries(room_id);
CREATE INDEX idx_teacher_assignments_teacher ON teacher_assignments(teacher_id, academic_year_id);
CREATE INDEX idx_substitutions_date ON substitutions(date, status);
CREATE INDEX idx_substitutions_teacher ON substitutions(original_teacher_id, substitute_teacher_id);
CREATE INDEX idx_conflicts_timetable_status ON timetable_conflicts(timetable_id, resolution_status);

-- =====================================================
-- 3. TRIGGERS
-- =====================================================

-- Update timestamps
CREATE OR REPLACE FUNCTION update_timetable_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER timetables_updated_at
    BEFORE UPDATE ON timetables
    FOR EACH ROW
    EXECUTE FUNCTION update_timetable_updated_at();

CREATE TRIGGER timetable_entries_updated_at
    BEFORE UPDATE ON timetable_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_timetable_updated_at();

CREATE TRIGGER teacher_assignments_updated_at
    BEFORE UPDATE ON teacher_assignments
    FOR EACH ROW
    EXECUTE FUNCTION update_timetable_updated_at();

CREATE TRIGGER substitutions_updated_at
    BEFORE UPDATE ON substitutions
    FOR EACH ROW
    EXECUTE FUNCTION update_timetable_updated_at();

-- Auto-increment version on timetable publish
CREATE OR REPLACE FUNCTION increment_timetable_version()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'published' AND OLD.status = 'draft' THEN
        NEW.version = OLD.version + 1;
        NEW.published_at = NOW();
        
        -- Create version snapshot
        INSERT INTO timetable_versions (
            timetable_id, 
            version_number, 
            snapshot, 
            created_by
        )
        VALUES (
            NEW.id,
            NEW.version,
            jsonb_build_object(
                'name', NEW.name,
                'effective_from', NEW.effective_from,
                'effective_until', NEW.effective_until,
                'published_at', NEW.published_at
            ),
            NEW.published_by
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER timetables_version_increment
    BEFORE UPDATE ON timetables
    FOR EACH ROW
    WHEN (OLD.status IS DISTINCT FROM NEW.status)
    EXECUTE FUNCTION increment_timetable_version();

-- =====================================================
-- 4. CONFLICT DETECTION FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION detect_timetable_conflicts(p_timetable_id UUID)
RETURNS TABLE (
    conflict_type VARCHAR,
    description TEXT,
    affected_entries UUID[]
) AS $$
BEGIN
    -- Teacher conflicts
    RETURN QUERY
    SELECT 
        'teacher_clash'::VARCHAR,
        'Teacher ' || p.first_name || ' ' || p.last_name || ' has multiple classes at the same time'::TEXT,
        array_agg(te.id)
    FROM timetable_entries te
    JOIN profiles p ON te.teacher_id = p.id
    WHERE te.timetable_id = p_timetable_id
    GROUP BY te.day_of_week, te.period_id, te.teacher_id, p.first_name, p.last_name
    HAVING COUNT(*) > 1;

    -- Room conflicts
    RETURN QUERY
    SELECT 
        'room_clash'::VARCHAR,
        'Room ' || r.name || ' is double-booked'::TEXT,
        array_agg(te.id)
    FROM timetable_entries te
    JOIN rooms r ON te.room_id = r.id
    WHERE te.timetable_id = p_timetable_id
    AND te.room_id IS NOT NULL
    GROUP BY te.day_of_week, te.period_id, te.room_id, r.name
    HAVING COUNT(*) > 1;

    -- Class conflicts
   RETURN QUERY
    SELECT 
        'class_clash'::VARCHAR,
        'Class has multiple subjects at the same time'::TEXT,
        array_agg(te.id)
    FROM timetable_entries te
    WHERE te.timetable_id = p_timetable_id
    GROUP BY te.day_of_week, te.period_id, te.class_id, te.section_id
    HAVING COUNT(*) > 1;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 5. RLS POLICIES
-- =====================================================

ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE timetables ENABLE ROW LEVEL SECURITY;
ALTER TABLE timetable_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE timetable_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE substitutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE timetable_conflicts ENABLE ROW LEVEL SECURITY;

-- Rooms policies
CREATE POLICY rooms_school_access ON rooms
    FOR ALL USING (
        school_id IN (
            SELECT school_id FROM profiles WHERE id = auth.uid()
        )
    );

-- Periods policies
CREATE POLICY periods_school_access ON periods
    FOR ALL USING (
        school_id IN (
            SELECT school_id FROM profiles WHERE id = auth.uid()
        )
    );

-- Timetables policies
CREATE POLICY timetables_school_access ON timetables
    FOR ALL USING (
        school_id IN (
            SELECT school_id FROM profiles WHERE id = auth.uid()
        )
    );

-- Timetable entries policies
CREATE POLICY timetable_entries_access ON timetable_entries
    FOR ALL USING (
        timetable_id IN (
            SELECT id FROM timetables 
            WHERE school_id IN (
                SELECT school_id FROM profiles WHERE id = auth.uid()
            )
        )
    );

-- Teacher assignments policies
CREATE POLICY teacher_assignments_access ON teacher_assignments
    FOR ALL USING (
        school_id IN (
            SELECT school_id FROM profiles WHERE id = auth.uid()
        )
    );

-- Substitutions policies
CREATE POLICY substitutions_access ON substitutions
    FOR ALL USING (
        timetable_entry_id IN (
            SELECT te.id FROM timetable_entries te
            JOIN timetables t ON te.timetable_id = t.id
            WHERE t.school_id IN (
                SELECT school_id FROM profiles WHERE id = auth.uid()
            )
        )
    );

-- Conflicts policies
CREATE POLICY conflicts_access ON timetable_conflicts
    FOR ALL USING (
        timetable_id IN (
            SELECT id FROM timetables 
            WHERE school_id IN (
                SELECT school_id FROM profiles WHERE id = auth.uid()
            )
        )
    );

-- Versions policies (read-only for most users)
CREATE POLICY versions_read_access ON timetable_versions
    FOR SELECT USING (
        timetable_id IN (
            SELECT id FROM timetables 
            WHERE school_id IN (
                SELECT school_id FROM profiles WHERE id = auth.uid()
            )
        )
    );
