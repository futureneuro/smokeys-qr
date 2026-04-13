import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  // Auth check — staff/admin can view reviews
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

    const reviews = await db.review.findMany({
      where: {
        restaurantId: restaurantId,
      },
      include: {
        table: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tableId, restaurantId, rating, feedback } = body;

    if (!tableId || !restaurantId || rating === undefined) {
      return NextResponse.json(
        { error: 'tableId, restaurantId, and rating are required' },
        { status: 400 }
      );
    }

    // Verify table exists
    const table = await db.table.findUnique({
      where: { id: tableId },
    });

    if (!table) {
      return NextResponse.json(
        { error: 'Table not found' },
        { status: 404 }
      );
    }

    const redirectedToGoogle = rating >= 4;

    const newReview = await db.review.create({
      data: {
        tableId: tableId,
        restaurantId: restaurantId,
        rating: parseInt(rating),
        feedback: feedback || null,
        redirectedToGoogle: redirectedToGoogle,
      },
      include: {
        table: true,
      },
    });

    return NextResponse.json(newReview, { status: 201 });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
