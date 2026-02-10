-- Create teachers table
-- This table stores teacher/staff records for the school management system

CREATE TABLE IF NOT EXISTS public.teachers (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL,
  user_id uuid NOT NULL,
  employee_id character varying NOT NULL,
  subjects text[] DEFAULT '{}',
  qualifications text[] DEFAULT '{}',
  joining_date date NOT NULL DEFAULT CURRENT_DATE,
  status character varying DEFAULT 'active' CHECK (status IN ('active', 'on_leave', 'inactive')),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  
  CONSTRAINT teachers_pkey PRIMARY KEY (id),
  CONSTRAINT teachers_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE CASCADE,
  CONSTRAINT teachers_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
  CONSTRAINT teachers_employee_id_school_unique UNIQUE (school_id, employee_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_teachers_school_id ON public.teachers(school_id);
CREATE INDEX IF NOT EXISTS idx_teachers_user_id ON public.teachers(user_id);
CREATE INDEX IF NOT EXISTS idx_teachers_employee_id ON public.teachers(employee_id);
CREATE INDEX IF NOT EXISTS idx_teachers_status ON public.teachers(status) WHERE status = 'active';

-- Enable Row Level Security
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;

-- RLS Policy: School admins can manage teachers from their school
CREATE POLICY select_teachers_school_admin ON public.teachers
  FOR SELECT
  USING (
    school_id IN (
      SELECT school_id FROM public.school_admins WHERE user_id = auth.uid()
    )
  );

CREATE POLICY insert_teachers_school_admin ON public.teachers
  FOR INSERT
  WITH CHECK (
    school_id IN (
      SELECT school_id FROM public.school_admins WHERE user_id = auth.uid()
    )
  );

CREATE POLICY update_teachers_school_admin ON public.teachers
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

CREATE POLICY delete_teachers_school_admin ON public.teachers
  FOR DELETE
  USING (
    school_id IN (
      SELECT school_id FROM public.school_admins WHERE user_id = auth.uid()
    )
  );

-- RLS Policy: Teachers can view their own record
CREATE POLICY select_teachers_self ON public.teachers
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY update_teachers_self ON public.teachers
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Add helpful comments
COMMENT ON TABLE public.teachers IS 'Stores teacher/staff information for schools';
COMMENT ON COLUMN public.teachers.employee_id IS 'Unique employee ID within the school';
COMMENT ON COLUMN public.teachers.subjects IS 'Array of subject IDs or names the teacher can teach';
COMMENT ON COLUMN public.teachers.qualifications IS 'Array of teacher qualifications and certifications';
COMMENT ON COLUMN public.teachers.status IS 'Employment status: active, on_leave, or inactive';
