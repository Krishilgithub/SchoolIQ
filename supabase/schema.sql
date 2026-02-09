-- ==============================================================================
-- 00_INIT.SQL
-- Extensions, Utilities, and Global Config
-- ==============================================================================

-- Enable exact-match search and UUID generation
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Function to generate UUID v7 (Time-ordered UUIDs)
-- Source: Improved version for Postgres
CREATE OR REPLACE FUNCTION uuid_generate_v7()
RETURNS uuid
AS $$
DECLARE
  unix_ts_ms bytea;
  uuid_bytes bytea;
BEGIN
  unix_ts_ms = substring(int8send(floor(extract(epoch from clock_timestamp()) * 1000)::bigint) from 3);

  -- Use random bytes for the remaining bits
  uuid_bytes = unix_ts_ms || gen_random_bytes(10);

  -- Set version to 7 (0111)
  uuid_bytes = set_byte(uuid_bytes, 6, (get_byte(uuid_bytes, 6) & x'0f'::int) | x'70'::int);

  -- Set variant to 2 (10)
  uuid_bytes = set_byte(uuid_bytes, 8, (get_byte(uuid_bytes, 8) & x'3f'::int) | x'80'::int);

  RETURN encode(uuid_bytes, 'hex')::uuid;
END;
$$ LANGUAGE plpgsql VOLATILE;

-- Generic Trigger Function for Updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Generic Audit Trigger Function
CREATE OR REPLACE FUNCTION audit_trigger_func()
RETURNS TRIGGER AS $$
DECLARE
    json_old JSONB;
    json_new JSONB;
BEGIN
    IF (TG_OP = 'DELETE') THEN
        json_old = to_jsonb(OLD);
    ELSIF (TG_OP = 'INSERT') THEN
        json_new = to_jsonb(NEW);
    ELSIF (TG_OP = 'UPDATE') THEN
        json_old = to_jsonb(OLD);
        json_new = to_jsonb(NEW);
    END IF;

    INSERT INTO audit_logs (
        table_name,
        operation,
        record_id,
        old_values,
        new_values,
        changed_by,
        school_id
    ) VALUES (
        TG_TABLE_NAME,
        TG_OP,
        COALESCE(NEW.id, OLD.id),
        json_old,
        json_new,
        auth.uid(),
        COALESCE(NEW.school_id, OLD.school_id)
    );

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- 01_ORGANIZATION.SQL
-- Multi-tenancy Core
-- ==============================================================================

CREATE TYPE school_type AS ENUM ('k12', 'higher_ed', 'vocational');
CREATE TYPE subscription_status AS ENUM ('active', 'past_due', 'canceled', 'trial');

CREATE TABLE schools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE, -- For subdomains: school.app.com
    school_type school_type DEFAULT 'k12',
    logo_url TEXT,
    website TEXT,
    contact_email TEXT NOT NULL,
    contact_phone TEXT,
    address JSONB, -- { street, city, state, zip, country }
    subscription_status subscription_status DEFAULT 'trial',
    settings JSONB DEFAULT '{}'::jsonb, -- Global config
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TRIGGER update_schools_modtime BEFORE UPDATE ON schools FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Campuses/Branches for large schools
CREATE TABLE campuses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    address JSONB,
    head_of_campus UUID, -- Reference to user
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_campuses_modtime BEFORE UPDATE ON campuses FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TABLE academic_years (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- e.g., "2023-2024"
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT academic_years_dates_check CHECK (end_date > start_date)
);

-- Terms/Semesters
CREATE TABLE terms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    academic_year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- "Term 1", "Semester A"
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT terms_dates_check CHECK (end_date > start_date)
);

-- ==============================================================================
-- 02_AUTH_RBAC.SQL
-- Users, Roles, Permissions
-- ==============================================================================

CREATE TYPE user_role AS ENUM ('super_admin', 'school_admin', 'teacher', 'student', 'guardian', 'staff');
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'suspended', 'invited');

