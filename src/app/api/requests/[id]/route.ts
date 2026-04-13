import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { ServiceRequestStatus } from '@prisma/client';

interface UpdateData {
  status: ServiceRequestStatus;
  acceptedAt?: Date;
  completedAt?: Date;
  staffId?: string;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Auth check — only staff/admin can update requests
  const session = await requireAuth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { status, staffId } = body;
    const id = params.id;

    if (!status) {
      return NextResponse.json(
        { error: 'status is required' },
        { status: 400 }
      );
    }

    // Validate status is a valid enum value
    const validStatuses: ServiceRequestStatus[] = [
      'PENDING',
      'ACCEPTED',
      'SNOOZED',
      'COMPLETED',
      'AUTO_COMPLETED',
    ];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    // Get current request
    const currentRequest = await db.serviceRequest.findUnique({
      where: { id },
    });

    if (!currentRequest) {
      return NextResponse.json(
        { error: 'Request not found' },
        { status: 404 }
      );
    }

    // Handle state transitions — typed update data
    const updateData: UpdateData = { status };

    if (currentRequest.status === 'PENDING' && status === 'ACCEPTED') {
      updateData.acceptedAt = new Date();
      if (staffId) {
        updateData.staffId = staffId;
      }
    } else if (
      (currentRequest.status === 'PENDING' || currentRequest.status === 'ACCEPTED') &&
      status === 'SNOOZED'
    ) {
      // Status set to SNOOZED
    } else if (currentRequest.status === 'SNOOZED' && status === 'PENDING') {
      // Auto-transition back to PENDING
      updateData.status = 'PENDING';
    } else if (currentRequest.status === 'ACCEPTED' && status === 'COMPLETED') {
      updateData.completedAt = new Date();
    }

    const updatedRequest = await db.serviceRequest.update({
      where: { id },
      data: updateData,
      include: {
        table: true,
      },
    });

    // Broadcast update to SSE clients
    const { sseManager } = await import('@/lib/sse');
    const restaurantId =
      updatedRequest.restaurantId || updatedRequest.table?.restaurantId;
    if (restaurantId) {
      sseManager.broadcast(restaurantId, 'REQUEST_UPDATE', updatedRequest);
    }

    return NextResponse.json(updatedRequest);
  } catch (error) {
    console.error('Error updating request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
