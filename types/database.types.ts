export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      academic_years: {
        Row: {
          created_at: string | null
          end_date: string
          id: string
          is_active: boolean | null
          name: string
          school_id: string
          start_date: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          end_date: string
          id?: string
          is_active?: boolean | null
          name: string
          school_id: string
          start_date: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          end_date?: string
          id?: string
          is_active?: boolean | null
          name?: string
          school_id?: string
          start_date?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "academic_years_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      announcements: {
        Row: {
          author_id: string | null
          content: string
          created_at: string | null
          id: string
          is_published: boolean | null
          school_id: string
          target_roles: Database["public"]["Enums"]["user_role"][] | null
          title: string
        }
        Insert: {
          author_id?: string | null
          content: string
          created_at?: string | null
          id?: string
          is_published?: boolean | null
          school_id: string
          target_roles?: Database["public"]["Enums"]["user_role"][] | null
          title: string
        }
        Update: {
          author_id?: string | null
          content?: string
          created_at?: string | null
          id?: string
          is_published?: boolean | null
          school_id?: string
          target_roles?: Database["public"]["Enums"]["user_role"][] | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcements_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "announcements_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      assessments: {
        Row: {
          assess_date: string | null
          created_at: string | null
          exam_id: string | null
          grading_scheme_id: string | null
          id: string
          max_marks: number
          section_subject_id: string
          title: string
          weightage: number | null
        }
        Insert: {
          assess_date?: string | null
          created_at?: string | null
          exam_id?: string | null
          grading_scheme_id?: string | null
          id?: string
          max_marks?: number
          section_subject_id: string
          title: string
          weightage?: number | null
        }
        Update: {
          assess_date?: string | null
          created_at?: string | null
          exam_id?: string | null
          grading_scheme_id?: string | null
          id?: string
          max_marks?: number
          section_subject_id?: string
          title?: string
          weightage?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "assessments_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessments_grading_scheme_id_fkey"
            columns: ["grading_scheme_id"]
            isOneToOne: false
            referencedRelation: "grading_schemes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessments_section_subject_id_fkey"
            columns: ["section_subject_id"]
            isOneToOne: false
            referencedRelation: "section_subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      assignment_submissions: {
        Row: {
          assignment_id: string
          attachments: Json | null
          created_at: string
          feedback: string | null
          graded_at: string | null
          graded_by: string | null
          id: string
          resubmission_count: number | null
          score: number | null
          status: string
          student_id: string
          submission_text: string | null
          submitted_at: string | null
          updated_at: string
        }
        Insert: {
          assignment_id: string
          attachments?: Json | null
          created_at?: string
          feedback?: string | null
          graded_at?: string | null
          graded_by?: string | null
          id?: string
          resubmission_count?: number | null
          score?: number | null
          status?: string
          student_id: string
          submission_text?: string | null
          submitted_at?: string | null
          updated_at?: string
        }
        Update: {
          assignment_id?: string
          attachments?: Json | null
          created_at?: string
          feedback?: string | null
          graded_at?: string | null
          graded_by?: string | null
          id?: string
          resubmission_count?: number | null
          score?: number | null
          status?: string
          student_id?: string
          submission_text?: string | null
          submitted_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assignment_submissions_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "student_assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignment_submissions_graded_by_fkey"
            columns: ["graded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignment_submissions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance_records: {
        Row: {
          id: string
          register_id: string
          remarks: string | null
          status: string
          student_id: string
        }
        Insert: {
          id?: string
          register_id: string
          remarks?: string | null
          status: string
          student_id: string
        }
        Update: {
          id?: string
          register_id?: string
          remarks?: string | null
          status?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_records_register_id_fkey"
            columns: ["register_id"]
            isOneToOne: false
            referencedRelation: "attendance_registers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_records_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance_registers: {
        Row: {
          created_at: string | null
          date: string
          id: string
          section_id: string
          taken_by: string | null
        }
        Insert: {
          created_at?: string | null
          date: string
          id?: string
          section_id: string
          taken_by?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string
          id?: string
          section_id?: string
          taken_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attendance_registers_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_registers_taken_by_fkey"
            columns: ["taken_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          changed_by: string | null
          created_at: string | null
          id: string
          new_values: Json | null
          old_values: Json | null
          operation: string
          record_id: string | null
          school_id: string | null
          table_name: string
        }
        Insert: {
          changed_by?: string | null
          created_at?: string | null
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          operation: string
          record_id?: string | null
          school_id?: string | null
          table_name: string
        }
        Update: {
          changed_by?: string | null
          created_at?: string | null
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          operation?: string
          record_id?: string | null
          school_id?: string | null
          table_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      campuses: {
        Row: {
          address: Json | null
          created_at: string | null
          head_of_campus: string | null
          id: string
          name: string
          school_id: string
          updated_at: string | null
        }
        Insert: {
          address?: Json | null
          created_at?: string | null
          head_of_campus?: string | null
          id?: string
          name: string
          school_id: string
          updated_at?: string | null
        }
        Update: {
          address?: Json | null
          created_at?: string | null
          head_of_campus?: string | null
          id?: string
          name?: string
          school_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campuses_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      class_enrollments: {
        Row: {
          attendance_percentage: number | null
          class_id: string | null
          created_at: string
          enrollment_date: string
          grade: string | null
          id: string
          section_id: string | null
          status: string
          student_id: string
          updated_at: string
        }
        Insert: {
          attendance_percentage?: number | null
          class_id?: string | null
          created_at?: string
          enrollment_date?: string
          grade?: string | null
          id?: string
          section_id?: string | null
          status?: string
          student_id: string
          updated_at?: string
        }
        Update: {
          attendance_percentage?: number | null
          class_id?: string | null
          created_at?: string
          enrollment_date?: string
          grade?: string | null
          id?: string
          section_id?: string | null
          status?: string
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_enrollments_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_enrollments_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_enrollments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      class_schedule: {
        Row: {
          class_id: string
          created_at: string
          day_of_week: number
          effective_from: string | null
          effective_until: string | null
          end_time: string
          id: string
          is_recurring: boolean | null
          start_time: string
          subject_id: string | null
          teacher_id: string | null
          updated_at: string
          venue: string | null
        }
        Insert: {
          class_id: string
          created_at?: string
          day_of_week: number
          effective_from?: string | null
          effective_until?: string | null
          end_time: string
          id?: string
          is_recurring?: boolean | null
          start_time: string
          subject_id?: string | null
          teacher_id?: string | null
          updated_at?: string
          venue?: string | null
        }
        Update: {
          class_id?: string
          created_at?: string
          day_of_week?: number
          effective_from?: string | null
          effective_until?: string | null
          end_time?: string
          id?: string
          is_recurring?: boolean | null
          start_time?: string
          subject_id?: string | null
          teacher_id?: string | null
          updated_at?: string
          venue?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "class_schedule_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_schedule_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_schedule_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      class_subjects: {
        Row: {
          class_id: string
          created_at: string | null
          id: string
          periods_per_week: number | null
          subject_id: string
          teacher_id: string | null
        }
        Insert: {
          class_id: string
          created_at?: string | null
          id?: string
          periods_per_week?: number | null
          subject_id: string
          teacher_id?: string | null
        }
        Update: {
          class_id?: string
          created_at?: string | null
          id?: string
          periods_per_week?: number | null
          subject_id?: string
          teacher_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "class_subjects_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_subjects_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_subjects_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      classes: {
        Row: {
          academic_year: string | null
          capacity: number | null
          class_teacher_id: string | null
          created_at: string | null
          description: string | null
          grade_level: number | null
          id: string
          name: string
          room_number: string | null
          school_id: string
          section: string | null
          total_students: number | null
          updated_at: string | null
        }
        Insert: {
          academic_year?: string | null
          capacity?: number | null
          class_teacher_id?: string | null
          created_at?: string | null
          description?: string | null
          grade_level?: number | null
          id?: string
          name: string
          room_number?: string | null
          school_id: string
          section?: string | null
          total_students?: number | null
          updated_at?: string | null
        }
        Update: {
          academic_year?: string | null
          capacity?: number | null
          class_teacher_id?: string | null
          created_at?: string | null
          description?: string | null
          grade_level?: number | null
          id?: string
          name?: string
          room_number?: string | null
          school_id?: string
          section?: string | null
          total_students?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "classes_class_teacher_id_fkey"
            columns: ["class_teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "classes_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_roles: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          school_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          school_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          school_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "custom_roles_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          created_at: string | null
          entity_id: string | null
          entity_type: string | null
          file_path: string
          file_type: string | null
          id: string
          name: string
          school_id: string
          size_bytes: number | null
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          file_path: string
          file_type?: string | null
          id?: string
          name: string
          school_id: string
          size_bytes?: number | null
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          file_path?: string
          file_type?: string | null
          id?: string
          name?: string
          school_id?: string
          size_bytes?: number | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      enrollments: {
        Row: {
          academic_year_id: string
          enrolled_at: string | null
          id: string
          roll_number: string | null
          section_id: string
          status: string | null
          student_id: string
        }
        Insert: {
          academic_year_id: string
          enrolled_at?: string | null
          id?: string
          roll_number?: string | null
          section_id: string
          status?: string | null
          student_id: string
        }
        Update: {
          academic_year_id?: string
          enrolled_at?: string | null
          id?: string
          roll_number?: string | null
          section_id?: string
          status?: string | null
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_master: {
        Row: {
          academic_year_id: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          end_date: string | null
          exam_type_id: string | null
          grading_scheme_id: string | null
          id: string
          is_published: boolean | null
          metadata: Json | null
          name: string
          published_at: string | null
          published_by: string | null
          result_declaration_date: string | null
          school_id: string
          start_date: string | null
          status: string | null
          term_id: string | null
          updated_at: string | null
        }
        Insert: {
          academic_year_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          exam_type_id?: string | null
          grading_scheme_id?: string | null
          id?: string
          is_published?: boolean | null
          metadata?: Json | null
          name: string
          published_at?: string | null
          published_by?: string | null
          result_declaration_date?: string | null
          school_id: string
          start_date?: string | null
          status?: string | null
          term_id?: string | null
          updated_at?: string | null
        }
        Update: {
          academic_year_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          exam_type_id?: string | null
          grading_scheme_id?: string | null
          id?: string
          is_published?: boolean | null
          metadata?: Json | null
          name?: string
          published_at?: string | null
          published_by?: string | null
          result_declaration_date?: string | null
          school_id?: string
          start_date?: string | null
          status?: string | null
          term_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exam_master_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_master_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_master_exam_type_id_fkey"
            columns: ["exam_type_id"]
            isOneToOne: false
            referencedRelation: "exam_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_master_grading_scheme_id_fkey"
            columns: ["grading_scheme_id"]
            isOneToOne: false
            referencedRelation: "grading_schemes_new"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_master_published_by_fkey"
            columns: ["published_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_master_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_master_term_id_fkey"
            columns: ["term_id"]
            isOneToOne: false
            referencedRelation: "terms"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_papers: {
        Row: {
          class_id: string | null
          created_at: string | null
          duration_minutes: number | null
          end_time: string
          exam_date: string
          exam_id: string
          id: string
          instructions: string | null
          invigilator_id: string | null
          max_marks: number
          paper_code: string | null
          paper_name: string | null
          paper_pattern: Json | null
          passing_marks: number | null
          room_id: string | null
          section_id: string | null
          start_time: string
          status: string | null
          subject_id: string
          updated_at: string | null
        }
        Insert: {
          class_id?: string | null
          created_at?: string | null
          duration_minutes?: number | null
          end_time: string
          exam_date: string
          exam_id: string
          id?: string
          instructions?: string | null
          invigilator_id?: string | null
          max_marks?: number
          paper_code?: string | null
          paper_name?: string | null
          paper_pattern?: Json | null
          passing_marks?: number | null
          room_id?: string | null
          section_id?: string | null
          start_time: string
          status?: string | null
          subject_id: string
          updated_at?: string | null
        }
        Update: {
          class_id?: string | null
          created_at?: string | null
          duration_minutes?: number | null
          end_time?: string
          exam_date?: string
          exam_id?: string
          id?: string
          instructions?: string | null
          invigilator_id?: string | null
          max_marks?: number
          paper_code?: string | null
          paper_name?: string | null
          paper_pattern?: Json | null
          passing_marks?: number | null
          room_id?: string | null
          section_id?: string | null
          start_time?: string
          status?: string | null
          subject_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exam_papers_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_papers_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exam_master"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_papers_invigilator_id_fkey"
            columns: ["invigilator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_papers_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_papers_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_papers_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_types: {
        Row: {
          code: string | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          school_id: string
          weightage: number | null
        }
        Insert: {
          code?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          school_id: string
          weightage?: number | null
        }
        Update: {
          code?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          school_id?: string
          weightage?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "exam_types_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      exams: {
        Row: {
          academic_year_id: string
          created_at: string | null
          end_date: string | null
          id: string
          is_published: boolean | null
          name: string
          school_id: string
          start_date: string | null
          term_id: string | null
        }
        Insert: {
          academic_year_id: string
          created_at?: string | null
          end_date?: string | null
          id?: string
          is_published?: boolean | null
          name: string
          school_id: string
          start_date?: string | null
          term_id?: string | null
        }
        Update: {
          academic_year_id?: string
          created_at?: string | null
          end_date?: string | null
          id?: string
          is_published?: boolean | null
          name?: string
          school_id?: string
          start_date?: string | null
          term_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exams_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exams_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exams_term_id_fkey"
            columns: ["term_id"]
            isOneToOne: false
            referencedRelation: "terms"
            referencedColumns: ["id"]
          },
        ]
      }
      grade_boundaries: {
        Row: {
          description: string | null
          grade: string
          grading_scheme_id: string
          id: string
          max_score: number
          min_score: number
          points: number | null
        }
        Insert: {
          description?: string | null
          grade: string
          grading_scheme_id: string
          id?: string
          max_score: number
          min_score: number
          points?: number | null
        }
        Update: {
          description?: string | null
          grade?: string
          grading_scheme_id?: string
          id?: string
          max_score?: number
          min_score?: number
          points?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "grade_boundaries_grading_scheme_id_fkey"
            columns: ["grading_scheme_id"]
            isOneToOne: false
            referencedRelation: "grading_schemes"
            referencedColumns: ["id"]
          },
        ]
      }
      grade_boundaries_new: {
        Row: {
          description: string | null
          display_order: number | null
          grade: string
          grade_point: number | null
          grading_scheme_id: string
          id: string
          max_percentage: number
          min_percentage: number
        }
        Insert: {
          description?: string | null
          display_order?: number | null
          grade: string
          grade_point?: number | null
          grading_scheme_id: string
          id?: string
          max_percentage: number
          min_percentage: number
        }
        Update: {
          description?: string | null
          display_order?: number | null
          grade?: string
          grade_point?: number | null
          grading_scheme_id?: string
          id?: string
          max_percentage?: number
          min_percentage?: number
        }
        Relationships: [
          {
            foreignKeyName: "grade_boundaries_new_grading_scheme_id_fkey"
            columns: ["grading_scheme_id"]
            isOneToOne: false
            referencedRelation: "grading_schemes_new"
            referencedColumns: ["id"]
          },
        ]
      }
      grading_schemes: {
        Row: {
          created_at: string | null
          id: string
          name: string
          school_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          school_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          school_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "grading_schemes_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      grading_schemes_new: {
        Row: {
          created_at: string | null
          description: string | null
          grading_type: string | null
          id: string
          is_active: boolean | null
          is_default: boolean | null
          name: string
          school_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          grading_type?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          name: string
          school_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          grading_type?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          name?: string
          school_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "grading_schemes_new_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      guardians: {
        Row: {
          address: Json | null
          created_at: string | null
          email: string | null
          first_name: string
          id: string
          last_name: string
          phone: string
          school_id: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          address?: Json | null
          created_at?: string | null
          email?: string | null
          first_name: string
          id?: string
          last_name: string
          phone: string
          school_id: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          address?: Json | null
          created_at?: string | null
          email?: string | null
          first_name?: string
          id?: string
          last_name?: string
          phone?: string
          school_id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "guardians_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guardians_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      interventions: {
        Row: {
          created_at: string | null
          description: string | null
          end_date: string | null
          id: string
          start_date: string | null
          status: string | null
          student_id: string
          title: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          start_date?: string | null
          status?: string | null
          student_id: string
          title: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          start_date?: string | null
          status?: string | null
          student_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "interventions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount: number
          created_at: string | null
          currency: string | null
          id: string
          school_id: string
          status: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string | null
          id?: string
          school_id: string
          status?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string | null
          id?: string
          school_id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_resources: {
        Row: {
          class_id: string | null
          created_at: string
          description: string | null
          download_count: number | null
          file_size_bytes: number | null
          file_url: string | null
          id: string
          is_public: boolean | null
          resource_type: string
          subject_id: string | null
          tags: string[] | null
          thumbnail_url: string | null
          title: string
          updated_at: string
          uploaded_by: string | null
          view_count: number | null
        }
        Insert: {
          class_id?: string | null
          created_at?: string
          description?: string | null
          download_count?: number | null
          file_size_bytes?: number | null
          file_url?: string | null
          id?: string
          is_public?: boolean | null
          resource_type: string
          subject_id?: string | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          uploaded_by?: string | null
          view_count?: number | null
        }
        Update: {
          class_id?: string | null
          created_at?: string
          description?: string | null
          download_count?: number | null
          file_size_bytes?: number | null
          file_url?: string | null
          id?: string
          is_public?: boolean | null
          resource_type?: string
          subject_id?: string | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          uploaded_by?: string | null
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "learning_resources_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learning_resources_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learning_resources_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      marks: {
        Row: {
          assessment_id: string
          created_at: string | null
          grade_obtained: string | null
          id: string
          is_absent: boolean | null
          marks_obtained: number | null
          remarks: string | null
          student_id: string
          updated_at: string | null
        }
        Insert: {
          assessment_id: string
          created_at?: string | null
          grade_obtained?: string | null
          id?: string
          is_absent?: boolean | null
          marks_obtained?: number | null
          remarks?: string | null
          student_id: string
          updated_at?: string | null
        }
        Update: {
          assessment_id?: string
          created_at?: string | null
          grade_obtained?: string | null
          id?: string
          is_absent?: boolean | null
          marks_obtained?: number | null
          remarks?: string | null
          student_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "marks_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marks_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      marks_history: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          change_reason: string | null
          change_type: string | null
          changed_at: string | null
          changed_by: string | null
          id: string
          new_grade: string | null
          new_marks: number | null
          old_grade: string | null
          old_marks: number | null
          student_mark_id: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          change_reason?: string | null
          change_type?: string | null
          changed_at?: string | null
          changed_by?: string | null
          id?: string
          new_grade?: string | null
          new_marks?: number | null
          old_grade?: string | null
          old_marks?: number | null
          student_mark_id: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          change_reason?: string | null
          change_type?: string | null
          changed_at?: string | null
          changed_by?: string | null
          id?: string
          new_grade?: string | null
          new_marks?: number | null
          old_grade?: string | null
          old_marks?: number | null
          student_mark_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "marks_history_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marks_history_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marks_history_student_mark_id_fkey"
            columns: ["student_mark_id"]
            isOneToOne: false
            referencedRelation: "student_marks"
            referencedColumns: ["id"]
          },
        ]
      }
      message_threads: {
        Row: {
          created_at: string | null
          id: string
          school_id: string
          subject: string | null
          type: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          school_id: string
          subject?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          school_id?: string
          subject?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "message_threads_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          sender_id: string
          thread_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          sender_id: string
          thread_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          sender_id?: string
          thread_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "message_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      moderation_requests: {
        Row: {
          comments: string | null
          created_at: string | null
          exam_paper_id: string
          id: string
          marks_entered: number | null
          moderator_comments: string | null
          moderator_id: string | null
          reviewed_at: string | null
          status: string | null
          submitted_at: string | null
          submitted_by: string
          total_students: number | null
          updated_at: string | null
        }
        Insert: {
          comments?: string | null
          created_at?: string | null
          exam_paper_id: string
          id?: string
          marks_entered?: number | null
          moderator_comments?: string | null
          moderator_id?: string | null
          reviewed_at?: string | null
          status?: string | null
          submitted_at?: string | null
          submitted_by: string
          total_students?: number | null
          updated_at?: string | null
        }
        Update: {
          comments?: string | null
          created_at?: string | null
          exam_paper_id?: string
          id?: string
          marks_entered?: number | null
          moderator_comments?: string | null
          moderator_id?: string | null
          reviewed_at?: string | null
          status?: string | null
          submitted_at?: string | null
          submitted_by?: string
          total_students?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "moderation_requests_exam_paper_id_fkey"
            columns: ["exam_paper_id"]
            isOneToOne: false
            referencedRelation: "exam_papers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "moderation_requests_moderator_id_fkey"
            columns: ["moderator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "moderation_requests_submitted_by_fkey"
            columns: ["submitted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      performance_trends: {
        Row: {
          academic_year_id: string | null
          created_at: string | null
          exam_sequence: number | null
          grade: string | null
          id: string
          marks_obtained: number | null
          percentage: number | null
          rank: number | null
          student_id: string
          subject_id: string | null
          trend: string | null
        }
        Insert: {
          academic_year_id?: string | null
          created_at?: string | null
          exam_sequence?: number | null
          grade?: string | null
          id?: string
          marks_obtained?: number | null
          percentage?: number | null
          rank?: number | null
          student_id: string
          subject_id?: string | null
          trend?: string | null
        }
        Update: {
          academic_year_id?: string | null
          created_at?: string | null
          exam_sequence?: number | null
          grade?: string | null
          id?: string
          marks_obtained?: number | null
          percentage?: number | null
          rank?: number | null
          student_id?: string
          subject_id?: string | null
          trend?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "performance_trends_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "performance_trends_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "performance_trends_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      periods: {
        Row: {
          created_at: string | null
          duration_minutes: number | null
          end_time: string
          id: string
          is_active: boolean | null
          is_break: boolean | null
          name: string
          period_number: number | null
          school_id: string
          start_time: string
        }
        Insert: {
          created_at?: string | null
          duration_minutes?: number | null
          end_time: string
          id?: string
          is_active?: boolean | null
          is_break?: boolean | null
          name: string
          period_number?: number | null
          school_id: string
          start_time: string
        }
        Update: {
          created_at?: string | null
          duration_minutes?: number | null
          end_time?: string
          id?: string
          is_active?: boolean | null
          is_break?: boolean | null
          name?: string
          period_number?: number | null
          school_id?: string
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "periods_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      permissions: {
        Row: {
          code: string
          description: string | null
          id: string
          module: string
        }
        Insert: {
          code: string
          description?: string | null
          id?: string
          module: string
        }
        Update: {
          code?: string
          description?: string | null
          id?: string
          module?: string
        }
        Relationships: []
      }
      plans: {
        Row: {
          code: string
          created_at: string | null
          features: Json | null
          id: string
          name: string
          price_monthly: number | null
          price_yearly: number | null
        }
        Insert: {
          code: string
          created_at?: string | null
          features?: Json | null
          id?: string
          name: string
          price_monthly?: number | null
          price_yearly?: number | null
        }
        Update: {
          code?: string
          created_at?: string | null
          features?: Json | null
          id?: string
          name?: string
          price_monthly?: number | null
          price_yearly?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          deleted_at: string | null
          email: string
          first_name: string
          id: string
          is_super_admin: boolean | null
          is_suspended: boolean | null
          last_name: string
          phone_number: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          school_id: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          deleted_at?: string | null
          email: string
          first_name: string
          id: string
          is_super_admin?: boolean | null
          is_suspended?: boolean | null
          last_name: string
          phone_number?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          school_id?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          deleted_at?: string | null
          email?: string
          first_name?: string
          id?: string
          is_super_admin?: boolean | null
          is_suspended?: boolean | null
          last_name?: string
          phone_number?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          school_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      reevaluation_requests: {
        Row: {
          completed_at: string | null
          created_at: string | null
          evaluator_id: string | null
          evaluator_remarks: string | null
          fee_paid: number | null
          id: string
          marks_changed: boolean | null
          original_marks: number | null
          reason: string
          request_date: string
          requested_by: string | null
          revised_marks: number | null
          status: string | null
          student_mark_id: string
          updated_at: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          evaluator_id?: string | null
          evaluator_remarks?: string | null
          fee_paid?: number | null
          id?: string
          marks_changed?: boolean | null
          original_marks?: number | null
          reason: string
          request_date?: string
          requested_by?: string | null
          revised_marks?: number | null
          status?: string | null
          student_mark_id: string
          updated_at?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          evaluator_id?: string | null
          evaluator_remarks?: string | null
          fee_paid?: number | null
          id?: string
          marks_changed?: boolean | null
          original_marks?: number | null
          reason?: string
          request_date?: string
          requested_by?: string | null
          revised_marks?: number | null
          status?: string | null
          student_mark_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reevaluation_requests_evaluator_id_fkey"
            columns: ["evaluator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reevaluation_requests_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reevaluation_requests_student_mark_id_fkey"
            columns: ["student_mark_id"]
            isOneToOne: false
            referencedRelation: "student_marks"
            referencedColumns: ["id"]
          },
        ]
      }
      report_cards: {
        Row: {
          created_at: string | null
          download_count: number | null
          file_size_bytes: number | null
          generated_at: string | null
          generated_by: string | null
          id: string
          is_sent_to_parent: boolean | null
          last_downloaded_at: string | null
          metadata: Json | null
          pdf_url: string | null
          sent_at: string | null
          status: string | null
          student_result_id: string
          template_id: string | null
        }
        Insert: {
          created_at?: string | null
          download_count?: number | null
          file_size_bytes?: number | null
          generated_at?: string | null
          generated_by?: string | null
          id?: string
          is_sent_to_parent?: boolean | null
          last_downloaded_at?: string | null
          metadata?: Json | null
          pdf_url?: string | null
          sent_at?: string | null
          status?: string | null
          student_result_id: string
          template_id?: string | null
        }
        Update: {
          created_at?: string | null
          download_count?: number | null
          file_size_bytes?: number | null
          generated_at?: string | null
          generated_by?: string | null
          id?: string
          is_sent_to_parent?: boolean | null
          last_downloaded_at?: string | null
          metadata?: Json | null
          pdf_url?: string | null
          sent_at?: string | null
          status?: string | null
          student_result_id?: string
          template_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "report_cards_generated_by_fkey"
            columns: ["generated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "report_cards_student_result_id_fkey"
            columns: ["student_result_id"]
            isOneToOne: false
            referencedRelation: "student_results"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "report_cards_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "report_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      report_templates: {
        Row: {
          created_at: string | null
          created_by: string | null
          css_styles: string | null
          footer_html: string | null
          header_html: string | null
          id: string
          include_attendance: boolean | null
          include_graph: boolean | null
          include_photo: boolean | null
          include_ranking: boolean | null
          include_remarks: boolean | null
          is_active: boolean | null
          is_default: boolean | null
          layout_config: Json
          name: string
          school_id: string
          template_type: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          css_styles?: string | null
          footer_html?: string | null
          header_html?: string | null
          id?: string
          include_attendance?: boolean | null
          include_graph?: boolean | null
          include_photo?: boolean | null
          include_ranking?: boolean | null
          include_remarks?: boolean | null
          is_active?: boolean | null
          is_default?: boolean | null
          layout_config: Json
          name: string
          school_id: string
          template_type?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          css_styles?: string | null
          footer_html?: string | null
          header_html?: string | null
          id?: string
          include_attendance?: boolean | null
          include_graph?: boolean | null
          include_photo?: boolean | null
          include_ranking?: boolean | null
          include_remarks?: boolean | null
          is_active?: boolean | null
          is_default?: boolean | null
          layout_config?: Json
          name?: string
          school_id?: string
          template_type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "report_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "report_templates_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      resource_bookmarks: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          resource_id: string
          student_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          resource_id: string
          student_id: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          resource_id?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "resource_bookmarks_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "learning_resources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resource_bookmarks_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      result_analytics: {
        Row: {
          analytics_type: string
          average_marks: number | null
          calculated_at: string | null
          class_id: string | null
          created_at: string | null
          exam_id: string
          grade_distribution: Json | null
          highest_marks: number | null
          id: string
          lowest_marks: number | null
          median_marks: number | null
          pass_percentage: number | null
          performance_bands: Json | null
          section_id: string | null
          std_deviation: number | null
          students_absent: number | null
          students_appeared: number | null
          students_failed: number | null
          students_passed: number | null
          subject_id: string | null
          total_students: number | null
        }
        Insert: {
          analytics_type: string
          average_marks?: number | null
          calculated_at?: string | null
          class_id?: string | null
          created_at?: string | null
          exam_id: string
          grade_distribution?: Json | null
          highest_marks?: number | null
          id?: string
          lowest_marks?: number | null
          median_marks?: number | null
          pass_percentage?: number | null
          performance_bands?: Json | null
          section_id?: string | null
          std_deviation?: number | null
          students_absent?: number | null
          students_appeared?: number | null
          students_failed?: number | null
          students_passed?: number | null
          subject_id?: string | null
          total_students?: number | null
        }
        Update: {
          analytics_type?: string
          average_marks?: number | null
          calculated_at?: string | null
          class_id?: string | null
          created_at?: string | null
          exam_id?: string
          grade_distribution?: Json | null
          highest_marks?: number | null
          id?: string
          lowest_marks?: number | null
          median_marks?: number | null
          pass_percentage?: number | null
          performance_bands?: Json | null
          section_id?: string | null
          std_deviation?: number | null
          students_absent?: number | null
          students_appeared?: number | null
          students_failed?: number | null
          students_passed?: number | null
          subject_id?: string | null
          total_students?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "result_analytics_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "result_analytics_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exam_master"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "result_analytics_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "result_analytics_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      result_comparisons: {
        Row: {
          class_average: number | null
          created_at: string | null
          difference: number | null
          id: string
          position_relative_to_average: string | null
          student_percentage: number | null
          student_result_id: string
          subject_id: string | null
        }
        Insert: {
          class_average?: number | null
          created_at?: string | null
          difference?: number | null
          id?: string
          position_relative_to_average?: string | null
          student_percentage?: number | null
          student_result_id: string
          subject_id?: string | null
        }
        Update: {
          class_average?: number | null
          created_at?: string | null
          difference?: number | null
          id?: string
          position_relative_to_average?: string | null
          student_percentage?: number | null
          student_result_id?: string
          subject_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "result_comparisons_student_result_id_fkey"
            columns: ["student_result_id"]
            isOneToOne: false
            referencedRelation: "student_results"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "result_comparisons_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      result_items: {
        Row: {
          created_at: string | null
          grade: string | null
          grade_points: number | null
          id: string
          internal_marks: number | null
          is_absent: boolean | null
          is_passed: boolean | null
          marks_obtained: number | null
          max_marks: number | null
          percentage: number | null
          practical_marks: number | null
          remarks: string | null
          student_mark_id: string | null
          student_result_id: string
          subject_id: string
          theory_marks: number | null
        }
        Insert: {
          created_at?: string | null
          grade?: string | null
          grade_points?: number | null
          id?: string
          internal_marks?: number | null
          is_absent?: boolean | null
          is_passed?: boolean | null
          marks_obtained?: number | null
          max_marks?: number | null
          percentage?: number | null
          practical_marks?: number | null
          remarks?: string | null
          student_mark_id?: string | null
          student_result_id: string
          subject_id: string
          theory_marks?: number | null
        }
        Update: {
          created_at?: string | null
          grade?: string | null
          grade_points?: number | null
          id?: string
          internal_marks?: number | null
          is_absent?: boolean | null
          is_passed?: boolean | null
          marks_obtained?: number | null
          max_marks?: number | null
          percentage?: number | null
          practical_marks?: number | null
          remarks?: string | null
          student_mark_id?: string | null
          student_result_id?: string
          subject_id?: string
          theory_marks?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "result_items_student_mark_id_fkey"
            columns: ["student_mark_id"]
            isOneToOne: false
            referencedRelation: "student_marks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "result_items_student_result_id_fkey"
            columns: ["student_result_id"]
            isOneToOne: false
            referencedRelation: "student_results"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "result_items_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      result_publications: {
        Row: {
          access_code: string | null
          class_id: string | null
          created_at: string | null
          exam_id: string
          id: string
          is_published: boolean | null
          notification_sent_at: string | null
          notify_parents: boolean | null
          notify_students: boolean | null
          publication_date: string
          published_at: string | null
          published_by: string | null
          remarks: string | null
          section_id: string | null
        }
        Insert: {
          access_code?: string | null
          class_id?: string | null
          created_at?: string | null
          exam_id: string
          id?: string
          is_published?: boolean | null
          notification_sent_at?: string | null
          notify_parents?: boolean | null
          notify_students?: boolean | null
          publication_date: string
          published_at?: string | null
          published_by?: string | null
          remarks?: string | null
          section_id?: string | null
        }
        Update: {
          access_code?: string | null
          class_id?: string | null
          created_at?: string | null
          exam_id?: string
          id?: string
          is_published?: boolean | null
          notification_sent_at?: string | null
          notify_parents?: boolean | null
          notify_students?: boolean | null
          publication_date?: string
          published_at?: string | null
          published_by?: string | null
          remarks?: string | null
          section_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "result_publications_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "result_publications_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exam_master"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "result_publications_published_by_fkey"
            columns: ["published_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "result_publications_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
        ]
      }
      risk_flags: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_resolved: boolean | null
          resolved_at: string | null
          severity: string | null
          student_id: string
          type: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_resolved?: boolean | null
          resolved_at?: string | null
          severity?: string | null
          student_id: string
          type: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_resolved?: boolean | null
          resolved_at?: string | null
          severity?: string | null
          student_id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "risk_flags_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          permission_id: string
          role_id: string
        }
        Insert: {
          permission_id: string
          role_id: string
        }
        Update: {
          permission_id?: string
          role_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_permissions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "custom_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      rooms: {
        Row: {
          building: string | null
          capacity: number | null
          created_at: string | null
          facilities: string[] | null
          id: string
          is_available: boolean | null
          name: string
          room_number: string | null
          room_type: string | null
          school_id: string
          updated_at: string | null
        }
        Insert: {
          building?: string | null
          capacity?: number | null
          created_at?: string | null
          facilities?: string[] | null
          id?: string
          is_available?: boolean | null
          name: string
          room_number?: string | null
          room_type?: string | null
          school_id: string
          updated_at?: string | null
        }
        Update: {
          building?: string | null
          capacity?: number | null
          created_at?: string | null
          facilities?: string[] | null
          id?: string
          is_available?: boolean | null
          name?: string
          room_number?: string | null
          room_type?: string | null
          school_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rooms_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      school_admins: {
        Row: {
          created_at: string
          id: string
          role: string
          school_id: string
          specific_role: Database["public"]["Enums"]["admin_role_type"] | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: string
          school_id: string
          specific_role?: Database["public"]["Enums"]["admin_role_type"] | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: string
          school_id?: string
          specific_role?: Database["public"]["Enums"]["admin_role_type"] | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "school_admins_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      school_events: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          end_date: string | null
          event_type: string
          id: string
          is_all_day: boolean | null
          location: string | null
          school_id: string
          start_date: string
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          event_type: string
          id?: string
          is_all_day?: boolean | null
          location?: string | null
          school_id: string
          start_date: string
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          event_type?: string
          id?: string
          is_all_day?: boolean | null
          location?: string | null
          school_id?: string
          start_date?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "school_events_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      school_members: {
        Row: {
          id: string
          joined_at: string | null
          role: Database["public"]["Enums"]["user_role"]
          school_id: string
          status: Database["public"]["Enums"]["user_status"] | null
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string | null
          role: Database["public"]["Enums"]["user_role"]
          school_id: string
          status?: Database["public"]["Enums"]["user_status"] | null
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          school_id?: string
          status?: Database["public"]["Enums"]["user_status"] | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "school_members_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "school_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      schools: {
        Row: {
          address: Json | null
          address_line1: string | null
          address_line2: string | null
          city: string | null
          contact_email: string
          contact_phone: string | null
          country: string | null
          created_at: string | null
          curriculum: Database["public"]["Enums"]["curriculum_type"] | null
          deleted_at: string | null
          domain: string | null
          id: string
          logo_url: string | null
          name: string
          onboarding_status:
            | Database["public"]["Enums"]["onboarding_status"]
            | null
          phone: string | null
          postal_code: string | null
          school_type: Database["public"]["Enums"]["school_type"] | null
          settings: Json | null
          slug: string
          state: string | null
          student_count_range:
            | Database["public"]["Enums"]["student_count_range"]
            | null
          subscription_status:
            | Database["public"]["Enums"]["subscription_status"]
            | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          address?: Json | null
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          contact_email: string
          contact_phone?: string | null
          country?: string | null
          created_at?: string | null
          curriculum?: Database["public"]["Enums"]["curriculum_type"] | null
          deleted_at?: string | null
          domain?: string | null
          id?: string
          logo_url?: string | null
          name: string
          onboarding_status?:
            | Database["public"]["Enums"]["onboarding_status"]
            | null
          phone?: string | null
          postal_code?: string | null
          school_type?: Database["public"]["Enums"]["school_type"] | null
          settings?: Json | null
          slug: string
          state?: string | null
          student_count_range?:
            | Database["public"]["Enums"]["student_count_range"]
            | null
          subscription_status?:
            | Database["public"]["Enums"]["subscription_status"]
            | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          address?: Json | null
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          contact_email?: string
          contact_phone?: string | null
          country?: string | null
          created_at?: string | null
          curriculum?: Database["public"]["Enums"]["curriculum_type"] | null
          deleted_at?: string | null
          domain?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          onboarding_status?:
            | Database["public"]["Enums"]["onboarding_status"]
            | null
          phone?: string | null
          postal_code?: string | null
          school_type?: Database["public"]["Enums"]["school_type"] | null
          settings?: Json | null
          slug?: string
          state?: string | null
          student_count_range?:
            | Database["public"]["Enums"]["student_count_range"]
            | null
          subscription_status?:
            | Database["public"]["Enums"]["subscription_status"]
            | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      section_subjects: {
        Row: {
          created_at: string | null
          id: string
          section_id: string
          subject_id: string
          teacher_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          section_id: string
          subject_id: string
          teacher_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          section_id?: string
          subject_id?: string
          teacher_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "section_subjects_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "section_subjects_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "section_subjects_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      sections: {
        Row: {
          capacity: number | null
          class_id: string
          class_teacher_id: string | null
          created_at: string | null
          id: string
          name: string
          room_number: string | null
        }
        Insert: {
          capacity?: number | null
          class_id: string
          class_teacher_id?: string | null
          created_at?: string | null
          id?: string
          name: string
          room_number?: string | null
        }
        Update: {
          capacity?: number | null
          class_id?: string
          class_teacher_id?: string | null
          created_at?: string | null
          id?: string
          name?: string
          room_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sections_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sections_class_teacher_id_fkey"
            columns: ["class_teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_invitations: {
        Row: {
          accepted_at: string | null
          created_user_id: string | null
          email: string
          expires_at: string
          id: string
          invited_at: string
          invited_by: string
          school_id: string
          status: string
        }
        Insert: {
          accepted_at?: string | null
          created_user_id?: string | null
          email: string
          expires_at?: string
          id?: string
          invited_at?: string
          invited_by: string
          school_id: string
          status?: string
        }
        Update: {
          accepted_at?: string | null
          created_user_id?: string | null
          email?: string
          expires_at?: string
          id?: string
          invited_at?: string
          invited_by?: string
          school_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_invitations_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      student_assignments: {
        Row: {
          assignment_type: string
          attachments: Json | null
          class_id: string | null
          created_at: string
          description: string | null
          due_date: string
          id: string
          instructions: string | null
          max_points: number
          status: string
          subject_id: string | null
          teacher_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          assignment_type: string
          attachments?: Json | null
          class_id?: string | null
          created_at?: string
          description?: string | null
          due_date: string
          id?: string
          instructions?: string | null
          max_points?: number
          status?: string
          subject_id?: string | null
          teacher_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          assignment_type?: string
          attachments?: Json | null
          class_id?: string | null
          created_at?: string
          description?: string | null
          due_date?: string
          id?: string
          instructions?: string | null
          max_points?: number
          status?: string
          subject_id?: string | null
          teacher_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_assignments_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_assignments_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_assignments_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      student_attendance: {
        Row: {
          class_id: string | null
          created_at: string
          date: string
          id: string
          marked_by: string | null
          remarks: string | null
          status: string
          student_id: string
          updated_at: string
        }
        Insert: {
          class_id?: string | null
          created_at?: string
          date: string
          id?: string
          marked_by?: string | null
          remarks?: string | null
          status: string
          student_id: string
          updated_at?: string
        }
        Update: {
          class_id?: string | null
          created_at?: string
          date?: string
          id?: string
          marked_by?: string | null
          remarks?: string | null
          status?: string
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_attendance_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_attendance_marked_by_fkey"
            columns: ["marked_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_attendance_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      student_exam_results: {
        Row: {
          created_at: string
          exam_id: string
          grade: string | null
          id: string
          is_absent: boolean | null
          marks_obtained: number
          percentage: number | null
          rank: number | null
          remarks: string | null
          student_id: string
          total_marks: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          exam_id: string
          grade?: string | null
          id?: string
          is_absent?: boolean | null
          marks_obtained: number
          percentage?: number | null
          rank?: number | null
          remarks?: string | null
          student_id: string
          total_marks: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          exam_id?: string
          grade?: string | null
          id?: string
          is_absent?: boolean | null
          marks_obtained?: number
          percentage?: number | null
          rank?: number | null
          remarks?: string | null
          student_id?: string
          total_marks?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_exam_results_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "student_exams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_exam_results_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      student_exams: {
        Row: {
          class_id: string | null
          created_at: string
          description: string | null
          duration_minutes: number
          exam_date: string
          exam_type: string
          id: string
          instructions: string | null
          status: string
          subject_id: string | null
          syllabus: string[] | null
          title: string
          total_marks: number
          updated_at: string
          venue: string | null
        }
        Insert: {
          class_id?: string | null
          created_at?: string
          description?: string | null
          duration_minutes?: number
          exam_date: string
          exam_type: string
          id?: string
          instructions?: string | null
          status?: string
          subject_id?: string | null
          syllabus?: string[] | null
          title: string
          total_marks?: number
          updated_at?: string
          venue?: string | null
        }
        Update: {
          class_id?: string | null
          created_at?: string
          description?: string | null
          duration_minutes?: number
          exam_date?: string
          exam_type?: string
          id?: string
          instructions?: string | null
          status?: string
          subject_id?: string | null
          syllabus?: string[] | null
          title?: string
          total_marks?: number
          updated_at?: string
          venue?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_exams_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_exams_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      student_guardians: {
        Row: {
          guardian_id: string
          is_emergency_contact: boolean | null
          is_primary: boolean | null
          relationship: Database["public"]["Enums"]["guardian_relationship"]
          student_id: string
        }
        Insert: {
          guardian_id: string
          is_emergency_contact?: boolean | null
          is_primary?: boolean | null
          relationship: Database["public"]["Enums"]["guardian_relationship"]
          student_id: string
        }
        Update: {
          guardian_id?: string
          is_emergency_contact?: boolean | null
          is_primary?: boolean | null
          relationship?: Database["public"]["Enums"]["guardian_relationship"]
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_guardians_guardian_id_fkey"
            columns: ["guardian_id"]
            isOneToOne: false
            referencedRelation: "guardians"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_guardians_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      student_marks: {
        Row: {
          created_at: string | null
          entered_at: string | null
          entered_by: string | null
          exam_paper_id: string
          grace_marks: number | null
          grade: string | null
          grade_points: number | null
          id: string
          is_absent: boolean | null
          is_grace_marks: boolean | null
          marks_obtained: number | null
          max_marks: number
          moderated_at: string | null
          moderated_by: string | null
          percentage: number | null
          remarks: string | null
          status: string | null
          student_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          entered_at?: string | null
          entered_by?: string | null
          exam_paper_id: string
          grace_marks?: number | null
          grade?: string | null
          grade_points?: number | null
          id?: string
          is_absent?: boolean | null
          is_grace_marks?: boolean | null
          marks_obtained?: number | null
          max_marks: number
          moderated_at?: string | null
          moderated_by?: string | null
          percentage?: number | null
          remarks?: string | null
          status?: string | null
          student_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          entered_at?: string | null
          entered_by?: string | null
          exam_paper_id?: string
          grace_marks?: number | null
          grade?: string | null
          grade_points?: number | null
          id?: string
          is_absent?: boolean | null
          is_grace_marks?: boolean | null
          marks_obtained?: number | null
          max_marks?: number
          moderated_at?: string | null
          moderated_by?: string | null
          percentage?: number | null
          remarks?: string | null
          status?: string | null
          student_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_marks_entered_by_fkey"
            columns: ["entered_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_marks_exam_paper_id_fkey"
            columns: ["exam_paper_id"]
            isOneToOne: false
            referencedRelation: "exam_papers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_marks_moderated_by_fkey"
            columns: ["moderated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_marks_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      student_messages: {
        Row: {
          attachments: Json | null
          body: string
          created_at: string
          id: string
          is_read: boolean | null
          parent_message_id: string | null
          priority: string | null
          read_at: string | null
          recipient_id: string
          sender_id: string
          subject: string
          updated_at: string
        }
        Insert: {
          attachments?: Json | null
          body: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          parent_message_id?: string | null
          priority?: string | null
          read_at?: string | null
          recipient_id: string
          sender_id: string
          subject: string
          updated_at?: string
        }
        Update: {
          attachments?: Json | null
          body?: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          parent_message_id?: string | null
          priority?: string | null
          read_at?: string | null
          recipient_id?: string
          sender_id?: string
          subject?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_messages_parent_message_id_fkey"
            columns: ["parent_message_id"]
            isOneToOne: false
            referencedRelation: "student_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_messages_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      student_performance_snapshots: {
        Row: {
          academic_year_id: string
          attendance_percentage: number | null
          average_score: number | null
          calculated_at: string | null
          id: string
          risk_score: number | null
          student_id: string
          term_id: string | null
        }
        Insert: {
          academic_year_id: string
          attendance_percentage?: number | null
          average_score?: number | null
          calculated_at?: string | null
          id?: string
          risk_score?: number | null
          student_id: string
          term_id?: string | null
        }
        Update: {
          academic_year_id?: string
          attendance_percentage?: number | null
          average_score?: number | null
          calculated_at?: string | null
          id?: string
          risk_score?: number | null
          student_id?: string
          term_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_performance_snapshots_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_performance_snapshots_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_performance_snapshots_term_id_fkey"
            columns: ["term_id"]
            isOneToOne: false
            referencedRelation: "terms"
            referencedColumns: ["id"]
          },
        ]
      }
      student_progress: {
        Row: {
          assignments_completed: number | null
          assignments_total: number | null
          attendance_percentage: number | null
          average_score: number | null
          class_id: string | null
          created_at: string
          id: string
          last_calculated_at: string | null
          student_id: string
          study_time_minutes: number | null
          subject_id: string | null
          updated_at: string
        }
        Insert: {
          assignments_completed?: number | null
          assignments_total?: number | null
          attendance_percentage?: number | null
          average_score?: number | null
          class_id?: string | null
          created_at?: string
          id?: string
          last_calculated_at?: string | null
          student_id: string
          study_time_minutes?: number | null
          subject_id?: string | null
          updated_at?: string
        }
        Update: {
          assignments_completed?: number | null
          assignments_total?: number | null
          attendance_percentage?: number | null
          average_score?: number | null
          class_id?: string | null
          created_at?: string
          id?: string
          last_calculated_at?: string | null
          student_id?: string
          study_time_minutes?: number | null
          subject_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_progress_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_progress_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_progress_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      student_rankings: {
        Row: {
          created_at: string | null
          id: string
          percentile: number | null
          rank_value: number
          ranking_type: string
          student_result_id: string
          subject_id: string | null
          total_students: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          percentile?: number | null
          rank_value: number
          ranking_type: string
          student_result_id: string
          subject_id?: string | null
          total_students?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          percentile?: number | null
          rank_value?: number
          ranking_type?: string
          student_result_id?: string
          subject_id?: string | null
          total_students?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "student_rankings_student_result_id_fkey"
            columns: ["student_result_id"]
            isOneToOne: false
            referencedRelation: "student_results"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_rankings_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      student_results: {
        Row: {
          calculated_at: string | null
          class_id: string | null
          class_rank: number | null
          created_at: string | null
          exam_id: string
          id: string
          is_passed: boolean | null
          overall_gpa: number | null
          overall_grade: string | null
          overall_percentage: number | null
          published_at: string | null
          remarks: string | null
          section_id: string | null
          section_rank: number | null
          status: string | null
          student_id: string
          subjects_failed: number | null
          subjects_passed: number | null
          total_marks_obtained: number | null
          total_max_marks: number | null
          updated_at: string | null
        }
        Insert: {
          calculated_at?: string | null
          class_id?: string | null
          class_rank?: number | null
          created_at?: string | null
          exam_id: string
          id?: string
          is_passed?: boolean | null
          overall_gpa?: number | null
          overall_grade?: string | null
          overall_percentage?: number | null
          published_at?: string | null
          remarks?: string | null
          section_id?: string | null
          section_rank?: number | null
          status?: string | null
          student_id: string
          subjects_failed?: number | null
          subjects_passed?: number | null
          total_marks_obtained?: number | null
          total_max_marks?: number | null
          updated_at?: string | null
        }
        Update: {
          calculated_at?: string | null
          class_id?: string | null
          class_rank?: number | null
          created_at?: string | null
          exam_id?: string
          id?: string
          is_passed?: boolean | null
          overall_gpa?: number | null
          overall_grade?: string | null
          overall_percentage?: number | null
          published_at?: string | null
          remarks?: string | null
          section_id?: string | null
          section_rank?: number | null
          status?: string | null
          student_id?: string
          subjects_failed?: number | null
          subjects_passed?: number | null
          total_marks_obtained?: number | null
          total_max_marks?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_results_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_results_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exam_master"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_results_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_results_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          address: Json | null
          admission_number: string
          created_at: string | null
          date_of_birth: string
          enrollment_date: string | null
          first_name: string
          gender: Database["public"]["Enums"]["gender_enum"] | null
          id: string
          is_active: boolean | null
          last_name: string
          medical_notes: string | null
          middle_name: string | null
          profile_photo_url: string | null
          school_id: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          address?: Json | null
          admission_number: string
          created_at?: string | null
          date_of_birth: string
          enrollment_date?: string | null
          first_name: string
          gender?: Database["public"]["Enums"]["gender_enum"] | null
          id?: string
          is_active?: boolean | null
          last_name: string
          medical_notes?: string | null
          middle_name?: string | null
          profile_photo_url?: string | null
          school_id: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          address?: Json | null
          admission_number?: string
          created_at?: string | null
          date_of_birth?: string
          enrollment_date?: string | null
          first_name?: string
          gender?: Database["public"]["Enums"]["gender_enum"] | null
          id?: string
          is_active?: boolean | null
          last_name?: string
          medical_notes?: string | null
          middle_name?: string | null
          profile_photo_url?: string | null
          school_id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "students_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      study_sessions: {
        Row: {
          created_at: string
          duration_minutes: number | null
          end_time: string | null
          id: string
          notes: string | null
          resource_id: string | null
          start_time: string
          student_id: string
          subject_id: string | null
        }
        Insert: {
          created_at?: string
          duration_minutes?: number | null
          end_time?: string | null
          id?: string
          notes?: string | null
          resource_id?: string | null
          start_time: string
          student_id: string
          subject_id?: string | null
        }
        Update: {
          created_at?: string
          duration_minutes?: number | null
          end_time?: string | null
          id?: string
          notes?: string | null
          resource_id?: string | null
          start_time?: string
          student_id?: string
          subject_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "study_sessions_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "learning_resources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "study_sessions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "study_sessions_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      subject_performance: {
        Row: {
          average_percentage: number | null
          class_id: string | null
          created_at: string | null
          exam_id: string
          highest_percentage: number | null
          id: string
          lowest_percentage: number | null
          pass_percentage: number | null
          section_id: string | null
          students_40_to_60: number | null
          students_60_to_80: number | null
          students_above_80: number | null
          students_below_40: number | null
          subject_id: string
          teacher_id: string | null
        }
        Insert: {
          average_percentage?: number | null
          class_id?: string | null
          created_at?: string | null
          exam_id: string
          highest_percentage?: number | null
          id?: string
          lowest_percentage?: number | null
          pass_percentage?: number | null
          section_id?: string | null
          students_40_to_60?: number | null
          students_60_to_80?: number | null
          students_above_80?: number | null
          students_below_40?: number | null
          subject_id: string
          teacher_id?: string | null
        }
        Update: {
          average_percentage?: number | null
          class_id?: string | null
          created_at?: string | null
          exam_id?: string
          highest_percentage?: number | null
          id?: string
          lowest_percentage?: number | null
          pass_percentage?: number | null
          section_id?: string | null
          students_40_to_60?: number | null
          students_60_to_80?: number | null
          students_above_80?: number | null
          students_below_40?: number | null
          subject_id?: string
          teacher_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subject_performance_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subject_performance_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exam_master"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subject_performance_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subject_performance_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subject_performance_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subjects: {
        Row: {
          code: string
          created_at: string | null
          credit_hours: number | null
          department: string | null
          description: string | null
          grade_levels: number[]
          id: string
          is_core: boolean | null
          name: string
          school_id: string
          type: string | null
          updated_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          credit_hours?: number | null
          department?: string | null
          description?: string | null
          grade_levels?: number[]
          id?: string
          is_core?: boolean | null
          name: string
          school_id: string
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          credit_hours?: number | null
          department?: string | null
          description?: string | null
          grade_levels?: number[]
          id?: string
          is_core?: boolean | null
          name?: string
          school_id?: string
          type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subjects_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          id: string
          plan_id: string
          school_id: string
          status: Database["public"]["Enums"]["subscription_status"] | null
          updated_at: string | null
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_id: string
          school_id: string
          status?: Database["public"]["Enums"]["subscription_status"] | null
          updated_at?: string | null
        }
        Update: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_id?: string
          school_id?: string
          status?: Database["public"]["Enums"]["subscription_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      substitutions: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          created_at: string | null
          date: string
          id: string
          notes: string | null
          original_teacher_id: string
          reason: string | null
          status: string | null
          substitute_teacher_id: string | null
          timetable_entry_id: string
          updated_at: string | null
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          created_at?: string | null
          date: string
          id?: string
          notes?: string | null
          original_teacher_id: string
          reason?: string | null
          status?: string | null
          substitute_teacher_id?: string | null
          timetable_entry_id: string
          updated_at?: string | null
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          created_at?: string | null
          date?: string
          id?: string
          notes?: string | null
          original_teacher_id?: string
          reason?: string | null
          status?: string | null
          substitute_teacher_id?: string | null
          timetable_entry_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "substitutions_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "substitutions_original_teacher_id_fkey"
            columns: ["original_teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "substitutions_substitute_teacher_id_fkey"
            columns: ["substitute_teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "substitutions_timetable_entry_id_fkey"
            columns: ["timetable_entry_id"]
            isOneToOne: false
            referencedRelation: "timetable_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      teacher_assignments: {
        Row: {
          academic_year_id: string | null
          class_id: string | null
          created_at: string | null
          end_date: string | null
          id: string
          is_class_teacher: boolean | null
          periods_per_week: number | null
          school_id: string
          section_id: string | null
          start_date: string | null
          subject_id: string | null
          teacher_id: string
          updated_at: string | null
        }
        Insert: {
          academic_year_id?: string | null
          class_id?: string | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          is_class_teacher?: boolean | null
          periods_per_week?: number | null
          school_id: string
          section_id?: string | null
          start_date?: string | null
          subject_id?: string | null
          teacher_id: string
          updated_at?: string | null
        }
        Update: {
          academic_year_id?: string | null
          class_id?: string | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          is_class_teacher?: boolean | null
          periods_per_week?: number | null
          school_id?: string
          section_id?: string | null
          start_date?: string | null
          subject_id?: string | null
          teacher_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "teacher_assignments_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_assignments_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_assignments_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_assignments_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_assignments_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_assignments_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      teachers: {
        Row: {
          created_at: string | null
          employee_id: string
          id: string
          joining_date: string
          qualifications: string[] | null
          school_id: string
          status: string | null
          subjects: string[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          employee_id: string
          id?: string
          joining_date?: string
          qualifications?: string[] | null
          school_id: string
          status?: string | null
          subjects?: string[] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          employee_id?: string
          id?: string
          joining_date?: string
          qualifications?: string[] | null
          school_id?: string
          status?: string | null
          subjects?: string[] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "teachers_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teachers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      terms: {
        Row: {
          academic_year_id: string
          created_at: string | null
          end_date: string
          id: string
          name: string
          school_id: string
          start_date: string
          updated_at: string | null
        }
        Insert: {
          academic_year_id: string
          created_at?: string | null
          end_date: string
          id?: string
          name: string
          school_id: string
          start_date: string
          updated_at?: string | null
        }
        Update: {
          academic_year_id?: string
          created_at?: string | null
          end_date?: string
          id?: string
          name?: string
          school_id?: string
          start_date?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "terms_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "terms_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      thread_participants: {
        Row: {
          last_read_at: string | null
          thread_id: string
          user_id: string
        }
        Insert: {
          last_read_at?: string | null
          thread_id: string
          user_id: string
        }
        Update: {
          last_read_at?: string | null
          thread_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "thread_participants_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "message_threads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "thread_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      timetable_conflicts: {
        Row: {
          affected_entries: string[] | null
          conflict_type: string
          description: string
          detected_at: string | null
          id: string
          metadata: Json | null
          resolution_notes: string | null
          resolution_status: string | null
          resolved_at: string | null
          resolved_by: string | null
          severity: string | null
          timetable_id: string | null
        }
        Insert: {
          affected_entries?: string[] | null
          conflict_type: string
          description: string
          detected_at?: string | null
          id?: string
          metadata?: Json | null
          resolution_notes?: string | null
          resolution_status?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string | null
          timetable_id?: string | null
        }
        Update: {
          affected_entries?: string[] | null
          conflict_type?: string
          description?: string
          detected_at?: string | null
          id?: string
          metadata?: Json | null
          resolution_notes?: string | null
          resolution_status?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string | null
          timetable_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "timetable_conflicts_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timetable_conflicts_timetable_id_fkey"
            columns: ["timetable_id"]
            isOneToOne: false
            referencedRelation: "timetables"
            referencedColumns: ["id"]
          },
        ]
      }
      timetable_entries: {
        Row: {
          class_id: string | null
          created_at: string | null
          day_of_week: number
          id: string
          is_substitution: boolean | null
          notes: string | null
          period_id: string
          room_id: string | null
          section_id: string | null
          subject_id: string | null
          teacher_id: string | null
          timetable_id: string
          updated_at: string | null
        }
        Insert: {
          class_id?: string | null
          created_at?: string | null
          day_of_week: number
          id?: string
          is_substitution?: boolean | null
          notes?: string | null
          period_id: string
          room_id?: string | null
          section_id?: string | null
          subject_id?: string | null
          teacher_id?: string | null
          timetable_id: string
          updated_at?: string | null
        }
        Update: {
          class_id?: string | null
          created_at?: string | null
          day_of_week?: number
          id?: string
          is_substitution?: boolean | null
          notes?: string | null
          period_id?: string
          room_id?: string | null
          section_id?: string | null
          subject_id?: string | null
          teacher_id?: string | null
          timetable_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "timetable_entries_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timetable_entries_period_id_fkey"
            columns: ["period_id"]
            isOneToOne: false
            referencedRelation: "periods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timetable_entries_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timetable_entries_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timetable_entries_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timetable_entries_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timetable_entries_timetable_id_fkey"
            columns: ["timetable_id"]
            isOneToOne: false
            referencedRelation: "timetables"
            referencedColumns: ["id"]
          },
        ]
      }
      timetable_versions: {
        Row: {
          changes_summary: string | null
          created_at: string | null
          created_by: string | null
          id: string
          snapshot: Json
          timetable_id: string
          version_number: number
        }
        Insert: {
          changes_summary?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          snapshot: Json
          timetable_id: string
          version_number: number
        }
        Update: {
          changes_summary?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          snapshot?: Json
          timetable_id?: string
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "timetable_versions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timetable_versions_timetable_id_fkey"
            columns: ["timetable_id"]
            isOneToOne: false
            referencedRelation: "timetables"
            referencedColumns: ["id"]
          },
        ]
      }
      timetables: {
        Row: {
          academic_year_id: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          effective_from: string
          effective_until: string | null
          id: string
          is_current: boolean | null
          name: string
          published_at: string | null
          published_by: string | null
          school_id: string
          status: string | null
          updated_at: string | null
          version: number | null
        }
        Insert: {
          academic_year_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          effective_from: string
          effective_until?: string | null
          id?: string
          is_current?: boolean | null
          name: string
          published_at?: string | null
          published_by?: string | null
          school_id: string
          status?: string | null
          updated_at?: string | null
          version?: number | null
        }
        Update: {
          academic_year_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          effective_from?: string
          effective_until?: string | null
          id?: string
          is_current?: boolean | null
          name?: string
          published_at?: string | null
          published_by?: string | null
          school_id?: string
          status?: string | null
          updated_at?: string | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "timetables_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timetables_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timetables_published_by_fkey"
            columns: ["published_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timetables_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string | null
          email: string
          first_name: string | null
          id: string
          is_active: boolean | null
          last_login_at: string | null
          last_name: string | null
          password_hash: string
          role: Database["public"]["Enums"]["user_role"]
          school_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          first_name?: string | null
          id?: string
          is_active?: boolean | null
          last_login_at?: string | null
          last_name?: string | null
          password_hash: string
          role?: Database["public"]["Enums"]["user_role"]
          school_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          first_name?: string | null
          id?: string
          is_active?: boolean | null
          last_login_at?: string | null
          last_name?: string | null
          password_hash?: string
          role?: Database["public"]["Enums"]["user_role"]
          school_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_class_statistics: {
        Args: { p_exam_paper_id: string }
        Returns: {
          absent: number
          appeared: number
          average_marks: number
          failed: number
          highest_marks: number
          lowest_marks: number
          pass_percentage: number
          passed: number
          total_students: number
        }[]
      }
      calculate_rankings: {
        Args: { p_class_id?: string; p_exam_id: string; p_section_id?: string }
        Returns: undefined
      }
      calculate_student_progress: {
        Args: { p_class_id: string; p_student_id: string }
        Returns: undefined
      }
      calculate_student_result: {
        Args: { p_exam_id: string; p_student_id: string }
        Returns: string
      }
      detect_timetable_conflicts: {
        Args: { p_timetable_id: string }
        Returns: {
          affected_entries: string[]
          conflict_type: string
          description: string
        }[]
      }
      expire_old_invitations: { Args: never; Returns: undefined }
      generate_result_analytics: {
        Args: { p_exam_id: string }
        Returns: undefined
      }
      has_role: {
        Args: {
          lookup_school_id: string
          required_role: Database["public"]["Enums"]["user_role"]
        }
        Returns: boolean
      }
      is_school_member: { Args: { lookup_school_id: string }; Returns: boolean }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      uuid_generate_v7: { Args: never; Returns: string }
    }
    Enums: {
      admin_role_type:
        | "Principal"
        | "Vice Principal"
        | "Owner"
        | "Admin"
        | "Teacher"
      curriculum_type:
        | "CBSE"
        | "ICSE"
        | "State Board"
        | "IB"
        | "Cambridge/IGCSE"
        | "Other"
      gender_enum: "male" | "female" | "other"
      guardian_relationship:
        | "father"
        | "mother"
        | "guardian"
        | "sibling"
        | "other"
      onboarding_status: "pending" | "active" | "suspended"
      school_type: "k12" | "higher_ed" | "vocational"
      student_count_range: "1-100" | "101-500" | "501-1000" | "1000+"
      subscription_status: "active" | "past_due" | "canceled" | "trial"
      user_role:
        | "super_admin"
        | "school_admin"
        | "teacher"
        | "student"
        | "guardian"
        | "staff"
      user_status: "active" | "inactive" | "suspended" | "invited"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      admin_role_type: [
        "Principal",
        "Vice Principal",
        "Owner",
        "Admin",
        "Teacher",
      ],
      curriculum_type: [
        "CBSE",
        "ICSE",
        "State Board",
        "IB",
        "Cambridge/IGCSE",
        "Other",
      ],
      gender_enum: ["male", "female", "other"],
      guardian_relationship: [
        "father",
        "mother",
        "guardian",
        "sibling",
        "other",
      ],
      onboarding_status: ["pending", "active", "suspended"],
      school_type: ["k12", "higher_ed", "vocational"],
      student_count_range: ["1-100", "101-500", "501-1000", "1000+"],
      subscription_status: ["active", "past_due", "canceled", "trial"],
      user_role: [
        "super_admin",
        "school_admin",
        "teacher",
        "student",
        "guardian",
        "staff",
      ],
      user_status: ["active", "inactive", "suspended", "invited"],
    },
  },
} as const