-- Core User Profile (Extends Supabase Auth)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE, -- 1:1 with Auth
    email TEXT UNIQUE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    avatar_url TEXT,
    phone_number TEXT,
    is_super_admin BOOLEAN DEFAULT FALSE, -- Platform owner
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_profiles_modtime BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Many-to-Many: User <-> School (A user can belong to multiple schools, e.g., a teacher in 2 schools)
-- But primarily users are scoped to one school context at a time in the UI.
CREATE TABLE school_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    role user_role NOT NULL,
    status user_status DEFAULT 'active',
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, school_id)
);

-- Granular Permissions
CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    code TEXT NOT NULL UNIQUE, -- e.g., "student.create", "grade.update"
    description TEXT,
    module TEXT NOT NULL -- "academics", "finance"
);

-- Custom Role Definitions (if schools want custom roles beyond the Enum)
CREATE TABLE custom_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Role -> Permissions
CREATE TABLE role_permissions (
    role_id UUID NOT NULL REFERENCES custom_roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- Audit Logs Table (Defined early for trigger usage)
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    school_id UUID REFERENCES schools(id) ON DELETE SET NULL,
    table_name TEXT NOT NULL,
    operation TEXT NOT NULL, -- INSERT, UPDATE, DELETE
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    changed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Indexes for Audit
CREATE INDEX idx_audit_logs_school ON audit_logs(school_id);
CREATE INDEX idx_audit_logs_table_record ON audit_logs(table_name, record_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);


-- ==============================================================================
-- 03_STUDENT_MANAGEMENT.SQL
-- ==============================================================================

CREATE TYPE gender_enum AS ENUM ('male', 'female', 'other');
CREATE TYPE guardian_relationship AS ENUM ('father', 'mother', 'guardian', 'sibling', 'other');

CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id), -- Link to auth user if student has login
    admission_number TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    middle_name TEXT,
    date_of_birth DATE NOT NULL,
    gender gender_enum,
    address JSONB,
    profile_photo_url TEXT,
    medical_notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    enrollment_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(school_id, admission_number)
);
CREATE TRIGGER update_students_modtime BEFORE UPDATE ON students FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER audit_students AFTER INSERT OR UPDATE OR DELETE ON students FOR EACH ROW EXECUTE PROCEDURE audit_trigger_func();

CREATE TABLE guardians (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT,
    phone TEXT NOT NULL,
    address JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TRIGGER update_guardians_modtime BEFORE UPDATE ON guardians FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER audit_guardians AFTER INSERT OR UPDATE OR DELETE ON guardians FOR EACH ROW EXECUTE PROCEDURE audit_trigger_func();

CREATE TABLE student_guardians (
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    guardian_id UUID NOT NULL REFERENCES guardians(id) ON DELETE CASCADE,
    relationship guardian_relationship NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    is_emergency_contact BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (student_id, guardian_id)
);

CREATE TABLE classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- e.g. "Grade 10"
    level INTEGER,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- e.g. "A"
    room_number TEXT,
    class_teacher_id UUID REFERENCES profiles(id),
    capacity INTEGER DEFAULT 40,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    section_id UUID NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
    academic_year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
    roll_number TEXT,
    status TEXT DEFAULT 'active',
    enrolled_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id, academic_year_id)
);

-- ==============================================================================
-- 04_ACADEMICS.SQL
-- ==============================================================================

CREATE TABLE subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    code TEXT,
    description TEXT,
    department TEXT,
    type TEXT DEFAULT 'theory',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE section_subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    section_id UUID NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(section_id, subject_id)
);

CREATE TABLE exams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    academic_year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
    term_id UUID REFERENCES terms(id),
    name TEXT NOT NULL,
    start_date DATE,
    end_date DATE,
    is_published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE grading_schemes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE grade_boundaries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    grading_scheme_id UUID NOT NULL REFERENCES grading_schemes(id) ON DELETE CASCADE,
    grade TEXT NOT NULL,
    min_score NUMERIC NOT NULL,
    max_score NUMERIC NOT NULL,
    points NUMERIC,
    description TEXT
);

