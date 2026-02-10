export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string;
          created_at: string;
          details: Json | null;
          entity_id: string | null;
          entity_type: string;
          id: string;
          metadata: Json | null;
          school_id: string;
          user_id: string | null;
        };
        Insert: {
          action: string;
          created_at?: string;
          details?: Json | null;
          entity_id?: string | null;
          entity_type: string;
          id?: string;
          metadata?: Json | null;
          school_id: string;
          user_id?: string | null;
        };
        Update: {
          action?: string;
          created_at?: string;
          details?: Json | null;
          entity_id?: string | null;
          entity_type?: string;
          id?: string;
          metadata?: Json | null;
          school_id?: string;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "audit_logs_school_id_fkey";
            columns: ["school_id"];
            isOneToOne: false;
            referencedRelation: "schools";
            referencedColumns: ["id"];
          },
        ];
      };
      class_subjects: {
        Row: {
          class_id: string;
          created_at: string;
          day_of_week: string | null;
          end_time: string | null;
          id: string;
          school_id: string;
          start_time: string | null;
          subject_id: string;
          teacher_id: string | null;
          periods_per_week: number | null;
        };
        Insert: {
          class_id: string;
          created_at?: string;
          day_of_week?: string | null;
          end_time?: string | null;
          id?: string;
          school_id: string;
          start_time?: string | null;
          subject_id: string;
          teacher_id?: string | null;
          periods_per_week?: number | null;
        };
        Update: {
          class_id?: string;
          created_at?: string;
          day_of_week?: string | null;
          end_time?: string | null;
          id?: string;
          school_id?: string;
          start_time?: string | null;
          subject_id?: string;
          teacher_id?: string | null;
          periods_per_week?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "class_subjects_class_id_fkey";
            columns: ["class_id"];
            isOneToOne: false;
            referencedRelation: "classes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "class_subjects_school_id_fkey";
            columns: ["school_id"];
            isOneToOne: false;
            referencedRelation: "schools";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "class_subjects_subject_id_fkey";
            columns: ["subject_id"];
            isOneToOne: false;
            referencedRelation: "subjects";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "class_subjects_teacher_id_fkey";
            columns: ["teacher_id"];
            isOneToOne: false;
            referencedRelation: "teachers";
            referencedColumns: ["id"];
          },
        ];
      };
      classes: {
        Row: {
          academic_year: string;
          capacity: number | null;
          class_teacher_id: string | null;
          created_at: string;
          grade_level: string;
          id: string;
          name: string;
          room_number: string | null;
          school_id: string;
          section: string | null;
        };
        Insert: {
          academic_year: string;
          capacity?: number | null;
          class_teacher_id?: string | null;
          created_at?: string;
          grade_level: string;
          id?: string;
          name: string;
          room_number?: string | null;
          school_id: string;
          section?: string | null;
        };
        Update: {
          academic_year?: string;
          capacity?: number | null;
          class_teacher_id?: string | null;
          created_at?: string;
          grade_level?: string;
          id?: string;
          name?: string;
          room_number?: string | null;
          school_id?: string;
          section?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "classes_class_teacher_id_fkey";
            columns: ["class_teacher_id"];
            isOneToOne: false;
            referencedRelation: "teachers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "classes_school_id_fkey";
            columns: ["school_id"];
            isOneToOne: false;
            referencedRelation: "schools";
            referencedColumns: ["id"];
          },
        ];
      };
      feature_flags: {
        Row: {
          id: string;
          flag_key: string;
          flag_name: string;
          description: string | null;
          is_enabled: boolean;
          rollout_percentage: number;
          target_schools: string[] | null;
          target_users: string[] | null;
          metadata: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          flag_key: string;
          flag_name: string;
          description?: string | null;
          is_enabled?: boolean;
          rollout_percentage?: number;
          target_schools?: string[] | null;
          target_users?: string[] | null;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          flag_key?: string;
          flag_name?: string;
          description?: string | null;
          is_enabled?: boolean;
          rollout_percentage?: number;
          target_schools?: string[] | null;
          target_users?: string[] | null;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      notifications: {
        Row: {
          created_at: string;
          id: string;
          is_read: boolean;
          link: string | null;
          message: string;
          recipient_id: string;
          school_id: string;
          title: string;
          type: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          is_read?: boolean;
          link?: string | null;
          message: string;
          recipient_id: string;
          school_id: string;
          title: string;
          type: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          is_read?: boolean;
          link?: string | null;
          message?: string;
          recipient_id?: string;
          school_id?: string;
          title?: string;
          type?: string;
        };
        Relationships: [
          {
            foreignKeyName: "notifications_school_id_fkey";
            columns: ["school_id"];
            isOneToOne: false;
            referencedRelation: "schools";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          deleted_at: string | null;
          email: string;
          first_name: string | null;
          full_name: string | null;
          id: string;
          is_super_admin: boolean;
          is_suspended: boolean;
          last_name: string | null;
          role: string;
          updated_at: string;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          deleted_at?: string | null;
          email: string;
          first_name?: string | null;
          full_name?: string | null;
          id: string;
          is_super_admin?: boolean;
          is_suspended?: boolean;
          last_name?: string | null;
          role?: string;
          updated_at?: string;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          deleted_at?: string | null;
          email?: string;
          first_name?: string | null;
          full_name?: string | null;
          id?: string;
          is_super_admin?: boolean;
          is_suspended?: boolean;
          last_name?: string | null;
          role?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      school_admins: {
        Row: {
          created_at: string;
          id: string;
          is_primary: boolean;
          role: string;
          school_id: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          is_primary?: boolean;
          role?: string;
          school_id: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          is_primary?: boolean;
          role?: string;
          school_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "school_admins_school_id_fkey";
            columns: ["school_id"];
            isOneToOne: false;
            referencedRelation: "schools";
            referencedColumns: ["id"];
          },
        ];
      };
      school_events: {
        Row: {
          created_at: string;
          created_by: string | null;
          description: string | null;
          end_date: string | null;
          event_type: string;
          id: string;
          is_all_day: boolean;
          location: string | null;
          school_id: string;
          start_date: string;
          title: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          created_by?: string | null;
          description?: string | null;
          end_date?: string | null;
          event_type: string;
          id?: string;
          is_all_day?: boolean;
          location?: string | null;
          school_id: string;
          start_date: string;
          title: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          created_by?: string | null;
          description?: string | null;
          end_date?: string | null;
          event_type?: string;
          id?: string;
          is_all_day?: boolean;
          location?: string | null;
          school_id?: string;
          start_date?: string;
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "school_events_school_id_fkey";
            columns: ["school_id"];
            isOneToOne: false;
            referencedRelation: "schools";
            referencedColumns: ["id"];
          },
        ];
      };
      schools: {
        Row: {
          address: string | null;
          contact_email: string;
          contact_phone: string | null;
          created_at: string;
          deleted_at: string | null;
          id: string;
          logo_url: string | null;
          name: string;
          school_type: string;
          slug: string;
          subscription_plan: string;
          subscription_status: string;
          updated_at: string;
          website: string | null;
        };
        Insert: {
          address?: string | null;
          contact_email: string;
          contact_phone?: string | null;
          created_at?: string;
          deleted_at?: string | null;
          id?: string;
          logo_url?: string | null;
          name: string;
          school_type: string;
          slug: string;
          subscription_plan?: string;
          subscription_status?: string;
          updated_at?: string;
          website?: string | null;
        };
        Update: {
          address?: string | null;
          contact_email?: string;
          contact_phone?: string | null;
          created_at?: string;
          deleted_at?: string | null;
          id?: string;
          logo_url?: string | null;
          name?: string;
          school_type?: string;
          slug?: string;
          subscription_plan?: string;
          subscription_status?: string;
          updated_at?: string;
          website?: string | null;
        };
        Relationships: [];
      };
      students: {
        Row: {
          address: string | null;
          admission_date: string;
          admission_number: string;
          class_id: string | null;
          created_at: string;
          date_of_birth: string;
          emergency_contact: string | null;
          first_name: string;
          gender: string | null;
          guardian_email: string | null;
          guardian_name: string | null;
          guardian_phone: string | null;
          id: string;
          last_name: string;
          medical_info: string | null;
          middle_name: string | null;
          school_id: string;
          updated_at: string;
          user_id: string | null;
        };
        Insert: {
          address?: string | null;
          admission_date: string;
          admission_number: string;
          class_id?: string | null;
          created_at?: string;
          date_of_birth: string;
          emergency_contact?: string | null;
          first_name: string;
          gender?: string | null;
          guardian_email?: string | null;
          guardian_name?: string | null;
          guardian_phone?: string | null;
          id?: string;
          last_name: string;
          medical_info?: string | null;
          middle_name?: string | null;
          school_id: string;
          updated_at?: string;
          user_id?: string | null;
        };
        Update: {
          address?: string | null;
          admission_date?: string;
          admission_number?: string;
          class_id?: string | null;
          created_at?: string;
          date_of_birth?: string;
          emergency_contact?: string | null;
          first_name?: string;
          gender?: string | null;
          guardian_email?: string | null;
          guardian_name?: string | null;
          guardian_phone?: string | null;
          id?: string;
          last_name?: string;
          medical_info?: string | null;
          middle_name?: string | null;
          school_id?: string;
          updated_at?: string;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "students_class_id_fkey";
            columns: ["class_id"];
            isOneToOne: false;
            referencedRelation: "classes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "students_school_id_fkey";
            columns: ["school_id"];
            isOneToOne: false;
            referencedRelation: "schools";
            referencedColumns: ["id"];
          },
        ];
      };
      subjects: {
        Row: {
          code: string;
          created_at: string;
          credits: number;
          description: string | null;
          id: string;
          name: string;
          school_id: string;
        };
        Insert: {
          code: string;
          created_at?: string;
          credits?: number;
          description?: string | null;
          id?: string;
          name: string;
          school_id: string;
        };
        Update: {
          code?: string;
          created_at?: string;
          credits?: number;
          description?: string | null;
          id?: string;
          name?: string;
          school_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "subjects_school_id_fkey";
            columns: ["school_id"];
            isOneToOne: false;
            referencedRelation: "schools";
            referencedColumns: ["id"];
          },
        ];
      };
      teachers: {
        Row: {
          created_at: string;
          department: string | null;
          email: string;
          first_name: string;
          hire_date: string;
          id: string;
          is_active: boolean;
          last_name: string;
          phone: string | null;
          qualification: string | null;
          school_id: string;
          specialization: string | null;
          updated_at: string;
          user_id: string | null;
        };
        Insert: {
          created_at?: string;
          department?: string | null;
          email: string;
          first_name: string;
          hire_date: string;
          id?: string;
          is_active?: boolean;
          last_name: string;
          phone?: string | null;
          qualification?: string | null;
          school_id: string;
          specialization?: string | null;
          updated_at?: string;
          user_id?: string | null;
        };
        Update: {
          created_at?: string;
          department?: string | null;
          email?: string;
          first_name?: string;
          hire_date?: string;
          id?: string;
          is_active?: boolean;
          last_name?: string;
          phone?: string | null;
          qualification?: string | null;
          school_id?: string;
          specialization?: string | null;
          updated_at?: string;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "teachers_school_id_fkey";
            columns: ["school_id"];
            isOneToOne: false;
            referencedRelation: "schools";
            referencedColumns: ["id"];
          },
        ];
      };
      version_history: {
        Row: {
          changed_at: string;
          changed_by: string | null;
          entity_id: string;
          entity_type: string;
          id: string;
          new_data: Json | null;
          old_data: Json | null;
          school_id: string;
          version: number;
        };
        Insert: {
          changed_at?: string;
          changed_by?: string | null;
          entity_id: string;
          entity_type: string;
          id?: string;
          new_data?: Json | null;
          old_data?: Json | null;
          school_id: string;
          version: number;
        };
        Update: {
          changed_at?: string;
          changed_by?: string | null;
          entity_id?: string;
          entity_type?: string;
          id?: string;
          new_data?: Json | null;
          old_data?: Json | null;
          school_id?: string;
          version?: number;
        };
        Relationships: [
          {
            foreignKeyName: "version_history_school_id_fkey";
            columns: ["school_id"];
            isOneToOne: false;
            referencedRelation: "schools";
            referencedColumns: ["id"];
          },
        ];
      };
      support_tickets: {
        Row: {
          id: string;
          school_id: string | null;
          user_id: string | null;
          subject: string;
          description: string;
          priority: string;
          status: string;
          assigned_to: string | null;
          category: string | null;
          tags: string[] | null;
          created_at: string;
          updated_at: string;
          resolved_at: string | null;
          closed_at: string | null;
        };
        Insert: {
          id?: string;
          school_id?: string | null;
          user_id?: string | null;
          subject: string;
          description: string;
          priority: string;
          status?: string;
          assigned_to?: string | null;
          category?: string | null;
          tags?: string[] | null;
          created_at?: string;
          updated_at?: string;
          resolved_at?: string | null;
          closed_at?: string | null;
        };
        Update: {
          id?: string;
          school_id?: string | null;
          user_id?: string | null;
          subject?: string;
          description?: string;
          priority?: string;
          status?: string;
          assigned_to?: string | null;
          category?: string | null;
          tags?: string[] | null;
          created_at?: string;
          updated_at?: string;
          resolved_at?: string | null;
          closed_at?: string | null;
        };
        Relationships: [];
      };
      ticket_messages: {
        Row: {
          id: string;
          ticket_id: string;
          user_id: string | null;
          message: string;
          is_internal: boolean;
          attachments: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          ticket_id: string;
          user_id?: string | null;
          message: string;
          is_internal?: boolean;
          attachments?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          ticket_id?: string;
          user_id?: string | null;
          message?: string;
          is_internal?: boolean;
          attachments?: Json | null;
          created_at?: string;
        };
        Relationships: [];
      };
      incidents: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          severity: string | null;
          status: string;
          started_at: string;
          resolved_at: string | null;
          root_cause: string | null;
          affected_services: string[] | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          severity?: string | null;
          status?: string;
          started_at: string;
          resolved_at?: string | null;
          root_cause?: string | null;
          affected_services?: string[] | null;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          severity?: string | null;
          status?: string;
          started_at?: string;
          resolved_at?: string | null;
          root_cause?: string | null;
          affected_services?: string[] | null;
          created_by?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      system_metrics: {
        Row: {
          id: string;
          metric_name: string;
          metric_value: number;
          metric_unit: string | null;
          recorded_at: string;
          metadata: Json | null;
        };
        Insert: {
          id?: string;
          metric_name: string;
          metric_value: number;
          metric_unit?: string | null;
          recorded_at?: string;
          metadata?: Json | null;
        };
        Update: {
          id?: string;
          metric_name?: string;
          metric_value?: number;
          metric_unit?: string | null;
          recorded_at?: string;
          metadata?: Json | null;
        };
        Relationships: [];
      };
      system_alerts: {
        Row: {
          id: string;
          alert_type: string;
          severity: string | null;
          message: string;
          metric_name: string | null;
          threshold_value: number | null;
          current_value: number | null;
          status: string;
          acknowledged_by: string | null;
          acknowledged_at: string | null;
          resolved_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          alert_type: string;
          severity?: string | null;
          message: string;
          metric_name?: string | null;
          threshold_value?: number | null;
          current_value?: number | null;
          status?: string;
          acknowledged_by?: string | null;
          acknowledged_at?: string | null;
          resolved_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          alert_type?: string;
          severity?: string | null;
          message?: string;
          metric_name?: string | null;
          threshold_value?: number | null;
          current_value?: number | null;
          status?: string;
          acknowledged_by?: string | null;
          acknowledged_at?: string | null;
          resolved_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      security_policies: {
        Row: {
          id: string;
          policy_type: string;
          policy_config: Json;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          policy_type: string;
          policy_config: Json;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          policy_type?: string;
          policy_config?: Json;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      ip_rules: {
        Row: {
          id: string;
          ip_address: string;
          rule_type: string | null;
          reason: string | null;
          created_by: string | null;
          created_at: string;
          expires_at: string | null;
        };
        Insert: {
          id?: string;
          ip_address: string;
          rule_type?: string | null;
          reason?: string | null;
          created_by?: string | null;
          created_at?: string;
          expires_at?: string | null;
        };
        Update: {
          id?: string;
          ip_address?: string;
          rule_type?: string | null;
          reason?: string | null;
          created_by?: string | null;
          created_at?: string;
          expires_at?: string | null;
        };
        Relationships: [];
      };
      login_attempts: {
        Row: {
          id: string;
          email: string;
          ip_address: string | null;
          user_agent: string | null;
          success: boolean;
          failure_reason: string | null;
          location: Json | null;
          attempted_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          ip_address?: string | null;
          user_agent?: string | null;
          success: boolean;
          failure_reason?: string | null;
          location?: Json | null;
          attempted_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          ip_address?: string | null;
          user_agent?: string | null;
          success?: boolean;
          failure_reason?: string | null;
          location?: Json | null;
          attempted_at?: string;
        };
        Relationships: [];
      };
      active_sessions: {
        Row: {
          id: string;
          user_id: string;
          session_token: string;
          ip_address: string | null;
          user_agent: string | null;
          last_activity: string;
          created_at: string;
          expires_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          session_token: string;
          ip_address?: string | null;
          user_agent?: string | null;
          last_activity?: string;
          created_at?: string;
          expires_at: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          session_token?: string;
          ip_address?: string | null;
          user_agent?: string | null;
          last_activity?: string;
          created_at?: string;
          expires_at?: string;
        };
        Relationships: [];
      };
      feature_flag_history: {
        Row: {
          id: string;
          flag_id: string;
          changed_by: string | null;
          old_value: boolean | null;
          new_value: boolean | null;
          rollout_change: Json | null;
          changed_at: string;
        };
        Insert: {
          id?: string;
          flag_id: string;
          changed_by?: string | null;
          old_value?: boolean | null;
          new_value?: boolean | null;
          rollout_change?: Json | null;
          changed_at?: string;
        };
        Update: {
          id?: string;
          flag_id?: string;
          changed_by?: string | null;
          old_value?: boolean | null;
          new_value?: boolean | null;
          rollout_change?: Json | null;
          changed_at?: string;
        };
        Relationships: [];
      };
      background_jobs: {
        Row: {
          id: string;
          job_type: string;
          job_name: string;
          payload: Json | null;
          status: string;
          priority: number;
          attempts: number;
          max_attempts: number;
          error_message: string | null;
          stack_trace: string | null;
          scheduled_at: string | null;
          started_at: string | null;
          completed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          job_type: string;
          job_name: string;
          payload?: Json | null;
          status?: string;
          priority?: number;
          attempts?: number;
          max_attempts?: number;
          error_message?: string | null;
          stack_trace?: string | null;
          scheduled_at?: string | null;
          started_at?: string | null;
          completed_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          job_type?: string;
          job_name?: string;
          payload?: Json | null;
          status?: string;
          priority?: number;
          attempts?: number;
          max_attempts?: number;
          error_message?: string | null;
          stack_trace?: string | null;
          scheduled_at?: string | null;
          started_at?: string | null;
          completed_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      job_schedules: {
        Row: {
          id: string;
          job_type: string;
          schedule_cron: string;
          is_active: boolean;
          last_run_at: string | null;
          next_run_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          job_type: string;
          schedule_cron: string;
          is_active?: boolean;
          last_run_at?: string | null;
          next_run_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          job_type?: string;
          schedule_cron?: string;
          is_active?: boolean;
          last_run_at?: string | null;
          next_run_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      database_backups: {
        Row: {
          id: string;
          backup_type: string | null;
          backup_size_bytes: number | null;
          backup_location: string;
          backup_status: string;
          error_message: string | null;
          created_by: string | null;
          created_at: string;
          completed_at: string | null;
          retention_days: number;
        };
        Insert: {
          id?: string;
          backup_type?: string | null;
          backup_size_bytes?: number | null;
          backup_location: string;
          backup_status?: string;
          error_message?: string | null;
          created_by?: string | null;
          created_at?: string;
          completed_at?: string | null;
          retention_days?: number;
        };
        Update: {
          id?: string;
          backup_type?: string | null;
          backup_size_bytes?: number | null;
          backup_location?: string;
          backup_status?: string;
          error_message?: string | null;
          created_by?: string | null;
          created_at?: string;
          completed_at?: string | null;
          retention_days?: number;
        };
        Relationships: [];
      };
      data_exports: {
        Row: {
          id: string;
          export_type: string;
          export_format: string | null;
          filters: Json | null;
          file_path: string | null;
          file_size_bytes: number | null;
          status: string;
          requested_by: string | null;
          created_at: string;
          completed_at: string | null;
          expires_at: string | null;
        };
        Insert: {
          id?: string;
          export_type: string;
          export_format?: string | null;
          filters?: Json | null;
          file_path?: string | null;
          file_size_bytes?: number | null;
          status?: string;
          requested_by?: string | null;
          created_at?: string;
          completed_at?: string | null;
          expires_at?: string | null;
        };
        Update: {
          id?: string;
          export_type?: string;
          export_format?: string | null;
          filters?: Json | null;
          file_path?: string | null;
          file_size_bytes?: number | null;
          status?: string;
          requested_by?: string | null;
          created_at?: string;
          completed_at?: string | null;
          expires_at?: string | null;
        };
        Relationships: [];
      };
      integration_configs: {
        Row: {
          id: string;
          integration_name: string;
          integration_type: string | null;
          is_enabled: boolean;
          config_data: Json;
          test_mode: boolean;
          last_tested_at: string | null;
          test_status: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          integration_name: string;
          integration_type?: string | null;
          is_enabled?: boolean;
          config_data: Json;
          test_mode?: boolean;
          last_tested_at?: string | null;
          test_status?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          integration_name?: string;
          integration_type?: string | null;
          is_enabled?: boolean;
          config_data?: Json;
          test_mode?: boolean;
          last_tested_at?: string | null;
          test_status?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      webhooks: {
        Row: {
          id: string;
          url: string;
          events: string[];
          secret_key: string;
          is_active: boolean;
          retry_config: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          url: string;
          events: string[];
          secret_key: string;
          is_active?: boolean;
          retry_config?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          url?: string;
          events?: string[];
          secret_key?: string;
          is_active?: boolean;
          retry_config?: Json | null;
          created_at?: string;
        };
        Relationships: [];
      };
      webhook_deliveries: {
        Row: {
          id: string;
          webhook_id: string;
          event_type: string;
          payload: Json;
          response_status: number | null;
          response_body: string | null;
          delivered_at: string;
          retry_count: number;
        };
        Insert: {
          id?: string;
          webhook_id: string;
          event_type: string;
          payload: Json;
          response_status?: number | null;
          response_body?: string | null;
          delivered_at?: string;
          retry_count?: number;
        };
        Update: {
          id?: string;
          webhook_id?: string;
          event_type?: string;
          payload?: Json;
          response_status?: number | null;
          response_body?: string | null;
          delivered_at?: string;
          retry_count?: number;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      check_school_access: {
        Args: {
          school_id_param: string;
        };
        Returns: boolean;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
