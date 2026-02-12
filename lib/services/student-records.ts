import { createClient } from "@/lib/supabase/server";
import { Database } from "@/types/database.types";

type StudentDocument = Database["public"]["Tables"]["student_documents"]["Row"];
type StudentDocumentInsert =
  Database["public"]["Tables"]["student_documents"]["Insert"];
type StudentDocumentUpdate =
  Database["public"]["Tables"]["student_documents"]["Update"];
type DisciplineRecord =
  Database["public"]["Tables"]["discipline_records"]["Row"];
type DisciplineRecordInsert =
  Database["public"]["Tables"]["discipline_records"]["Insert"];
type DisciplineRecordUpdate =
  Database["public"]["Tables"]["discipline_records"]["Update"];
type StudentHistory = Database["public"]["Tables"]["student_history"]["Row"];

export interface DocumentUploadData {
  studentId: string;
  schoolId: string;
  documentType: string;
  documentName: string;
  documentDescription?: string;
  fileUrl: string;
  fileSizeBytes?: number;
  fileMimeType?: string;
  originalFilename?: string;
  issueDate?: string;
  expiryDate?: string;
  issuingAuthority?: string;
  documentNumber?: string;
  isSensitive?: boolean;
  createdBy: string;
}

export interface DisciplineRecordData {
  studentId: string;
  schoolId: string;
  incidentDate: string;
  incidentType: string;
  severity: string;
  incidentDescription: string;
  incidentLocation?: string;
  witnesses?: any[];
  actionTaken: string;
  actionType?: string;
  suspensionStartDate?: string;
  suspensionEndDate?: string;
  reportedBy: string;
  actionBy?: string;
  parentInformed?: boolean;
  parentInformedDate?: string;
  followUpRequired?: boolean;
  followUpDate?: string;
  createdBy: string;
}

/**
 * Student Records Service
 * Handles document management, discipline records, and history tracking
 */
export class StudentRecordsService {
  /**
   * ====================================
   * DOCUMENT MANAGEMENT
   * ====================================
   */

  /**
   * Get all documents for a student
   */
  static async getStudentDocuments(
    studentId: string,
    schoolId: string,
    documentType?: string,
  ): Promise<StudentDocument[]> {
    const supabase = await createClient();

    let query = supabase
      .from("student_documents")
      .select("*")
      .eq("student_id", studentId)
      .eq("school_id", schoolId)
      .eq("is_deleted", false)
      .order("created_at", { ascending: false });

    if (documentType) {
      query = query.eq("document_type", documentType);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  }

  /**
   * Upload a document for a student
   */
  static async uploadDocument(
    documentData: DocumentUploadData,
  ): Promise<StudentDocument> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("student_documents")
      .insert({
        student_id: documentData.studentId,
        school_id: documentData.schoolId,
        document_type: documentData.documentType,
        document_name: documentData.documentName,
        document_description: documentData.documentDescription,
        file_url: documentData.fileUrl,
        file_size_bytes: documentData.fileSizeBytes,
        file_mime_type: documentData.fileMimeType,
        original_filename: documentData.originalFilename,
        issue_date: documentData.issueDate,
        expiry_date: documentData.expiryDate,
        issuing_authority: documentData.issuingAuthority,
        document_number: documentData.documentNumber,
        is_sensitive: documentData.isSensitive || false,
        is_verified: false,
        created_by: documentData.createdBy,
      })
      .select()
      .single();

    if (error) throw error;

    // Log to history
    await this.logHistory(
      documentData.studentId,
      documentData.schoolId,
      "document_added",
      `Document uploaded: ${documentData.documentName}`,
      "student_documents",
      data.id,
      null,
      data,
      documentData.createdBy,
    );

    return data;
  }

  /**
   * Verify a document
   */
  static async verifyDocument(
    documentId: string,
    schoolId: string,
    verifiedBy: string,
    verificationNotes?: string,
  ): Promise<StudentDocument> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("student_documents")
      .update({
        is_verified: true,
        verified_at: new Date().toISOString(),
        verified_by: verifiedBy,
        verification_notes: verificationNotes,
        updated_by: verifiedBy,
      })
      .eq("id", documentId)
      .eq("school_id", schoolId)
      .select()
      .single();

