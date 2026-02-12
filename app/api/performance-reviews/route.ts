import { NextRequest, NextResponse } from "next/server";
import { getCurrentSchoolId } from "@/lib/auth/get-current-school";
import { getCurrentUserId } from "@/lib/auth/get-current-user";
import {
  getPerformanceReviews,
  getReviewById,
  createPerformanceReview,
  updatePerformanceReview,
  submitReview,
  acknowledgeReview,
  finalizeReview,
  deleteReview,
  getPendingReviews,
  getReviewsAwaitingAcknowledgment,
  getPerformanceStats,
} from "@/lib/services/teacher-performance";

/**
 * GET /api/performance-reviews
 * Get performance reviews with filtering
 */
export async function GET(request: NextRequest) {
  try {
    const schoolId = await getCurrentSchoolId();
    if (!schoolId) {
      return NextResponse.json({ error: "School not found" }, { status: 404 });
    }

    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get("action");
    const reviewId = searchParams.get("reviewId");

    // Get single review
    if (reviewId) {
      const review = await getReviewById(reviewId, schoolId);
      return NextResponse.json(review);
    }

    // Get pending reviews (drafts and submitted)
    if (action === "pending") {
      const pendingReviews = await getPendingReviews(schoolId);
      return NextResponse.json(pendingReviews);
    }

    // Get reviews awaiting acknowledgment
    if (action === "awaiting_acknowledgment") {
      const awaitingReviews = await getReviewsAwaitingAcknowledgment(schoolId);
      return NextResponse.json(awaitingReviews);
    }

    // Get performance statistics
    if (action === "stats") {
      const stats = await getPerformanceStats(schoolId, {
        academicYearId: searchParams.get("academicYearId") || undefined,
        department: searchParams.get("department") || undefined,
      });
      return NextResponse.json(stats);
    }

    // Get all reviews with filters
    const filters = {
      teacherId: searchParams.get("teacherId") || undefined,
      academicYearId: searchParams.get("academicYearId") || undefined,
      reviewType: (searchParams.get("reviewType") as any) || undefined,
      status: (searchParams.get("status") as any) || undefined,
      reviewerId: searchParams.get("reviewerId") || undefined,
      minOverallRating: searchParams.get("minOverallRating")
        ? parseFloat(searchParams.get("minOverallRating")!)
        : undefined,
      maxOverallRating: searchParams.get("maxOverallRating")
        ? parseFloat(searchParams.get("maxOverallRating")!)
        : undefined,
      page: searchParams.get("page") ? parseInt(searchParams.get("page")!) : 1,
      limit: searchParams.get("limit")
        ? parseInt(searchParams.get("limit")!)
        : 50,
    };

    const result = await getPerformanceReviews(schoolId, filters);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error fetching performance reviews:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch performance reviews" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/performance-reviews
 * Create or update performance review
 */
export async function POST(request: NextRequest) {
  try {
    const schoolId = await getCurrentSchoolId();
    if (!schoolId) {
      return NextResponse.json({ error: "School not found" }, { status: 404 });
    }

    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const { action, reviewId, ...data } = body;

    // Create new review
    if (!action || action === "create") {
      if (
        !data.teacherId ||
        !data.academicYearId ||
        !data.reviewPeriodStart ||
        !data.reviewPeriodEnd
      ) {
        return NextResponse.json(
          { error: "Missing required review fields" },
          { status: 400 },
        );
      }

      const reviewData = {
        ...data,
        reviewedBy: userId,
      };

      const review = await createPerformanceReview(schoolId, reviewData);
      return NextResponse.json(review, { status: 201 });
    }

    // Other actions require reviewId
    if (!reviewId) {
      return NextResponse.json(
        { error: "Review ID required" },
        { status: 400 },
      );
    }

    let result;

    switch (action) {
      case "update":
        result = await updatePerformanceReview(reviewId, schoolId, data);
        break;

      case "submit":
        result = await submitReview(reviewId, schoolId, userId);
        break;

      case "acknowledge":
        result = await acknowledgeReview(
          reviewId,
          schoolId,
          data.teacherComments,
        );
        break;

      case "finalize":
        result = await finalizeReview(reviewId, schoolId);
        break;

      default:
        return NextResponse.json(
          { error: `Invalid action: ${action}` },
          { status: 400 },
        );
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error processing performance review:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process performance review" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/performance-reviews
 * Delete draft review
 */
export async function DELETE(request: NextRequest) {
  try {
    const schoolId = await getCurrentSchoolId();
    if (!schoolId) {
      return NextResponse.json({ error: "School not found" }, { status: 404 });
    }

    const searchParams = request.nextUrl.searchParams;
    const reviewId = searchParams.get("reviewId");

    if (!reviewId) {
      return NextResponse.json(
        { error: "Review ID required" },
        { status: 400 },
      );
    }

    await deleteReview(reviewId, schoolId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting review:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete review" },
      { status: 500 },
    );
  }
}
