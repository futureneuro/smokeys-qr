import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  // Auth check — only staff/admin can view analytics
  const session = await requireAuth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const restaurantId = request.nextUrl.searchParams.get('restaurantId');

    if (!restaurantId) {
      return NextResponse.json(
        { error: 'restaurantId query parameter is required' },
        { status: 400 }
      );
    }

    // Get all requests for this restaurant
    const requests = await db.serviceRequest.findMany({
      where: {
        table: {
          restaurantId: restaurantId,
        },
      },
      include: {
        table: true,
      },
    });

    // Calculate total requests
    const totalRequests = requests.length;

    // Calculate average response time (acceptedAt - createdAt)
    const completedRequests = requests.filter(
      (r) => r.acceptedAt && r.completedAt
    );
    const responseTimesMs = completedRequests.map(
      (r) =>
        (new Date(r.acceptedAt!).getTime() -
          new Date(r.createdAt).getTime()) /
        1000
    );
    const avgResponseTime =
      responseTimesMs.length > 0
        ? responseTimesMs.reduce((a, b) => a + b, 0) / responseTimesMs.length
        : 0;

    // Group requests by type
    const requestsByType: Record<string, number> = {};
    requests.forEach((r) => {
      requestsByType[r.type] = (requestsByType[r.type] || 0) + 1;
    });

    // Group requests by hour
    const requestsByHour: Record<number, number> = {};
    requests.forEach((r) => {
      const hour = new Date(r.createdAt).getHours();
      requestsByHour[hour] = (requestsByHour[hour] || 0) + 1;
    });

    // Get review stats
    const reviews = await db.review.findMany({
      where: {
        restaurantId: restaurantId,
      },
    });

    const avgRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

    const totalReviews = reviews.length;

    // Get customer capture count
    const customerCount = await db.customerContact.count({
      where: {
        restaurantId: restaurantId,
      },
    });

    const analytics = {
      totalRequests,
      avgResponseTime: parseFloat(avgResponseTime.toFixed(2)),
      requestsByType,
      requestsByHour,
      reviewStats: {
        totalReviews,
        avgRating: parseFloat(avgRating.toFixed(2)),
      },
      customerCaptureCount: customerCount,
    };

    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