    if (error) throw error;

    // Log to history
    await this.logHistory(
      data.student_id,
      schoolId,
      "document_verified",
      `Document verified: ${data.document_name}`,
      "student_documents",
      documentId,
      null,
      data,
      verifiedBy,
    );

    return data;
  }

  /**
   * Delete a document (soft delete)
   */
  static async deleteDocument(
    documentId: string,
    schoolId: string,
    deletedBy: string,
  ): Promise<void> {
    const supabase = await createClient();

    // Get document for history
    const { data: doc } = await supabase
      .from("student_documents")
      .select("*")
      .eq("id", documentId)
      .eq("school_id", schoolId)
      .single();

    const { error } = await supabase
      .from("student_documents")
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString(),
        deleted_by: deletedBy,
      })
      .eq("id", documentId)
      .eq("school_id", schoolId);

    if (error) throw error;

    if (doc) {
      await this.logHistory(
        doc.student_id,
        schoolId,
        "document_removed",
        `Document deleted: ${doc.document_name}`,
        "student_documents",
        documentId,
        doc,
        null,
        deletedBy,
      );
    }
  }

  /**
   * Get documents expiring soon
   */
  static async getExpiringDocuments(
    schoolId: string,
    daysAhead: number = 30,
  ): Promise<StudentDocument[]> {
    const supabase = await createClient();

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + daysAhead);

    const { data, error } = await supabase
      .from("student_documents")
      .select(
        `
        *,
        student:students(
          id,
          first_name,
          last_name,
          admission_number
        )
      `,
      )
      .eq("school_id", schoolId)
      .eq("is_deleted", false)
      .not("expiry_date", "is", null)
      .lte("expiry_date", expiryDate.toISOString())
      .order("expiry_date", { ascending: true });

    if (error) throw error;
    return data || [];
  }

  /**
   * Get unverified documents
   */
  static async getUnverifiedDocuments(
    schoolId: string,
  ): Promise<StudentDocument[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("student_documents")
      .select(
        `
        *,
        student:students(
          id,
          first_name,
          last_name,
          admission_number
        )
      `,
      )
      .eq("school_id", schoolId)
      .eq("is_verified", false)
      .eq("is_deleted", false)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * ====================================
   * DISCIPLINE RECORDS
   * ====================================
   */

  /**
   * Get discipline records for a student
   */
  static async getDisciplineRecords(
    studentId: string,
    schoolId: string,
    status?: string,
  ): Promise<DisciplineRecord[]> {
    const supabase = await createClient();

    let query = supabase
      .from("discipline_records")
      .select(
        `
        *,
        reported_by_profile:profiles!discipline_records_reported_by_fkey(
          id,
          full_name
        ),
        action_by_profile:profiles!discipline_records_action_by_fkey(
          id,
          full_name
        )
      `,
      )
      .eq("student_id", studentId)
      .eq("school_id", schoolId)
      .eq("is_deleted", false)
      .order("incident_date", { ascending: false });

    if (status) {
      query = query.eq("resolution_status", status);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  }

  /**
   * Create a discipline record
   */
  static async createDisciplineRecord(
    recordData: DisciplineRecordData,
  ): Promise<DisciplineRecord> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("discipline_records")
      .insert({
        student_id: recordData.studentId,
        school_id: recordData.schoolId,
        incident_date: recordData.incidentDate,
        incident_type: recordData.incidentType,
        severity: recordData.severity,
        incident_description: recordData.incidentDescription,
        incident_location: recordData.incidentLocation,
        witnesses: recordData.witnesses || [],
        action_taken: recordData.actionTaken,
        action_type: recordData.actionType,
        suspension_start_date: recordData.suspensionStartDate,
        suspension_end_date: recordData.suspensionEndDate,
        reported_by: recordData.reportedBy,
        action_by: recordData.actionBy,
        parent_informed: recordData.parentInformed || false,
        parent_informed_date: recordData.parentInformedDate,
        follow_up_required: recordData.followUpRequired || false,
        follow_up_date: recordData.followUpDate,
        resolution_status: "open",
        created_by: recordData.createdBy,
      })
      .select()
      .single();

    if (error) throw error;

    // Log to history
    await this.logHistory(
      recordData.studentId,
      recordData.schoolId,
      "discipline_record_added",
      `Discipline record created: ${recordData.incidentType}`,
      "discipline_records",
      data.id,
      null,
      data,
      recordData.createdBy,
    );

    return data;
  }

  /**
   * Update discipline record
   */
  static async updateDisciplineRecord(
    recordId: string,
    schoolId: string,
    updateData: Partial<DisciplineRecordUpdate>,
    updatedBy: string,
  ): Promise<DisciplineRecord> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("discipline_records")
      .update({
        ...updateData,
        updated_by: updatedBy,
      })
      .eq("id", recordId)
      .eq("school_id", schoolId)
      .select()
      .single();

    if (error) throw error;

    return data;
  }

  /**
   * Resolve a discipline record
   */
  static async resolveDisciplineRecord(
    recordId: string,
    schoolId: string,
    resolutionNotes: string,
    resolvedBy: string,
  ): Promise<DisciplineRecord> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("discipline_records")
      .update({
        resolution_status: "resolved",
        resolution_date: new Date().toISOString(),
        resolution_notes: resolutionNotes,
        updated_by: resolvedBy,
      })
      .eq("id", recordId)
      .eq("school_id", schoolId)
      .select()
      .single();

    if (error) throw error;

    return data;
  }

  /**
   * Get discipline statistics for a school
   */
  static async getDisciplineStats(
    schoolId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<{
    total: number;
    open: number;
    resolved: number;
    bySeverity: Record<string, number>;
    byType: Record<string, number>;
  }> {
    const supabase = await createClient();

    let query = supabase
      .from("discipline_records")
      .select("*")
      .eq("school_id", schoolId)
      .eq("is_deleted", false);

    if (startDate) {
      query = query.gte("incident_date", startDate);
    }

    if (endDate) {
      query = query.lte("incident_date", endDate);
    }

    const { data, error } = await query;

    if (error) throw error;

    const records = data || [];

    const stats = {
      total: records.length,
      open: records.filter((r) => r.resolution_status === "open").length,
      resolved: records.filter((r) => r.resolution_status === "resolved")
        .length,
      bySeverity: {} as Record<string, number>,
      byType: {} as Record<string, number>,
    };

    records.forEach((record) => {
      // Count by severity
      stats.bySeverity[record.severity] =
        (stats.bySeverity[record.severity] || 0) + 1;

      // Count by type
      stats.byType[record.incident_type] =
        (stats.byType[record.incident_type] || 0) + 1;
    });

    return stats;
  }

  /**
   * ====================================
   * HISTORY TRACKING
   * ====================================
   */

  /**
   * Get history for a student
   */
  static async getStudentHistory(
    studentId: string,
    schoolId: string,
    changeType?: string,
    limit: number = 50,
  ): Promise<StudentHistory[]> {
    const supabase = await createClient();

    let query = supabase
      .from("student_history")
      .select(
        `
        *,
        changed_by_profile:profiles(id, full_name)
      `,
      )
      .eq("student_id", studentId)
      .eq("school_id", schoolId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (changeType) {
      query = query.eq("change_type", changeType);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  }

  /**
   * Get recent activity across all students
   */
  static async getRecentActivity(
    schoolId: string,
    limit: number = 20,
  ): Promise<StudentHistory[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("student_history")
      .select(
        `
        *,
        student:students(
          id,
          first_name,
          last_name,
          admission_number
        ),
        changed_by_profile:profiles(id, full_name)
      `,
      )
      .eq("school_id", schoolId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  /**
   * Log to history (private helper)
   */
  private static async logHistory(
    studentId: string,
    schoolId: string,
    changeType: string,
    changeDescription: string,
    entityType: string,
    entityId: string,
    oldData: any,
    newData: any,
    changedBy?: string,
  ): Promise<void> {
    const supabase = await createClient();

    await supabase.from("student_history").insert({
      student_id: studentId,
      school_id: schoolId,
      change_type: changeType,
      change_description: changeDescription,
      entity_type: entityType,
      entity_id: entityId,
      old_data: oldData,
      new_data: newData,
      changed_by: changedBy,
    });
  }
}
