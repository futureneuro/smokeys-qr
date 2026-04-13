import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth, requireAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  // Auth check — staff/admin can view tables
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

    const tables = await db.table.findMany({
      where: {
        restaurantId: restaurantId,
      },
      orderBy: {
        number: 'asc',
      },
    });

    return NextResponse.json(tables);
  } catch (error) {
    console.error('Error fetching tables:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  // Admin-only — only admins can create tables
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized — admin only' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { number, restaurantId } = body;

    if (!number || !restaurantId) {
      return NextResponse.json(
        { error: 'number and restaurantId are required' },
        { status: 400 }
      );
    }

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

    const newTable = await db.table.create({
      data: {
        number: parseInt(number),
        restaurantId: restaurantId,
      },
    });

    return NextResponse.json(newTable, { status: 201 });
  } catch (error) {
    console.error('Error creating table:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