CREATE TABLE assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    section_subject_id UUID NOT NULL REFERENCES section_subjects(id) ON DELETE CASCADE,
    exam_id UUID REFERENCES exams(id),
    title TEXT NOT NULL,
    max_marks NUMERIC NOT NULL DEFAULT 100,
    weightage NUMERIC DEFAULT 0,
    assess_date DATE,
    grading_scheme_id UUID REFERENCES grading_schemes(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TRIGGER audit_assessments AFTER INSERT OR UPDATE OR DELETE ON assessments FOR EACH ROW EXECUTE PROCEDURE audit_trigger_func();

CREATE TABLE marks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    marks_obtained NUMERIC,
    grade_obtained TEXT,
    remarks TEXT,
    is_absent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(assessment_id, student_id)
);
CREATE TRIGGER update_marks_modtime BEFORE UPDATE ON marks FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER audit_marks AFTER INSERT OR UPDATE OR DELETE ON marks FOR EACH ROW EXECUTE PROCEDURE audit_trigger_func();

-- ==============================================================================
-- 05_ATTENDANCE.SQL
-- ==============================================================================

CREATE TABLE attendance_registers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    section_id UUID NOT NULL REFERENCES sections(id),
    date DATE NOT NULL,
    taken_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(section_id, date)
);

CREATE TABLE attendance_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    register_id UUID NOT NULL REFERENCES attendance_registers(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id),
    status TEXT NOT NULL,
    remarks TEXT,
    UNIQUE(register_id, student_id)
);

-- ==============================================================================
-- 06_ANALYTICS.SQL
-- ==============================================================================

CREATE TABLE student_performance_snapshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    academic_year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
    term_id UUID REFERENCES terms(id),
    average_score NUMERIC,
    attendance_percentage NUMERIC,
    risk_score INTEGER, -- 0-100
    calculated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE risk_flags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- academic, attendance, behavioral
    severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    description TEXT,
    is_resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

CREATE TABLE interventions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    start_date DATE,
    end_date DATE,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 07_COMMUNICATION.SQL
-- ==============================================================================

CREATE TABLE announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    author_id UUID REFERENCES profiles(id),
    target_roles user_role[], -- Array of roles
    is_published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE message_threads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    subject TEXT,
    type TEXT DEFAULT 'direct', -- direct, group
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE thread_participants (
    thread_id UUID NOT NULL REFERENCES message_threads(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    last_read_at TIMESTAMPTZ,
    PRIMARY KEY (thread_id, user_id)
);

CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    thread_id UUID NOT NULL REFERENCES message_threads(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 08_FILES.SQL
-- ==============================================================================

CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    file_path TEXT NOT NULL, -- Storage bucket path
    file_type TEXT,
    size_bytes BIGINT,
    uploaded_by UUID REFERENCES profiles(id),
    entity_type TEXT, -- student, assignment, etc.
    entity_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 09_BILLING.SQL
-- ==============================================================================
-- Future-proofing for SaaS

CREATE TABLE plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    price_monthly NUMERIC,
    price_yearly NUMERIC,
    features JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES plans(id),
    status subscription_status DEFAULT 'trial',
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    school_id UUID NOT NULL REFERENCES schools(id),
    amount NUMERIC NOT NULL,
    currency TEXT DEFAULT 'USD',
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 99_POLICIES_AND_OPTIMIZATION.SQL
-- ==============================================================================

-- Sample RLS Policy Enablement
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE marks ENABLE ROW LEVEL SECURITY;

-- Additional Indexes for Performance
CREATE INDEX idx_students_school ON students(school_id);
CREATE INDEX idx_enrollments_student ON enrollments(student_id);
CREATE INDEX idx_enrollments_section ON enrollments(section_id);
CREATE INDEX idx_marks_student ON marks(student_id);
CREATE INDEX idx_marks_assessment ON marks(assessment_id);
CREATE INDEX idx_messages_thread ON messages(thread_id);
CREATE INDEX idx_attendance_records_student ON attendance_records(student_id);

-- ==============================================================================
-- 10_RLS_POLICIES.SQL
-- ==============================================================================

-- Helper function to check if the current user is a member of the given school
CREATE OR REPLACE FUNCTION public.is_school_member(lookup_school_id UUID)
RETURNS BOOLEAN SECURITY DEFINER AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM school_members
    WHERE user_id = auth.uid()
      AND school_id = lookup_school_id
      AND status = 'active'
  );
END;
$$ LANGUAGE plpgsql;

-- Helper function to check if the current user has a specific role in the school
CREATE OR REPLACE FUNCTION public.has_role(lookup_school_id UUID, required_role user_role)
RETURNS BOOLEAN SECURITY DEFINER AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM school_members
    WHERE user_id = auth.uid()
      AND school_id = lookup_school_id
      AND role = required_role
      AND status = 'active'
  );
