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

    // Create a ReadableStream for SSE
    const stream = new ReadableStream({
      async start(controller) {
        const sendEvent = (data: any) => {
          controller.enqueue(
            new TextEncoder().encode(`data: ${JSON.stringify(data)}\n\n`)
          );
        };

        let lastCheck = new Date();

        const pollInterval = setInterval(async () => {
          try {
            const requests = await db.serviceRequest.findMany({
              where: {
                table: {
                  restaurantId: restaurantId,
                },
                updatedAt: {
                  gte: lastCheck,
                },
              },
              include: {
                table: true,
              },
              orderBy: {
                updatedAt: 'desc',
              },
            });

            if (requests.length > 0) {
              requests.forEach((req) => {
                sendEvent({
                  type: 'REQUEST_UPDATE',
                  data: req,
                  timestamp: new Date().toISOString(),
                });
              });
            }

            lastCheck = new Date();
          } catch (error) {
            console.error('Error polling requests:', error);
            sendEvent({
              type: 'ERROR',
              message: 'Error fetching updates',
            });
          }
        }, 2000); // Poll every 2 seconds

        // Handle client disconnect
        request.signal.addEventListener('abort', () => {
          clearInterval(pollInterval);
          controller.close();
        });
      },
    });

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
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
