# Database Schema

-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.academic_years (
id uuid NOT NULL DEFAULT uuid_generate_v7(),
school_id uuid NOT NULL,
name text NOT NULL,
start_date date NOT NULL,
end_date date NOT NULL,
is_active boolean DEFAULT false,
created_at timestamp with time zone DEFAULT now(),
updated_at timestamp with time zone DEFAULT now(),
CONSTRAINT academic_years_pkey PRIMARY KEY (id),
CONSTRAINT academic_years_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id)
);
CREATE TABLE public.announcements (
id uuid NOT NULL DEFAULT uuid_generate_v7(),
school_id uuid NOT NULL,
title text NOT NULL,
content text NOT NULL,
author_id uuid,
target_roles ARRAY,
is_published boolean DEFAULT false,
created_at timestamp with time zone DEFAULT now(),
CONSTRAINT announcements_pkey PRIMARY KEY (id),
CONSTRAINT announcements_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id),
CONSTRAINT announcements_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.assessments (
id uuid NOT NULL DEFAULT uuid_generate_v7(),
section_subject_id uuid NOT NULL,
exam_id uuid,
title text NOT NULL,
max_marks numeric NOT NULL DEFAULT 100,
weightage numeric DEFAULT 0,
assess_date date,
grading_scheme_id uuid,
created_at timestamp with time zone DEFAULT now(),
CONSTRAINT assessments_pkey PRIMARY KEY (id),
CONSTRAINT assessments_section_subject_id_fkey FOREIGN KEY (section_subject_id) REFERENCES public.section_subjects(id),
CONSTRAINT assessments_exam_id_fkey FOREIGN KEY (exam_id) REFERENCES public.exams(id),
CONSTRAINT assessments_grading_scheme_id_fkey FOREIGN KEY (grading_scheme_id) REFERENCES public.grading_schemes(id)
);
CREATE TABLE public.attendance_records (
id uuid NOT NULL DEFAULT uuid_generate_v7(),
register_id uuid NOT NULL,
student_id uuid NOT NULL,
status text NOT NULL,
remarks text,
CONSTRAINT attendance_records_pkey PRIMARY KEY (id),
CONSTRAINT attendance_records_register_id_fkey FOREIGN KEY (register_id) REFERENCES public.attendance_registers(id),
CONSTRAINT attendance_records_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id)
);
CREATE TABLE public.attendance_registers (
id uuid NOT NULL DEFAULT uuid_generate_v7(),
section_id uuid NOT NULL,
date date NOT NULL,
taken_by uuid,
created_at timestamp with time zone DEFAULT now(),
CONSTRAINT attendance_registers_pkey PRIMARY KEY (id),
CONSTRAINT attendance_registers_section_id_fkey FOREIGN KEY (section_id) REFERENCES public.sections(id),
CONSTRAINT attendance_registers_taken_by_fkey FOREIGN KEY (taken_by) REFERENCES public.profiles(id)
);
CREATE TABLE public.audit_logs (
id uuid NOT NULL DEFAULT uuid_generate_v7(),
school_id uuid,
table_name text NOT NULL,
operation text NOT NULL,
record_id uuid,
old_values jsonb,
new_values jsonb,
changed_by uuid,
created_at timestamp with time zone DEFAULT now(),
CONSTRAINT audit_logs_pkey PRIMARY KEY (id),
CONSTRAINT audit_logs_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id),
CONSTRAINT audit_logs_changed_by_fkey FOREIGN KEY (changed_by) REFERENCES public.profiles(id)
);
CREATE TABLE public.campuses (
id uuid NOT NULL DEFAULT uuid_generate_v7(),
school_id uuid NOT NULL,
name text NOT NULL,
address jsonb,
head_of_campus uuid,
created_at timestamp with time zone DEFAULT now(),
updated_at timestamp with time zone DEFAULT now(),
CONSTRAINT campuses_pkey PRIMARY KEY (id),
CONSTRAINT campuses_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id)
);
CREATE TABLE public.class_subjects (
id uuid NOT NULL DEFAULT uuid_generate_v4(),
class_id uuid NOT NULL,
subject_id uuid NOT NULL,
teacher_id uuid,
periods_per_week integer DEFAULT 5 CHECK (periods_per_week > 0),
created_at timestamp with time zone DEFAULT now(),
CONSTRAINT class_subjects_pkey PRIMARY KEY (id),
CONSTRAINT class_subjects_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id),
CONSTRAINT class_subjects_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(id),
CONSTRAINT class_subjects_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES public.teachers(id)
);
CREATE TABLE public.classes (
id uuid NOT NULL DEFAULT uuid_generate_v7(),
school_id uuid NOT NULL,
name character varying NOT NULL,
grade_level integer CHECK (grade_level >= 1 AND grade_level <= 12),
description text,
created_at timestamp with time zone DEFAULT now(),
section character varying DEFAULT 'A'::character varying,
academic_year character varying DEFAULT '2024-2025'::character varying,
class_teacher_id uuid,
total_students integer DEFAULT 0 CHECK (total_students >= 0),
capacity integer CHECK (capacity IS NULL OR capacity > 0),
room_number character varying,
updated_at timestamp with time zone DEFAULT now(),
CONSTRAINT classes_pkey PRIMARY KEY (id),
CONSTRAINT classes_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id),
CONSTRAINT classes_class_teacher_id_fkey FOREIGN KEY (class_teacher_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.custom_roles (
id uuid NOT NULL DEFAULT uuid_generate_v7(),
school_id uuid NOT NULL,
name text NOT NULL,
description text,
created_at timestamp with time zone DEFAULT now(),
CONSTRAINT custom_roles_pkey PRIMARY KEY (id),
CONSTRAINT custom_roles_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id)
);
CREATE TABLE public.documents (
id uuid NOT NULL DEFAULT uuid_generate_v7(),
school_id uuid NOT NULL,
name text NOT NULL,
file_path text NOT NULL,
file_type text,
size_bytes bigint,
uploaded_by uuid,
entity_type text,
entity_id uuid,
created_at timestamp with time zone DEFAULT now(),
CONSTRAINT documents_pkey PRIMARY KEY (id),
CONSTRAINT documents_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id),
CONSTRAINT documents_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES public.profiles(id)
);
CREATE TABLE public.enrollments (
id uuid NOT NULL DEFAULT uuid_generate_v7(),
student_id uuid NOT NULL,
section_id uuid NOT NULL,
academic_year_id uuid NOT NULL,
roll_number text,
status text DEFAULT 'active'::text,
enrolled_at timestamp with time zone DEFAULT now(),
CONSTRAINT enrollments_pkey PRIMARY KEY (id),
CONSTRAINT enrollments_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id),
CONSTRAINT enrollments_section_id_fkey FOREIGN KEY (section_id) REFERENCES public.sections(id),
CONSTRAINT enrollments_academic_year_id_fkey FOREIGN KEY (academic_year_id) REFERENCES public.academic_years(id)
);
CREATE TABLE public.exams (
id uuid NOT NULL DEFAULT uuid_generate_v7(),
school_id uuid NOT NULL,
academic_year_id uuid NOT NULL,
term_id uuid,
name text NOT NULL,
start_date date,
end_date date,
is_published boolean DEFAULT false,
created_at timestamp with time zone DEFAULT now(),
CONSTRAINT exams_pkey PRIMARY KEY (id),
CONSTRAINT exams_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id),
CONSTRAINT exams_academic_year_id_fkey FOREIGN KEY (academic_year_id) REFERENCES public.academic_years(id),
CONSTRAINT exams_term_id_fkey FOREIGN KEY (term_id) REFERENCES public.terms(id)
);
CREATE TABLE public.grade_boundaries (
id uuid NOT NULL DEFAULT uuid_generate_v7(),
grading_scheme_id uuid NOT NULL,
grade text NOT NULL,
min_score numeric NOT NULL,
max_score numeric NOT NULL,
points numeric,
description text,
CONSTRAINT grade_boundaries_pkey PRIMARY KEY (id),
CONSTRAINT grade_boundaries_grading_scheme_id_fkey FOREIGN KEY (grading_scheme_id) REFERENCES public.grading_schemes(id)
);
CREATE TABLE public.grading_schemes (
id uuid NOT NULL DEFAULT uuid_generate_v7(),
school_id uuid NOT NULL,
name text NOT NULL,
created_at timestamp with time zone DEFAULT now(),
CONSTRAINT grading_schemes_pkey PRIMARY KEY (id),
CONSTRAINT grading_schemes_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id)
);
CREATE TABLE public.guardians (
id uuid NOT NULL DEFAULT uuid_generate_v7(),
school_id uuid NOT NULL,
user_id uuid,
first_name text NOT NULL,
last_name text NOT NULL,
email text,
phone text NOT NULL,
address jsonb,
created_at timestamp with time zone DEFAULT now(),
updated_at timestamp with time zone DEFAULT now(),
CONSTRAINT guardians_pkey PRIMARY KEY (id),
CONSTRAINT guardians_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id),
CONSTRAINT guardians_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.interventions (
id uuid NOT NULL DEFAULT uuid_generate_v7(),
student_id uuid NOT NULL,
title text NOT NULL,
description text,
start_date date,
end_date date,
status text DEFAULT 'active'::text,
created_at timestamp with time zone DEFAULT now(),
CONSTRAINT interventions_pkey PRIMARY KEY (id),
CONSTRAINT interventions_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id)
);
CREATE TABLE public.invoices (
id uuid NOT NULL DEFAULT uuid_generate_v7(),
school_id uuid NOT NULL,
amount numeric NOT NULL,
currency text DEFAULT 'USD'::text,
status text DEFAULT 'pending'::text,
created_at timestamp with time zone DEFAULT now(),
CONSTRAINT invoices_pkey PRIMARY KEY (id),
CONSTRAINT invoices_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id)
);
CREATE TABLE public.marks (
id uuid NOT NULL DEFAULT uuid_generate_v7(),
assessment_id uuid NOT NULL,
student_id uuid NOT NULL,
marks_obtained numeric,
grade_obtained text,
remarks text,
is_absent boolean DEFAULT false,
created_at timestamp with time zone DEFAULT now(),
updated_at timestamp with time zone DEFAULT now(),
CONSTRAINT marks_pkey PRIMARY KEY (id),
CONSTRAINT marks_assessment_id_fkey FOREIGN KEY (assessment_id) REFERENCES public.assessments(id),
CONSTRAINT marks_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id)
);
CREATE TABLE public.message_threads (
id uuid NOT NULL DEFAULT uuid_generate_v7(),
school_id uuid NOT NULL,
subject text,
type text DEFAULT 'direct'::text,
created_at timestamp with time zone DEFAULT now(),
updated_at timestamp with time zone DEFAULT now(),
CONSTRAINT message_threads_pkey PRIMARY KEY (id),
CONSTRAINT message_threads_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id)
);
CREATE TABLE public.messages (
id uuid NOT NULL DEFAULT uuid_generate_v7(),
thread_id uuid NOT NULL,
sender_id uuid NOT NULL,
content text NOT NULL,
created_at timestamp with time zone DEFAULT now(),
CONSTRAINT messages_pkey PRIMARY KEY (id),
CONSTRAINT messages_thread_id_fkey FOREIGN KEY (thread_id) REFERENCES public.message_threads(id),
CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.permissions (
id uuid NOT NULL DEFAULT uuid_generate_v7(),
code text NOT NULL UNIQUE,
description text,
module text NOT NULL,
CONSTRAINT permissions_pkey PRIMARY KEY (id)
);
CREATE TABLE public.plans (
id uuid NOT NULL DEFAULT uuid_generate_v7(),
name text NOT NULL,
code text NOT NULL UNIQUE,
price_monthly numeric,
price_yearly numeric,
features jsonb,
created_at timestamp with time zone DEFAULT now(),
CONSTRAINT plans_pkey PRIMARY KEY (id)
);
CREATE TABLE public.profiles (
id uuid NOT NULL,
email text NOT NULL UNIQUE,
first_name text NOT NULL,
last_name text NOT NULL,
avatar_url text,
phone_number text,
is_super_admin boolean DEFAULT false,
created_at timestamp with time zone DEFAULT now(),
updated_at timestamp with time zone DEFAULT now(),
school_id uuid,
role USER-DEFINED DEFAULT 'school_admin'::user_role,
is_suspended boolean DEFAULT false,
deleted_at timestamp with time zone,
CONSTRAINT profiles_pkey PRIMARY KEY (id),
CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id),
CONSTRAINT profiles_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id)
);
CREATE TABLE public.risk_flags (
id uuid NOT NULL DEFAULT uuid_generate_v7(),
student_id uuid NOT NULL,
type text NOT NULL,
severity text CHECK (severity = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text, 'critical'::text])),
description text,
is_resolved boolean DEFAULT false,
created_at timestamp with time zone DEFAULT now(),
resolved_at timestamp with time zone,
CONSTRAINT risk_flags_pkey PRIMARY KEY (id),
CONSTRAINT risk_flags_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id)
);
CREATE TABLE public.role_permissions (
role_id uuid NOT NULL,
permission_id uuid NOT NULL,
CONSTRAINT role_permissions_pkey PRIMARY KEY (role_id, permission_id),
CONSTRAINT role_permissions_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.custom_roles(id),
CONSTRAINT role_permissions_permission_id_fkey FOREIGN KEY (permission_id) REFERENCES public.permissions(id)
);
CREATE TABLE public.school_admins (
id uuid NOT NULL DEFAULT uuid_generate_v7(),
school_id uuid NOT NULL,
user_id uuid NOT NULL,
role text NOT NULL DEFAULT 'primary_admin'::text CHECK (role = ANY (ARRAY['primary_admin'::text, 'admin'::text])),
created_at timestamp with time zone NOT NULL DEFAULT now(),
specific_role USER-DEFINED,
CONSTRAINT school_admins_pkey PRIMARY KEY (id),
CONSTRAINT school_admins_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id),
CONSTRAINT school_admins_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.school_members (
id uuid NOT NULL DEFAULT uuid_generate_v7(),
user_id uuid NOT NULL,
school_id uuid NOT NULL,
role USER-DEFINED NOT NULL,
status USER-DEFINED DEFAULT 'active'::user_status,
joined_at timestamp with time zone DEFAULT now(),
CONSTRAINT school_members_pkey PRIMARY KEY (id),
CONSTRAINT school_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
CONSTRAINT school_members_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id)
);
CREATE TABLE public.schools (
id uuid NOT NULL DEFAULT uuid_generate_v7(),
name text NOT NULL,
slug text NOT NULL UNIQUE,
school_type USER-DEFINED DEFAULT 'k12'::school_type,
logo_url text,
website text,
contact_email text NOT NULL,
contact_phone text,
address jsonb,
subscription_status USER-DEFINED DEFAULT 'trial'::subscription_status,
settings jsonb DEFAULT '{}'::jsonb,
created_at timestamp with time zone DEFAULT now(),
updated_at timestamp with time zone DEFAULT now(),
deleted_at timestamp with time zone,
address_line1 text,
address_line2 text,
city text,
state text,
postal_code text,
country text DEFAULT 'India'::text,
phone text,
student_count_range USER-DEFINED,
onboarding_status USER-DEFINED DEFAULT 'pending'::onboarding_status,
domain text,
curriculum USER-DEFINED,
CONSTRAINT schools_pkey PRIMARY KEY (id)
);
CREATE TABLE public.section_subjects (
id uuid NOT NULL DEFAULT uuid_generate_v7(),
section_id uuid NOT NULL,
subject_id uuid NOT NULL,
teacher_id uuid,
created_at timestamp with time zone DEFAULT now(),
CONSTRAINT section_subjects_pkey PRIMARY KEY (id),
CONSTRAINT section_subjects_section_id_fkey FOREIGN KEY (section_id) REFERENCES public.sections(id),
CONSTRAINT section_subjects_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(id),
CONSTRAINT section_subjects_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.sections (
id uuid NOT NULL DEFAULT uuid_generate_v7(),
class_id uuid NOT NULL,
name text NOT NULL,
room_number text,
class_teacher_id uuid,
capacity integer DEFAULT 40,
created_at timestamp with time zone DEFAULT now(),
CONSTRAINT sections_pkey PRIMARY KEY (id),
CONSTRAINT sections_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id),
CONSTRAINT sections_class_teacher_id_fkey FOREIGN KEY (class_teacher_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.staff_invitations (
id uuid NOT NULL DEFAULT uuid_generate_v7(),
school_id uuid NOT NULL,
invited_by uuid NOT NULL,
email text NOT NULL,
status text NOT NULL DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'accepted'::text, 'expired'::text, 'cancelled'::text])),
invited_at timestamp with time zone NOT NULL DEFAULT now(),
expires_at timestamp with time zone NOT NULL DEFAULT (now() + '7 days'::interval),
accepted_at timestamp with time zone,
created_user_id uuid,
CONSTRAINT staff_invitations_pkey PRIMARY KEY (id),
CONSTRAINT staff_invitations_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id),
CONSTRAINT staff_invitations_invited_by_fkey FOREIGN KEY (invited_by) REFERENCES auth.users(id),
CONSTRAINT staff_invitations_created_user_id_fkey FOREIGN KEY (created_user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.student_guardians (
student_id uuid NOT NULL,
guardian_id uuid NOT NULL,
relationship USER-DEFINED NOT NULL,
is_primary boolean DEFAULT false,
is_emergency_contact boolean DEFAULT false,
CONSTRAINT student_guardians_pkey PRIMARY KEY (student_id, guardian_id),
CONSTRAINT student_guardians_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id),
CONSTRAINT student_guardians_guardian_id_fkey FOREIGN KEY (guardian_id) REFERENCES public.guardians(id)
);
CREATE TABLE public.student_performance_snapshots (
id uuid NOT NULL DEFAULT uuid_generate_v7(),
student_id uuid NOT NULL,
academic_year_id uuid NOT NULL,
term_id uuid,
average_score numeric,
attendance_percentage numeric,
risk_score integer,
calculated_at timestamp with time zone DEFAULT now(),
CONSTRAINT student_performance_snapshots_pkey PRIMARY KEY (id),
CONSTRAINT student_performance_snapshots_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id),
CONSTRAINT student_performance_snapshots_academic_year_id_fkey FOREIGN KEY (academic_year_id) REFERENCES public.academic_years(id),
CONSTRAINT student_performance_snapshots_term_id_fkey FOREIGN KEY (term_id) REFERENCES public.terms(id)
);
CREATE TABLE public.students (
id uuid NOT NULL DEFAULT uuid_generate_v7(),
school_id uuid NOT NULL,
user_id uuid,
admission_number text NOT NULL,
first_name text NOT NULL,
last_name text NOT NULL,
middle_name text,
date_of_birth date NOT NULL,
gender USER-DEFINED,
address jsonb,
profile_photo_url text,
medical_notes text,
is_active boolean DEFAULT true,
enrollment_date date DEFAULT CURRENT_DATE,
created_at timestamp with time zone DEFAULT now(),
updated_at timestamp with time zone DEFAULT now(),
CONSTRAINT students_pkey PRIMARY KEY (id),
CONSTRAINT students_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id),
CONSTRAINT students_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.subjects (
id uuid NOT NULL DEFAULT uuid_generate_v7(),
school_id uuid NOT NULL,
name character varying NOT NULL,
code character varying NOT NULL,
description text,
department text,
type text DEFAULT 'theory'::text,
created_at timestamp with time zone DEFAULT now(),
credit_hours numeric,
is_core boolean DEFAULT true,
grade_levels ARRAY NOT NULL DEFAULT '{}'::integer[],
updated_at timestamp with time zone DEFAULT now(),
CONSTRAINT subjects_pkey PRIMARY KEY (id),
CONSTRAINT subjects_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id)
);
CREATE TABLE public.subscriptions (
id uuid NOT NULL DEFAULT uuid_generate_v7(),
school_id uuid NOT NULL,
plan_id uuid NOT NULL,
status USER-DEFINED DEFAULT 'trial'::subscription_status,
current_period_start timestamp with time zone,
current_period_end timestamp with time zone,
cancel_at_period_end boolean DEFAULT false,
created_at timestamp with time zone DEFAULT now(),
updated_at timestamp with time zone DEFAULT now(),
CONSTRAINT subscriptions_pkey PRIMARY KEY (id),
CONSTRAINT subscriptions_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id),
CONSTRAINT subscriptions_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES public.plans(id)
);
CREATE TABLE public.teachers (
id uuid NOT NULL DEFAULT uuid_generate_v4(),
school_id uuid NOT NULL,
user_id uuid NOT NULL,
employee_id character varying NOT NULL,
subjects ARRAY DEFAULT '{}'::text[],
qualifications ARRAY DEFAULT '{}'::text[],
joining_date date NOT NULL DEFAULT CURRENT_DATE,
status character varying DEFAULT 'active'::character varying CHECK (status::text = ANY (ARRAY['active'::character varying, 'on_leave'::character varying, 'inactive'::character varying]::text[])),
created_at timestamp with time zone DEFAULT now(),
updated_at timestamp with time zone DEFAULT now(),
CONSTRAINT teachers_pkey PRIMARY KEY (id),
CONSTRAINT teachers_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id),
CONSTRAINT teachers_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.terms (
id uuid NOT NULL DEFAULT uuid_generate_v7(),
school_id uuid NOT NULL,
academic_year_id uuid NOT NULL,
name text NOT NULL,
start_date date NOT NULL,
end_date date NOT NULL,
created_at timestamp with time zone DEFAULT now(),
updated_at timestamp with time zone DEFAULT now(),
CONSTRAINT terms_pkey PRIMARY KEY (id),
CONSTRAINT terms_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id),
CONSTRAINT terms_academic_year_id_fkey FOREIGN KEY (academic_year_id) REFERENCES public.academic_years(id)
);
CREATE TABLE public.thread_participants (
thread_id uuid NOT NULL,
user_id uuid NOT NULL,
last_read_at timestamp with time zone,
CONSTRAINT thread_participants_pkey PRIMARY KEY (thread_id, user_id),
CONSTRAINT thread_participants_thread_id_fkey FOREIGN KEY (thread_id) REFERENCES public.message_threads(id),
CONSTRAINT thread_participants_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.users (
id uuid NOT NULL DEFAULT gen_random_uuid(),
email text NOT NULL UNIQUE,
password_hash text NOT NULL,
role USER-DEFINED NOT NULL DEFAULT 'school_admin'::user_role,
school_id uuid,
first_name text,
last_name text,
is_active boolean DEFAULT true,
last_login_at timestamp with time zone,
created_at timestamp with time zone DEFAULT now(),
updated_at timestamp with time zone DEFAULT now(),
CONSTRAINT users_pkey PRIMARY KEY (id),
CONSTRAINT users_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id)
);
