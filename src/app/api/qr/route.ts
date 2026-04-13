import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import QRCode from 'qrcode';

export async function GET(request: NextRequest) {
  try {
    const tableId = request.nextUrl.searchParams.get('tableId');

    if (!tableId) {
      return NextResponse.json(
        { error: 'tableId query parameter is required' },
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

    // Generate QR code pointing to /scan/[tableId]
    const qrUrl = `/scan/${tableId}`;
    const qrDataUrl = (await (QRCode as any).toDataURL(qrUrl, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      margin: 1,
      width: 300,
    })) as string;

    // Convert data URL to buffer
    const base64Data = qrDataUrl.replace(/^data:image\/png;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Error generating QR code:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
