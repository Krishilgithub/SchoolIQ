import { createClient } from "@/lib/supabase/server";
import { Database } from "@/types/database.types";

type ReportTemplate = Database["public"]["Tables"]["report_templates"]["Row"];
type ReportTemplateInsert =
  Database["public"]["Tables"]["report_templates"]["Insert"];
type ReportTemplateUpdate =
  Database["public"]["Tables"]["report_templates"]["Update"];
type ReportCard = Database["public"]["Tables"]["report_cards"]["Row"];
type ReportCardInsert = Database["public"]["Tables"]["report_cards"]["Insert"];

export interface ReportCardWithDetails extends ReportCard {
  student_result?: any;
  template?: ReportTemplate;
}

/**
 * Report Card Service
 * Manages report card templates and generation
 */
export class ReportCardService {
  /**
   * Get all templates for a school
   */
  static async getTemplates(
    schoolId: string,
    activeOnly = true,
  ): Promise<ReportTemplate[]> {
    const supabase = await createClient();

    let query = supabase
      .from("report_templates")
      .select("*")
      .eq("school_id", schoolId);

    if (activeOnly) {
      query = query.eq("is_active", true);
    }

    const { data, error } = await query.order("name");

    if (error) throw error;
    return data || [];
  }

  /**
   * Get template by ID
   */
  static async getTemplateById(id: string): Promise<ReportTemplate | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("report_templates")
      .select("*")
      .eq("id", id)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return data;
  }

  /**
   * Get default template for a school
   */
  static async getDefaultTemplate(
    schoolId: string,
  ): Promise<ReportTemplate | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("report_templates")
      .select("*")
      .eq("school_id", schoolId)
      .eq("is_default", true)
      .eq("is_active", true)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return data;
  }

  /**
   * Create template
   */
  static async createTemplate(
    template: ReportTemplateInsert,
  ): Promise<ReportTemplate> {
    const supabase = await createClient();

    // If setting as default, unset other defaults
    if (template.is_default) {
      await supabase
        .from("report_templates")
        .update({ is_default: false })
        .eq("school_id", template.school_id);
    }

    const { data, error } = await supabase
      .from("report_templates")
      .insert(template)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Update template
   */
  static async updateTemplate(
    id: string,
    updates: ReportTemplateUpdate,
  ): Promise<ReportTemplate> {
    const supabase = await createClient();

    // If setting as default, unset other defaults in same school
    if (updates.is_default) {
      const { data: current } = await supabase
        .from("report_templates")
        .select("school_id")
        .eq("id", id)
        .single();

      if (current) {
        await supabase
          .from("report_templates")
          .update({ is_default: false })
          .eq("school_id", current.school_id)
          .neq("id", id);
      }
    }

    const { data, error } = await supabase
      .from("report_templates")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Delete template
   */
  static async deleteTemplate(id: string): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase
      .from("report_templates")
      .delete()
      .eq("id", id);

    if (error) throw error;
  }

  /**
   * Generate report card for a student result
   */
  static async generateReportCard(
    studentResultId: string,
    templateId?: string,
    generatedBy?: string,
  ): Promise<ReportCard> {
    const supabase = await createClient();

    // Get student result with full details
    const { data: result } = await supabase
      .from("student_results")
      .select(
        `
        *,
        student:students(*),
        exam:exam_master(*),
        class:classes(*),
        section:sections(*),
        result_items:result_items(
          *,
          subject:subjects(*)
        ),
        rankings:student_rankings(*)
      `,
      )
      .eq("id", studentResultId)
      .single();

    if (!result) throw new Error("Result not found");

    // Get template
    let template = null;
    if (templateId) {
      template = await this.getTemplateById(templateId);
    } else {
      template = await this.getDefaultTemplate(result.student.school_id);
    }

    if (!template) throw new Error("No template available");

    // Generate PDF URL (placeholder - actual PDF generation would be implemented separately)
    const pdfUrl = await this.generatePDF(result, template);

    // Create report card record
    const { data: reportCard, error } = await supabase
      .from("report_cards")
      .insert({
        student_result_id: studentResultId,
        template_id: template.id,
        pdf_url: pdfUrl,
        generated_by: generatedBy || null,
        generated_at: new Date().toISOString(),
        status: "generated",
        metadata: {
          student_name: `${result.student.first_name} ${result.student.last_name}`,
          exam_name: result.exam.name,
          class_name: result.class.name,
        },
      })
      .select()
      .single();

    if (error) throw error;
    return reportCard;
  }

  /**
   * PDF generation placeholder
   */
  private static async generatePDF(
    result: any,
    template: ReportTemplate,
  ): Promise<string> {
    // This would integrate with a PDF generation library like:
    // - puppeteer
    // - react-pdf
    // - pdfkit
    // For now, return a placeholder URL
    return `/api/report-cards/${result.id}/download`;
  }

  /**
   * Bulk generate report cards for a class
   */
  static async bulkGenerateReportCards(
    examId: string,
    classId: string,
    sectionId?: string,
    templateId?: string,
    generatedBy?: string,
  ): Promise<ReportCard[]> {
    const supabase = await createClient();

    // Get all results
    let query = supabase
      .from("student_results")
      .select("id")
      .eq("exam_id", examId)
      .eq("class_id", classId)
      .eq("status", "published");

    if (sectionId) {
      query = query.eq("section_id", sectionId);
    }

    const { data: results } = await query;

    if (!results) return [];

    // Generate report cards
    const reportCards = await Promise.all(
      results.map((r) =>
        this.generateReportCard(r.id, templateId, generatedBy),
      ),
    );

    return reportCards;
  }

  /**
   * Get report card for a result
   */
  static async getReportCard(
    studentResultId: string,
  ): Promise<ReportCardWithDetails | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("report_cards")
      .select(
        `
        *,
        student_result:student_results(
          *,
          student:students(*),
          exam:exam_master(*)
        ),
        template:report_templates(*)
      `,
      )
      .eq("student_result_id", studentResultId)
      .order("generated_at", { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return data;
  }

  /**
   * Mark report card as sent to parent
   */
  static async markAsSent(reportCardId: string): Promise<ReportCard> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("report_cards")
      .update({
        is_sent_to_parent: true,
        sent_at: new Date().toISOString(),
        status: "sent",
      })
      .eq("id", reportCardId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Track download
   */
  static async trackDownload(reportCardId: string): Promise<void> {
    const supabase = await createClient();

    const { data: current } = await supabase
      .from("report_cards")
      .select("download_count")
      .eq("id", reportCardId)
      .single();

    await supabase
      .from("report_cards")
      .update({
        download_count: (current?.download_count || 0) + 1,
        last_downloaded_at: new Date().toISOString(),
        status: "downloaded",
      })
      .eq("id", reportCardId);
  }

  /**
   * Get report cards for a class
   */
  static async getClassReportCards(
    examId: string,
    classId: string,
    sectionId?: string,
  ): Promise<ReportCardWithDetails[]> {
    const supabase = await createClient();

    let query = supabase
      .from("report_cards")
      .select(
        `
        *,
        student_result:student_results!inner(
          *,
          student:students(*)
        ),
        template:report_templates(*)
      `,
      )
      .eq("student_result.exam_id", examId)
      .eq("student_result.class_id", classId);

    if (sectionId) {
      query = query.eq("student_result.section_id", sectionId);
    }

    const { data, error } = await query.order("generated_at", {
      ascending: false,
    });

    if (error) throw error;
    return data || [];
  }

  /**
   * Get report card statistics
   */
  static async getReportCardStats(examId: string, classId?: string) {
    const supabase = await createClient();

    let query = supabase
      .from("report_cards")
      .select(
        `
        status,
        is_sent_to_parent,
        student_result:student_results!inner(exam_id, class_id)
      `,
      )
      .eq("student_result.exam_id", examId);

    if (classId) {
      query = query.eq("student_result.class_id", classId);
    }

    const { data, error } = await query;

    if (error) throw error;

    return {
      total: data?.length || 0,
      generated: data?.filter((r) => r.status === "generated").length || 0,
      sent: data?.filter((r) => r.is_sent_to_parent).length || 0,
      downloaded: data?.filter((r) => r.status === "downloaded").length || 0,
    };
  }
}
