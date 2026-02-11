// Student Resources Service
// Handles learning resources, notes, and materials

import { createClient } from "@/lib/supabase/server";

export interface LearningResource {
  id: string;
  class_id: string;
  teacher_id: string;
  title: string;
  description?: string;
  resource_type: "document" | "video" | "link" | "slides" | "notes" | "ebook";
  file_url?: string;
  external_url?: string;
  file_size_bytes?: number;
  mime_type?: string;
  tags?: string[];
  is_public: boolean;
  download_count: number;
  view_count: number;
  created_at: string;
  isBookmarked?: boolean;
}

export interface ResourceBookmark {
  id: string;
  student_id: string;
  resource_id: string;
  notes?: string;
  created_at: string;
}

export const studentResourceService = {
  /**
   * Get all resources available to a student
   */
  async getStudentResources(studentId: string): Promise<LearningResource[]> {
    const supabase = await createClient();

    // Get student's enrolled classes
    const { data: enrollments } = await supabase
      .from("class_enrollments")
      .select("class_id")
      .eq("student_id", studentId)
      .eq("status", "active");

    if (!enrollments || enrollments.length === 0) {
      return [];
    }

    const classIds = enrollments.map((e: any) => e.class_id);

    // Get resources
    const { data: resources, error } = await supabase
      .from("learning_resources")
      .select(
        `
        *,
        class:classes (
          class_name,
          subject
        ),
        teacher:profiles!learning_resources_teacher_id_fkey (
          first_name,
          last_name
        ),
        bookmarks:resource_bookmarks!resource_bookmarks_resource_id_fkey (
          id,
          notes
        )
      `,
      )
      .in("class_id", classIds)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching resources:", error);
      return [];
    }

    // Mark bookmarked resources
    return (resources || []).map((resource: any) => ({
      ...resource,
      isBookmarked: resource.bookmarks?.length > 0,
    }));
  },

  /**
   * Get resources by type
   */
  async getResourcesByType(
    studentId: string,
    resourceType: string,
  ): Promise<LearningResource[]> {
    const resources = await this.getStudentResources(studentId);
    return resources.filter((r) => r.resource_type === resourceType);
  },

  /**
   * Get resources by class
   */
  async getResourcesByClass(
    studentId: string,
    classId: string,
  ): Promise<LearningResource[]> {
    const supabase = await createClient();

    const { data: resources, error } = await supabase
      .from("learning_resources")
      .select(
        `
        *,
        class:classes (
          class_name,
          subject
        ),
        teacher:profiles!learning_resources_teacher_id_fkey (
          first_name,
          last_name
        )
      `,
      )
      .eq("class_id", classId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching class resources:", error);
      return [];
    }

    return resources || [];
  },

  /**
   * Get bookmarked resources
   */
  async getBookmarkedResources(studentId: string): Promise<LearningResource[]> {
    const supabase = await createClient();

    const { data: bookmarks, error } = await supabase
      .from("resource_bookmarks")
      .select(
        `
        *,
        resource:learning_resources (
          *,
          class:classes (
            class_name,
            subject
          ),
          teacher:profiles!learning_resources_teacher_id_fkey (
            first_name,
            last_name
          )
        )
      `,
      )
      .eq("student_id", studentId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching bookmarks:", error);
      return [];
    }

    return (bookmarks || []).map((b: any) => ({
      ...b.resource,
      isBookmarked: true,
      bookmarkNotes: b.notes,
    }));
  },

  /**
   * Bookmark a resource
   */
  async bookmarkResource(
    studentId: string,
    resourceId: string,
    notes?: string,
  ): Promise<boolean> {
    const supabase = await createClient();

    const { error } = await supabase.from("resource_bookmarks").insert({
      student_id: studentId,
      resource_id: resourceId,
      notes,
    });

    if (error) {
      console.error("Error bookmarking resource:", error);
      return false;
    }

    return true;
  },

  /**
   * Remove bookmark
   */
  async removeBookmark(
    studentId: string,
    resourceId: string,
  ): Promise<boolean> {
    const supabase = await createClient();

    const { error } = await supabase
      .from("resource_bookmarks")
      .delete()
      .eq("student_id", studentId)
      .eq("resource_id", resourceId);

    if (error) {
      console.error("Error removing bookmark:", error);
      return false;
    }

    return true;
  },

  /**
   * Update bookmark notes
   */
  async updateBookmarkNotes(
    studentId: string,
    resourceId: string,
    notes: string,
  ): Promise<boolean> {
    const supabase = await createClient();

    const { error } = await supabase
      .from("resource_bookmarks")
      .update({ notes })
      .eq("student_id", studentId)
      .eq("resource_id", resourceId);

    if (error) {
      console.error("Error updating bookmark notes:", error);
      return false;
    }

    return true;
  },

  /**
   * Increment view count
   */
  async incrementViewCount(resourceId: string): Promise<void> {
    const supabase = await createClient();

    await supabase.rpc("increment_resource_views", {
      resource_id: resourceId,
    });
  },

  /**
   * Increment download count
   */
  async incrementDownloadCount(resourceId: string): Promise<void> {
    const supabase = await createClient();

    await supabase.rpc("increment_resource_downloads", {
      resource_id: resourceId,
    });
  },

  /**
   * Search resources
   */
  async searchResources(
    studentId: string,
    searchQuery: string,
  ): Promise<LearningResource[]> {
    const resources = await this.getStudentResources(studentId);

    const query = searchQuery.toLowerCase();

    return resources.filter(
      (resource) =>
        resource.title.toLowerCase().includes(query) ||
        resource.description?.toLowerCase().includes(query) ||
        resource.tags?.some((tag) => tag.toLowerCase().includes(query)),
    );
  },

  /**
   * Filter resources by tags
   */
  async filterByTags(
    studentId: string,
    tags: string[],
  ): Promise<LearningResource[]> {
    const resources = await this.getStudentResources(studentId);

    return resources.filter((resource) =>
      resource.tags?.some((tag) => tags.includes(tag)),
    );
  },

  /**
   * Get recently added resources
   */
  async getRecentResources(
    studentId: string,
    limit: number = 10,
  ): Promise<LearningResource[]> {
    const resources = await this.getStudentResources(studentId);
    return resources.slice(0, limit);
  },

  /**
   * Get resource statistics
   */
  async getResourceStats(studentId: string): Promise<any> {
    const resources = await this.getStudentResources(studentId);
    const bookmarks = await this.getBookmarkedResources(studentId);

    const stats = {
      total: resources.length,
      bookmarked: bookmarks.length,
      byType: {} as Record<string, number>,
      recentlyAdded: 0,
    };

    // Count by type
    resources.forEach((resource) => {
      const type = resource.resource_type;
      stats.byType[type] = (stats.byType[type] || 0) + 1;
    });

    // Recently added (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    stats.recentlyAdded = resources.filter(
      (r) => new Date(r.created_at) > sevenDaysAgo,
    ).length;

    return stats;
  },
};
