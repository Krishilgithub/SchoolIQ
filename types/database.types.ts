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
      schools: {
        Row: {
          id: string;
          name: string;
          slug: string;
          school_type: "k12" | "higher_ed" | "vocational";
          logo_url: string | null;
          website: string | null;
          contact_email: string;
          contact_phone: string | null;
          address: Json | null;
          subscription_status: "active" | "past_due" | "canceled" | "trial";
          settings: Json | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          school_type?: "k12" | "higher_ed" | "vocational";
          logo_url?: string | null;
          website?: string | null;
          contact_email: string;
          contact_phone?: string | null;
          address?: Json | null;
          subscription_status?: "active" | "past_due" | "canceled" | "trial";
          settings?: Json | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          school_type?: "k12" | "higher_ed" | "vocational";
          logo_url?: string | null;
          website?: string | null;
          contact_email?: string;
          contact_phone?: string | null;
          address?: Json | null;
          subscription_status?: "active" | "past_due" | "canceled" | "trial";
          settings?: Json | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [];
      };
      school_admins: {
        Row: {
          id: string;
          school_id: string;
          user_id: string;
          role: "primary_admin" | "admin";
          created_at: string;
        };
        Insert: {
          id?: string;
          school_id: string;
          user_id: string;
          role?: "primary_admin" | "admin";
          created_at?: string;
        };
        Update: {
          id?: string;
          school_id?: string;
          user_id?: string;
          role?: "primary_admin" | "admin";
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "school_admins_school_id_fkey";
            columns: ["school_id"];
            isOneToOne: false;
            referencedRelation: "schools";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "school_admins_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          id: string;
          email: string;
          first_name: string;
          last_name: string;
          role: string;
          avatar_url: string | null;
          phone_number: string | null;
          is_super_admin: boolean;
          school_id: string | null;
          is_suspended: boolean;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          first_name: string;
          last_name: string;
          role?: string;
          avatar_url?: string | null;
          phone_number?: string | null;
          is_super_admin?: boolean;
          school_id?: string | null;
          is_suspended?: boolean;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          first_name?: string;
          last_name?: string;
          role?: string;
          avatar_url?: string | null;
          phone_number?: string | null;
          is_super_admin?: boolean;
          school_id?: string | null;
          is_suspended?: boolean;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_school_id_fkey";
            columns: ["school_id"];
            isOneToOne: false;
            referencedRelation: "schools";
            referencedColumns: ["id"];
          },
        ];
      };
      students: {
        Row: {
          id: string;
          school_id: string;
          user_id: string | null;
          admission_number: string;
          first_name: string;
          last_name: string;
          middle_name: string | null;
          date_of_birth: string;
          gender: "male" | "female" | "other" | null;
          address: Json | null;
          profile_photo_url: string | null;
          medical_notes: string | null;
          is_active: boolean;
          enrollment_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          school_id: string;
          user_id?: string | null;
          admission_number: string;
          first_name: string;
          last_name: string;
          middle_name?: string | null;
          date_of_birth: string;
          gender?: "male" | "female" | "other" | null;
          address?: Json | null;
          profile_photo_url?: string | null;
          medical_notes?: string | null;
          is_active?: boolean;
          enrollment_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          school_id?: string;
          user_id?: string | null;
          admission_number?: string;
          first_name?: string;
          last_name?: string;
          middle_name?: string | null;
          date_of_birth?: string;
          gender?: "male" | "female" | "other" | null;
          address?: Json | null;
          profile_photo_url?: string | null;
          medical_notes?: string | null;
          is_active?: boolean;
          enrollment_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      user_role:
        | "super_admin"
        | "school_admin"
        | "teacher"
        | "student"
        | "guardian"
        | "staff";
      school_type: "k12" | "higher_ed" | "vocational";
    };
  };
}
