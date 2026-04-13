import { NextRequest, NextResponse } from 'next/server';
import { sseManager } from '@/lib/sse';
import { requireAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  // Auth check — only staff/admin can subscribe to request stream
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

    // Create a ReadableStream for SSE using the push-based SSEManager
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        // Register this client with the SSE manager
        const wrappedController = {
          enqueue: (data: string) => {
            try {
              controller.enqueue(encoder.encode(data));
            } catch {
              // Stream closed — handle gracefully
            }
          },
        };

        sseManager.addClient(restaurantId, wrappedController as any);

        // Send initial heartbeat
        try {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'CONNECTED', timestamp: new Date().toISOString() })}\n\n`)
          );
        } catch {
          // Stream already closed
        }

        // Periodic heartbeat to keep connection alive (every 30s)
        const heartbeatInterval = setInterval(() => {
          try {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ type: 'HEARTBEAT', timestamp: new Date().toISOString() })}\n\n`)
            );
          } catch {
            clearInterval(heartbeatInterval);
          }
        }, 30000);

        // Handle client disconnect
        request.signal.addEventListener('abort', () => {
          clearInterval(heartbeatInterval);
          sseManager.removeClient(restaurantId, wrappedController as any);
          try {
            controller.close();
          } catch {
            // Already closed
          }
        });
      },
    });

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no', // Disable nginx buffering
      },
    });
  } catch (error) {
    console.error('Error setting up SSE:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
