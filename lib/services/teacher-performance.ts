/**
 * Teacher Performance Management Service
 *
 * Handles performance reviews, ratings, feedback, goals tracking,
 * and comprehensive evaluation system.
 */

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";

type PerformanceReview =
  Database["public"]["Tables"]["performance_reviews"]["Row"];
type PerformanceReviewInsert =
  Database["public"]["Tables"]["performance_reviews"]["Insert"];
type PerformanceReviewUpdate =
  Database["public"]["Tables"]["performance_reviews"]["Update"];

export interface PerformanceReviewFilters {
  teacherId?: string;
  academicYearId?: string;
  reviewType?: "annual" | "mid_year" | "probation" | "special";
  status?: "draft" | "submitted" | "acknowledged" | "finalized";
  reviewerId?: string;
  minOverallRating?: number;
  maxOverallRating?: number;
  page?: number;
  limit?: number;
}

export interface ReviewData {
  teacherId: string;
  academicYearId: string;
  reviewPeriodStart: string;
  reviewPeriodEnd: string;
  reviewType?: "annual" | "mid_year" | "probation" | "special";

  // Ratings (1-5)
  teachingEffectiveness?: number;
  subjectKnowledge?: number;
  classroomManagement?: number;
  studentEngagement?: number;
  communicationSkills?: number;
  punctuality?: number;
  professionalDevelopment?: number;
  collaboration?: number;

  // Qualitative feedback
  strengths?: string;
  areasForImprovement?: string;
  goals?: string;
  achievements?: string;
  trainingRecommendations?: string;

  // Reviewer
  reviewedBy: string;
  reviewedAt?: string;

  attachments?: any[];
}

/**
 * Get performance reviews with filtering
 */
export async function getPerformanceReviews(
  schoolId: string,
  filters: PerformanceReviewFilters = {},
) {
  const supabase = await createClient();

  const {
    teacherId,
    academicYearId,
    reviewType,
    status,
    reviewerId,
    minOverallRating,
    maxOverallRating,
    page = 1,
    limit = 50,
  } = filters;

  let query = supabase
    .from("performance_reviews")
    .select(
      `
      *,
      teacher:teachers!performance_reviews_teacher_id_fkey(
        id,
        employee_id,
        first_name,
        last_name,
        email,
        department,
        designation
      ),
      reviewer:profiles!performance_reviews_reviewed_by_fkey(
        id,
        full_name,
        email
      ),
      academic_year:academic_years!performance_reviews_academic_year_id_fkey(
        id,
        name,
        start_date,
        end_date
      )
    `,
      { count: "exact" },
    )
    .eq("school_id", schoolId);

  // Filters
  if (teacherId) query = query.eq("teacher_id", teacherId);
  if (academicYearId) query = query.eq("academic_year_id", academicYearId);
  if (reviewType) query = query.eq("review_type", reviewType);
  if (status) query = query.eq("status", status);
  if (reviewerId) query = query.eq("reviewed_by", reviewerId);
  if (minOverallRating) query = query.gte("overall_rating", minOverallRating);
  if (maxOverallRating) query = query.lte("overall_rating", maxOverallRating);

  // Pagination
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  query = query.order("reviewed_at", { ascending: false }).range(from, to);

  const { data: reviews, error, count } = await query;

  if (error) throw error;

  return {
    reviews: reviews || [],
    total: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
  };
}

/**
 * Get review by ID
 */
export async function getReviewById(reviewId: string, schoolId: string) {
  const supabase = await createClient();

  const { data: review, error } = await supabase
    .from("performance_reviews")
    .select(
      `
      *,
      teacher:teachers!performance_reviews_teacher_id_fkey(
        id,
        employee_id,
        first_name,
        last_name,
        email,
        phone,
        department,
        designation,
        date_of_joining,
        experience_years
      ),
      reviewer:profiles!performance_reviews_reviewed_by_fkey(
        id,
        full_name,
        email
      ),
      academic_year:academic_years!performance_reviews_academic_year_id_fkey(
        id,
        name,
        start_date,
        end_date,
        is_active
      )
    `,
    )
    .eq("id", reviewId)
    .eq("school_id", schoolId)
    .single();

  if (error) throw error;
  return review;
}

/**
 * Create performance review
 */
