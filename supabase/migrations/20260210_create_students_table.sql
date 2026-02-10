-- Create students table
-- This table stores student records for the school management system

CREATE TABLE IF NOT EXISTS public.students (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL,
  user_id uuid,
  admission_number text NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  middle_name text,
  date_of_birth date NOT NULL,
  gender text CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
  address jsonb,
  profile_photo_url text,
  medical_notes text,
  is_active boolean DEFAULT true,
  enrollment_date date DEFAULT CURRENT_DATE,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  
  CONSTRAINT students_pkey PRIMARY KEY (id),
  CONSTRAINT students_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE CASCADE,
  CONSTRAINT students_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE SET NULL,
  CONSTRAINT students_admission_number_school_unique UNIQUE (school_id, admission_number)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_students_school_id ON public.students(school_id);
CREATE INDEX IF NOT EXISTS idx_students_admission_number ON public.students(admission_number);
CREATE INDEX IF NOT EXISTS idx_students_user_id ON public.students(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_students_is_active ON public.students(is_active) WHERE is_active = true;

-- Enable Row Level Security
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- RLS Policy: School admins can manage students from their school
CREATE POLICY select_students_school_admin ON public.students
  FOR SELECT
  USING (
    school_id IN (
      SELECT school_id FROM public.school_admins WHERE user_id = auth.uid()
    )
  );

CREATE POLICY insert_students_school_admin ON public.students
  FOR INSERT
  WITH CHECK (
    school_id IN (
      SELECT school_id FROM public.school_admins WHERE user_id = auth.uid()
    )
  );

CREATE POLICY update_students_school_admin ON public.students
  FOR UPDATE
  USING (
    school_id IN (
      SELECT school_id FROM public.school_admins WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    school_id IN (
      SELECT school_id FROM public.school_admins WHERE user_id = auth.uid()
    )
  );

CREATE POLICY delete_students_school_admin ON public.students
  FOR DELETE
  USING (
    school_id IN (
      SELECT school_id FROM public.school_admins WHERE user_id = auth.uid()
    )
  );

-- RLS Policy: Students can view their own record (if linked to user account)
CREATE POLICY select_students_self ON public.students
  FOR SELECT
  USING (user_id = auth.uid());

-- Add helpful comments
COMMENT ON TABLE public.students IS 'Stores student information for schools';
COMMENT ON COLUMN public.students.admission_number IS 'Unique student admission/roll number within the school';
COMMENT ON COLUMN public.students.user_id IS 'Optional link to profiles table for student portal access';
COMMENT ON COLUMN public.students.medical_notes IS 'Important medical information for student safety';
COMMENT ON COLUMN public.students.address IS 'JSON structure for flexible address storage';
