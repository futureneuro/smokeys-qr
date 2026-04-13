import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const restaurantId = request.nextUrl.searchParams.get('restaurantId');
    const exportFormat = request.nextUrl.searchParams.get('export');

    if (!restaurantId) {
      return NextResponse.json(
        { error: 'restaurantId query parameter is required' },
        { status: 400 }
      );
    }

    const customers = await db.customerContact.findMany({
      where: {
        restaurantId: restaurantId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (exportFormat === 'csv') {
      // Generate CSV
      const headers = ['Name', 'Phone', 'Email', 'Consent', 'Created At'];
      const rows = customers.map((customer) => [
        `"${(customer.name || '').replace(/"/g, '""')}"`,
        `"${(customer.phone || '').replace(/"/g, '""')}"`,
        `"${(customer.email || '').replace(/"/g, '""')}"`,
        customer.consent ? 'Yes' : 'No',
        new Date(customer.createdAt).toISOString(),
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map((row) => row.join(',')),
      ].join('\n');

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition':
            'attachment; filename="customers.csv"',
        },
      });
    }

    return NextResponse.json(customers);
  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { restaurantId, tableId, name, phone, email, consent } = body;

    if (!restaurantId || !name || !phone || !email) {
      return NextResponse.json(
        { error: 'restaurantId, name, phone, and email are required' },
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

    // Verify table exists if provided
    if (tableId) {
      const table = await db.table.findUnique({
        where: { id: tableId },
      });

      if (!table) {
        return NextResponse.json(
          { error: 'Table not found' },
          { status: 404 }
        );
      }
    }

    const newCustomer = await db.customerContact.create({
      data: {
        restaurantId: restaurantId,
        tableId: tableId || null,
        name: name,
        phone: phone,
        email: email,
        consent: consent || false,
      },
    });

    return NextResponse.json(newCustomer, { status: 201 });
  } catch (error) {
    console.error('Error creating customer:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