export async function createPerformanceReview(
  schoolId: string,
  reviewData: ReviewData,
) {
  const supabase = await createClient();

  // Calculate overall rating as average
  const ratings = [
    reviewData.teachingEffectiveness,
    reviewData.subjectKnowledge,
    reviewData.classroomManagement,
    reviewData.studentEngagement,
    reviewData.communicationSkills,
    reviewData.punctuality,
    reviewData.professionalDevelopment,
    reviewData.collaboration,
  ].filter((r): r is number => r !== undefined && r !== null);

  const overallRating =
    ratings.length > 0
      ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
      : null;

  const { data: review, error } = await supabase
    .from("performance_reviews")
    .insert({
      school_id: schoolId,
      teacher_id: reviewData.teacherId,
      academic_year_id: reviewData.academicYearId,
      review_period_start: reviewData.reviewPeriodStart,
      review_period_end: reviewData.reviewPeriodEnd,
      review_type: reviewData.reviewType || "annual",
      teaching_effectiveness: reviewData.teachingEffectiveness || null,
      subject_knowledge: reviewData.subjectKnowledge || null,
      classroom_management: reviewData.classroomManagement || null,
      student_engagement: reviewData.studentEngagement || null,
      communication_skills: reviewData.communicationSkills || null,
      punctuality: reviewData.punctuality || null,
      professional_development: reviewData.professionalDevelopment || null,
      collaboration: reviewData.collaboration || null,
      overall_rating: overallRating,
      strengths: reviewData.strengths || null,
      areas_for_improvement: reviewData.areasForImprovement || null,
      goals: reviewData.goals || null,
      achievements: reviewData.achievements || null,
      training_recommendations: reviewData.trainingRecommendations || null,
      reviewed_by: reviewData.reviewedBy,
      reviewed_at: reviewData.reviewedAt || new Date().toISOString(),
      status: "draft",
      attachments: reviewData.attachments || [],
    })
    .select()
    .single();

  if (error) throw error;
  return review;
}

/**
 * Update performance review
 */
export async function updatePerformanceReview(
  reviewId: string,
  schoolId: string,
  updates: Partial<ReviewData>,
) {
  const supabase = await createClient();

  // Recalculate overall rating if individual ratings changed
  let overallRating = undefined;
  if (
    updates.teachingEffectiveness !== undefined ||
    updates.subjectKnowledge !== undefined ||
    updates.classroomManagement !== undefined ||
    updates.studentEngagement !== undefined ||
    updates.communicationSkills !== undefined ||
    updates.punctuality !== undefined ||
    updates.professionalDevelopment !== undefined ||
    updates.collaboration !== undefined
  ) {
    const ratings = [
      updates.teachingEffectiveness,
      updates.subjectKnowledge,
      updates.classroomManagement,
      updates.studentEngagement,
      updates.communicationSkills,
      updates.punctuality,
      updates.professionalDevelopment,
      updates.collaboration,
    ].filter((r): r is number => r !== undefined && r !== null);

    overallRating =
      ratings.length > 0
        ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
        : undefined;
  }

  const updateData: any = {};

  if (updates.reviewPeriodStart)
    updateData.review_period_start = updates.reviewPeriodStart;
  if (updates.reviewPeriodEnd)
    updateData.review_period_end = updates.reviewPeriodEnd;
  if (updates.reviewType) updateData.review_type = updates.reviewType;
  if (updates.teachingEffectiveness !== undefined)
    updateData.teaching_effectiveness = updates.teachingEffectiveness;
  if (updates.subjectKnowledge !== undefined)
    updateData.subject_knowledge = updates.subjectKnowledge;
  if (updates.classroomManagement !== undefined)
    updateData.classroom_management = updates.classroomManagement;
  if (updates.studentEngagement !== undefined)
    updateData.student_engagement = updates.studentEngagement;
  if (updates.communicationSkills !== undefined)
    updateData.communication_skills = updates.communicationSkills;
  if (updates.punctuality !== undefined)
    updateData.punctuality = updates.punctuality;
  if (updates.professionalDevelopment !== undefined)
    updateData.professional_development = updates.professionalDevelopment;
  if (updates.collaboration !== undefined)
    updateData.collaboration = updates.collaboration;
  if (overallRating !== undefined) updateData.overall_rating = overallRating;
  if (updates.strengths) updateData.strengths = updates.strengths;
  if (updates.areasForImprovement)
    updateData.areas_for_improvement = updates.areasForImprovement;
  if (updates.goals) updateData.goals = updates.goals;
  if (updates.achievements) updateData.achievements = updates.achievements;
  if (updates.trainingRecommendations)
    updateData.training_recommendations = updates.trainingRecommendations;
  if (updates.attachments) updateData.attachments = updates.attachments;

  const { data: review, error } = await supabase
    .from("performance_reviews")
    .update(updateData)
    .eq("id", reviewId)
    .eq("school_id", schoolId)
    .select()
    .single();

  if (error) throw error;
  return review;
}