END;
$$ LANGUAGE plpgsql;

-- ------------------------------------------------------------------------------
-- SCHOOLS
-- ------------------------------------------------------------------------------
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;

-- Anyone can read basic school info (for login pages)
CREATE POLICY "Public read access for schools" ON schools
    FOR SELECT TO authenticated, anon USING (true);

-- Only Super Admins can insert/update/delete schools
CREATE POLICY "Super admin full access schools" ON schools
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true)
    );

-- ------------------------------------------------------------------------------
-- PROFILES
-- ------------------------------------------------------------------------------
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- ------------------------------------------------------------------------------
-- STUDENTS
-- ------------------------------------------------------------------------------
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- School Admins and Teachers can view all students in their school
CREATE POLICY "Staff view all students" ON students
    FOR SELECT USING (
        is_school_member(school_id) AND 
        (has_role(school_id, 'school_admin') OR has_role(school_id, 'teacher'))
    );

-- Guardians can view associated students
CREATE POLICY "Guardians view own wards" ON students
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM student_guardians sg
            JOIN guardians g ON sg.guardian_id = g.id
            WHERE sg.student_id = students.id
            AND g.user_id = auth.uid()
        )
    );

-- Students can view themselves
CREATE POLICY "Students view self" ON students
    FOR SELECT USING (
        user_id = auth.uid()
    );

-- ------------------------------------------------------------------------------
-- ACADEMIC TABLES (Classes, Subjects, Exams)
-- ------------------------------------------------------------------------------
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "School members view classes" ON classes
    FOR SELECT USING (is_school_member(school_id));

ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "School members view subjects" ON subjects
    FOR SELECT USING (is_school_member(school_id));

ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "School members view exams" ON exams
    FOR SELECT USING (is_school_member(school_id));

-- ------------------------------------------------------------------------------
-- MARKS & GRADES
-- ------------------------------------------------------------------------------
ALTER TABLE marks ENABLE ROW LEVEL SECURITY;

-- Teachers can view/insert/update marks for their school (Refine to Section later)
CREATE POLICY "Teachers manage marks" ON marks
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM assessments a
            JOIN section_subjects ss ON a.section_subject_id = ss.id
            JOIN sections s ON ss.section_id = s.id
            JOIN classes c ON s.class_id = c.id
            WHERE a.id = marks.assessment_id
            AND has_role(c.school_id, 'teacher')
        )
    );

-- Students/Guardians view only their own marks
CREATE POLICY "Students view own marks" ON marks
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM students s
            WHERE s.id = marks.student_id
            AND s.user_id = auth.uid()
        )
    );

-- ------------------------------------------------------------------------------
-- ATTENDANCE
-- ------------------------------------------------------------------------------
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff manage attendance" ON attendance_records
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM attendance_registers ar
            JOIN sections s ON ar.section_id = s.id
            JOIN classes c ON s.class_id = c.id
            WHERE ar.id = attendance_records.register_id
            AND (has_role(c.school_id, 'teacher') OR has_role(c.school_id, 'school_admin'))
        )
    );

-- ==============================================================================
-- 11_SUPER_ADMIN.SQL
-- Enterprise Management & Visibility
-- ==============================================================================

-- 1. System Metrics
CREATE TABLE system_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    metric_type TEXT NOT NULL, -- 'api_latency', 'db_cpu', 'error_rate', 'active_users'
    value NUMERIC NOT NULL,
    metadata JSONB,
    recorded_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_system_metrics_type_time ON system_metrics(metric_type, recorded_at DESC);

