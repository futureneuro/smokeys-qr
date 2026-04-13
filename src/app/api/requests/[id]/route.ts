import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Handle state transitions
    let updateData: any = { status };

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

    return NextResponse.json(updatedRequest);
  } catch (error) {
    console.error('Error updating request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