/**
 * Submit review (change status from draft to submitted)
 */
export async function submitReview(
  reviewId: string,
  schoolId: string,
  reviewerId: string,
) {
  const supabase = await createClient();

  const { data: review, error } = await supabase
    .from("performance_reviews")
    .update({
      status: "submitted",
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", reviewId)
    .eq("school_id", schoolId)
    .select()
    .single();

  if (error) throw error;
  return review;
}

/**
 * Teacher acknowledges review
 */
export async function acknowledgeReview(
  reviewId: string,
  schoolId: string,
  teacherComments?: string,
) {
  const supabase = await createClient();

  const { data: review, error } = await supabase
    .from("performance_reviews")
    .update({
      status: "acknowledged",
      teacher_comments: teacherComments || null,
      teacher_acknowledged_at: new Date().toISOString(),
    })
    .eq("id", reviewId)
    .eq("school_id", schoolId)
    .select()
    .single();

  if (error) throw error;
  return review;
}

/**
 * Finalize review (lock it)
 */
export async function finalizeReview(reviewId: string, schoolId: string) {
  const supabase = await createClient();

  const { data: review, error } = await supabase
    .from("performance_reviews")
    .update({ status: "finalized" })
    .eq("id", reviewId)
    .eq("school_id", schoolId)
    .select()
    .single();

  if (error) throw error;
  return review;
}

/**
 * Get teacher's review history
 */
export async function getTeacherReviewHistory(
  teacherId: string,
  schoolId: string,
) {
  const supabase = await createClient();

  const { data: reviews, error } = await supabase
    .from("performance_reviews")
    .select(
      `
      *,
      reviewer:profiles!performance_reviews_reviewed_by_fkey(
        id,
        full_name
      ),
      academic_year:academic_years!performance_reviews_academic_year_id_fkey(
        id,
        name
      )
    `,
    )
    .eq("teacher_id", teacherId)
    .eq("school_id", schoolId)
    .order("reviewed_at", { ascending: false });

  if (error) throw error;
  return reviews || [];
}

/**
 * Get performance statistics
 */
export async function getPerformanceStats(
  schoolId: string,
  filters: {
    academicYearId?: string;
    department?: string;
  } = {},
) {
  const supabase = await createClient();

  let query = supabase
    .from("performance_reviews")
    .select(
      `
      *,
      teacher:teachers!performance_reviews_teacher_id_fkey(
        department
      )
    `,
    )
    .eq("school_id", schoolId)
    .eq("status", "finalized");

  if (filters.academicYearId) {
    query = query.eq("academic_year_id", filters.academicYearId);
  }

  const { data: reviews, error } = await query;

  if (error) throw error;

  if (!reviews || reviews.length === 0) {
    return {
      total: 0,
      averageOverallRating: 0,
      ratingDistribution: {},
      byDepartment: {},
      topPerformers: [],
    };
  }

  // Calculate statistics
  const ratings = reviews
    .map((r) => r.overall_rating)
    .filter((r): r is number => r !== null);

  const avgRating =
    ratings.length > 0
      ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
      : 0;

  // Rating distribution (1-5)
  const distribution: any = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  ratings.forEach((r) => {
    const rounded = Math.round(r);
    distribution[rounded] = (distribution[rounded] || 0) + 1;
  });

  // By department
  const byDepartment: any = {};
  reviews.forEach((review: any) => {
    const dept = review.teacher?.department || "Unknown";
    if (!byDepartment[dept]) {
      byDepartment[dept] = {
        count: 0,
        totalRating: 0,
      };
    }
    byDepartment[dept].count++;
    if (review.overall_rating) {
      byDepartment[dept].totalRating += review.overall_rating;
    }
  });

  Object.keys(byDepartment).forEach((dept) => {
    byDepartment[dept].averageRating =
      byDepartment[dept].totalRating / byDepartment[dept].count;
  });

  // Top performers (top 10 by overall rating)
  const topPerformers = reviews
    .filter((r) => r.overall_rating !== null)
    .sort((a, b) => (b.overall_rating || 0) - (a.overall_rating || 0))
    .slice(0, 10)
    .map((r: any) => ({
      teacherId: r.teacher_id,
      teacherName: `${r.teacher?.first_name} ${r.teacher?.last_name}`,
      department: r.teacher?.department,
      overallRating: r.overall_rating,
    }));

  return {
    total: reviews.length,
    averageOverallRating: Math.round(avgRating * 100) / 100,
    ratingDistribution: distribution,
    byDepartment,
    topPerformers,
  };
}

/**
 * Get pending reviews (draft or submitted, not acknowledged)
 */
export async function getPendingReviews(schoolId: string) {
  const supabase = await createClient();

  const { data: reviews, error } = await supabase
    .from("performance_reviews")
    .select(
      `
      *,
      teacher:teachers!performance_reviews_teacher_id_fkey(
        id,
        employee_id,
        first_name,
        last_name,
        department
      ),
      reviewer:profiles!performance_reviews_reviewed_by_fkey(
        id,
        full_name
      )
    `,
    )
    .eq("school_id", schoolId)
    .in("status", ["draft", "submitted"])
    .order("created_at", { ascending: true });

  if (error) throw error;
  return reviews || [];
}

/**
 * Get reviews awaiting teacher acknowledgment
 */
export async function getReviewsAwaitingAcknowledgment(schoolId: string) {
  const supabase = await createClient();

  const { data: reviews, error } = await supabase
    .from("performance_reviews")
    .select(
      `
      *,
      teacher:teachers!performance_reviews_teacher_id_fkey(
        id,
        employee_id,
        first_name,
        last_name,
        email
      )
    `,
    )
    .eq("school_id", schoolId)
    .eq("status", "submitted")
    .order("reviewed_at", { ascending: true });

  if (error) throw error;
  return reviews || [];
}

/**
 * Compare teacher performance over time
 */
export async function compareTeacherPerformance(
  teacherId: string,
  schoolId: string,
) {
  const supabase = await createClient();

  const { data: reviews, error } = await supabase
    .from("performance_reviews")
    .select(
      `
      id,
      overall_rating,
      teaching_effectiveness,
      subject_knowledge,
      classroom_management,
      student_engagement,
      communication_skills,
      punctuality,
      professional_development,
      collaboration,
      reviewed_at,
      academic_year:academic_years(name)
    `,
    )
    .eq("teacher_id", teacherId)
    .eq("school_id", schoolId)
    .eq("status", "finalized")
    .order("reviewed_at", { ascending: true });

  if (error) throw error;

  if (!reviews || reviews.length === 0) {
    return {
      history: [],
      trend: "stable",
      improvement: 0,
    };
  }

  // Calculate trend
  let trend = "stable";
  let improvement = 0;

  if (reviews.length >= 2) {
    const latest = reviews[reviews.length - 1].overall_rating || 0;
    const previous = reviews[reviews.length - 2].overall_rating || 0;
    improvement = latest - previous;

    if (improvement > 0.5) trend = "improving";
    else if (improvement < -0.5) trend = "declining";
  }

  return {
    history: reviews,
    trend,
    improvement: Math.round(improvement * 100) / 100,
  };
}

/**
 * Get department-wise performance comparison
 */
export async function getDepartmentPerformanceComparison(
  schoolId: string,
  academicYearId?: string,
) {
  const supabase = await createClient();

  let query = supabase
    .from("performance_reviews")
    .select(
      `
      overall_rating,
      teacher:teachers!performance_reviews_teacher_id_fkey(
        department
      )
    `,
    )
    .eq("school_id", schoolId)
    .eq("status", "finalized");

  if (academicYearId) {
    query = query.eq("academic_year_id", academicYearId);
  }

  const { data: reviews, error } = await query;

  if (error) throw error;

  const departments: any = {};

  reviews?.forEach((review: any) => {
    const dept = review.teacher?.department || "Unknown";
    if (!departments[dept]) {
      departments[dept] = {
        count: 0,
        totalRating: 0,
        ratings: [],
      };
    }
    departments[dept].count++;
    if (review.overall_rating) {
      departments[dept].totalRating += review.overall_rating;
      departments[dept].ratings.push(review.overall_rating);
    }
  });

  // Calculate averages and rankings
  const departmentStats = Object.keys(departments).map((dept) => {
    const data = departments[dept];
    const averageRating = data.totalRating / data.count;

    return {
      department: dept,
      teacherCount: data.count,
      averageRating: Math.round(averageRating * 100) / 100,
    };
  });

  // Sort by average rating descending
  departmentStats.sort((a, b) => b.averageRating - a.averageRating);

  return departmentStats;
}

/**
 * Delete review (only if draft)
 */
export async function deleteReview(reviewId: string, schoolId: string) {
  const supabase = await createClient();

  const { data: review } = await supabase
    .from("performance_reviews")
    .select("status")
    .eq("id", reviewId)
    .single();

  if (review && review.status !== "draft") {
    throw new Error("Can only delete draft reviews");
  }

  const { error } = await supabase
    .from("performance_reviews")
    .delete()
    .eq("id", reviewId)
    .eq("school_id", schoolId);

  if (error) throw error;

  return { success: true };
}
