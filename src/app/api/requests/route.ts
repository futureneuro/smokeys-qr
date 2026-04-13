import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { sseManager } from '@/lib/sse';

export async function GET(request: NextRequest) {
  // Auth check — only staff/admin can view all requests
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

    // Verify staff belongs to this restaurant
    if ((session.user as any).restaurantId !== restaurantId) {
      return NextResponse.json(
        { error: 'Access denied — wrong restaurant' },
        { status: 403 }
      );
    }

    const requests = await db.serviceRequest.findMany({
      where: {
        table: {
          restaurantId: restaurantId,
        },
      },
      include: {
        table: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(requests);
  } catch (error) {
    console.error('Error fetching requests:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  // POST is public — customers create requests from QR scan page (no auth)
  try {
    const body = await request.json();
    const { tableId, type } = body;

    if (!tableId || !type) {
      return NextResponse.json(
        { error: 'tableId and type are required' },
        { status: 400 }
      );
    }

    // Get settings for throttle check
    const table = await db.table.findUnique({
      where: { id: tableId },
      include: { restaurant: true },
    });

    if (!table) {
      return NextResponse.json(
        { error: 'Table not found' },
        { status: 404 }
      );
    }

    // Validate type against active service options
    const validOption = await db.serviceRequestOption.findFirst({
      where: {
        restaurantId: table.restaurantId,
        label: type,
        active: true,
      },
    });

    if (!validOption) {
      return NextResponse.json(
        { error: 'Invalid service request type' },
        { status: 400 }
      );
    }

    // Get settings for throttle seconds
    const settings = await db.settings.findFirst({
      where: { restaurantId: table.restaurantId },
    });

    const throttleSeconds = settings?.throttleSeconds || 60;

    // Check if a recent request exists
    const cutoffTime = new Date(Date.now() - throttleSeconds * 1000);
    const recentRequest = await db.serviceRequest.findFirst({
      where: {
        tableId: tableId,
        type: type,
        createdAt: {
          gte: cutoffTime,
        },
      },
    });

    if (recentRequest) {
      return NextResponse.json(
        { error: 'Request already exists. Please wait before submitting again.' },
        { status: 429 }
      );
    }

    // Create the service request
    const newRequest = await db.serviceRequest.create({
      data: {
        tableId: tableId,
        type: type,
        status: 'PENDING',
        restaurantId: table.restaurantId,
      },
      include: {
        table: true,
      },
    });

    // Broadcast new request to SSE clients (staff dashboards)
    sseManager.broadcast(table.restaurantId, 'REQUEST_UPDATE', newRequest);

    return NextResponse.json(newRequest, { status: 201 });
  } catch (error) {
    console.error('Error creating request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
