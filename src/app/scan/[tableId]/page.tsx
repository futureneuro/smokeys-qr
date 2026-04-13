import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import ClientScanPage from '@/components/customer/ClientScanPage'

export const revalidate = 60

interface ScanPageProps {
  params: {
    tableId: string
  }
}

export default async function ScanPage({ params }: ScanPageProps) {
  const { tableId } = params

  // Fetch table with restaurant and settings
  const table = await db.table.findUnique({
    where: { id: tableId },
    include: {
      restaurant: true,
    },
  })

  if (!table) {
    notFound()
  }

  // Fetch service request options for this restaurant
  const serviceOptions = await db.serviceRequestOption.findMany({
    where: {
      restaurantId: table.restaurantId,
      active: true,
    },
    orderBy: {
      order: 'asc',
    },
  })

  // Fetch settings
  const settings = await db.settings.findFirst({
    where: {
      restaurantId: table.restaurantId,
    },
  })

  // Fetch promotions
  const now = new Date()
  const promotions = await db.promotion.findMany({
    where: {
      restaurantId: table.restaurantId,
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
  })

  return (
    <ClientScanPage
      table={table}
      serviceOptions={serviceOptions}
      settings={settings}
      promotions={promotions}
    />
  )
}
