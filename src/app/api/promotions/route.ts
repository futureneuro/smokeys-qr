import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const restaurantId = request.nextUrl.searchParams.get('restaurantId');

    if (!restaurantId) {
      return NextResponse.json(
        { error: 'restaurantId query parameter is required' },
        { status: 400 }
      );
    }

    const now = new Date();

    const promotions = await db.promotion.findMany({
      where: {
        restaurantId: restaurantId,
        active: true,
        startDate: {
          lte: now,
        },
        endDate: {
          gte: now,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(promotions);
  } catch (error) {
    console.error('Error fetching promotions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      restaurantId,
      title,
      description,
      startDate,
      endDate,
      active,
    } = body;

    if (!restaurantId || !title || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'restaurantId, title, startDate, and endDate are required' },
        { status: 400 }
      );
    }

    // TODO: Add admin authorization check
    // For now, assume admin-only endpoint

    // Verify restaurant exists
    const restaurant = await db.restaurant.findUnique({
      where: { id: restaurantId },
    });

    if (!restaurant) {
      return NextResponse.json(
        { error: 'Restaurant not found' },
        { status: 404 }
      );
    }

    const newPromotion = await db.promotion.create({
      data: {
        restaurantId: restaurantId,
        title: title,
        description: description || null,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        active: active !== undefined ? active : true,
      },
    });

    return NextResponse.json(newPromotion, { status: 201 });
  } catch (error) {
    console.error('Error creating promotion:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
