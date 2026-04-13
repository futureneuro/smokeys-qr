import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const restaurant = await db.restaurant.findFirst({
      include: {
        settingsRecord: true,
      },
    })

    if (!restaurant) {
      return NextResponse.json({ error: 'No restaurant found' }, { status: 404 })
    }

    return NextResponse.json(restaurant)
  } catch (error) {
    console.error('Error fetching restaurant:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