-- 2. Support Tickets
CREATE TYPE ticket_status AS ENUM ('open', 'in_progress', 'resolved', 'closed');
CREATE TYPE ticket_priority AS ENUM ('low', 'medium', 'high', 'critical');

CREATE TABLE tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    school_id UUID REFERENCES schools(id) ON DELETE SET NULL,
    user_id UUID REFERENCES profiles(id),
    subject TEXT NOT NULL,
    description TEXT NOT NULL,
    status ticket_status DEFAULT 'open',
    priority ticket_priority DEFAULT 'medium',
    assigned_to UUID REFERENCES profiles(id), -- Super admin agent
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);
CREATE TRIGGER update_tickets_modtime BEFORE UPDATE ON tickets FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TABLE ticket_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES profiles(id), -- If null, maybe system message
    message TEXT NOT NULL,
    is_internal_note BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Feature Flags (Global or Per-School)
CREATE TABLE feature_flags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    key TEXT NOT NULL UNIQUE, -- 'beta_dashboard_v2'
    description TEXT,
    is_enabled_globally BOOLEAN DEFAULT FALSE,
    target_school_ids UUID[], -- Specific schools allowed
    rollout_percentage INTEGER DEFAULT 0, -- 0-100
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Impersonation Logs (Strict auditing)
CREATE TABLE impersonation_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    impersonator_id UUID NOT NULL REFERENCES profiles(id), -- Super Admin
    target_user_id UUID NOT NULL REFERENCES profiles(id), -- Victim/Subject
    reason TEXT NOT NULL,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ
);

-- ==============================================================================
-- 12_SUPER_ADMIN_RLS.SQL
-- ==============================================================================

ALTER TABLE system_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE impersonation_logs ENABLE ROW LEVEL SECURITY;

-- Helper for Super Admin Check (Optimized)
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN SECURITY DEFINER AS $$
BEGIN
  -- Check JWT claim first (faster), fall back to table
  -- Note: We will add a custom claim 'is_super_admin' in Auth hook later, 
  -- but for now rely on reliable database lookup
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND is_super_admin = true
  );
END;
$$ LANGUAGE plpgsql;

-- Policies

-- System Metrics: Only Super Admin
CREATE POLICY "Super admin view metrics" ON system_metrics
    FOR SElECT USING (is_super_admin());

-- Feature Flags: Everyone read (for app behavior), Only SA write
CREATE POLICY "Public read flags" ON feature_flags
    FOR SELECT TO authenticated, anon USING (true);

CREATE POLICY "Super admin manage flags" ON feature_flags
    FOR ALL USING (is_super_admin());

-- Tickets: 
-- Super Admin: View/Manage All
-- School Admin/Teacher: View/Manage Own School's tickets
CREATE POLICY "Super admin manage all tickets" ON tickets
    FOR ALL USING (is_super_admin());

CREATE POLICY "Users manage own tickets" ON tickets
    FOR ALL USING (
        (school_id IN (SELECT school_id FROM school_members WHERE user_id = auth.uid()))
        OR (user_id = auth.uid())
    );

CREATE POLICY "Super admin manage messages" ON ticket_messages
    FOR ALL USING (is_super_admin());

CREATE POLICY "Users view messages for own tickets" ON ticket_messages
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM tickets t WHERE t.id = ticket_id AND (t.user_id = auth.uid() OR t.school_id IN (SELECT school_id FROM school_members WHERE user_id = auth.uid())))
    );

CREATE POLICY "Users post messages to own tickets" ON ticket_messages
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM tickets t WHERE t.id = ticket_id AND (t.user_id = auth.uid() OR t.school_id IN (SELECT school_id FROM school_members WHERE user_id = auth.uid())))
    );

-- Impersonation Logs: Super Admin Read-Only
CREATE POLICY "Super admin view impersonation logs" ON impersonation_logs
    FOR SELECT USING (is_super_admin());

-- Audit Logs: 
-- Enhance existing audit_logs to allow SA to view everything
-- Existing policies might be missing? Let's add them.
CREATE POLICY "Super admin view all audit logs" ON audit_logs
    FOR SELECT USING (is_super_admin());
