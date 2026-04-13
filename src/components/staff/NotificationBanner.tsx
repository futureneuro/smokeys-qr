'use client'

import { useEffect } from 'react'
import { X, Bell } from 'lucide-react'

interface ServiceRequestWithTable {
  id: string
  tableId: string
  table: {
    id: string
    number: number
    restaurantId: string
  }
  type: string
  status: string
  createdAt: string | Date
  updatedAt: string | Date
  completedAt: string | Date | null
}

interface NotificationBannerProps {
  request: ServiceRequestWithTable
  onDismiss: () => void
}

export default function NotificationBanner({ request, onDismiss }: NotificationBannerProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss()
    }, 5000)

    return () => clearTimeout(timer)
  }, [onDismiss])

  return (
    <div className="fixed top-20 left-0 right-0 mx-auto max-w-md px-4 z-40 animate-in slide-in-from-top-2 duration-300">
      <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <Bell className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <p className="font-bold text-lg">New Request</p>
              <p className="text-orange-100 text-sm">Table {request.table.number} - {request.type}</p>
            </div>
          </div>
          <button
            onClick={onDismiss}
            className="ml-2 text-white hover:bg-white/20 p-1 rounded-lg transition-colors flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Animated bottom border */}
        <div className="h-1 bg-white/30 overflow-hidden">
          <div className="h-full bg-white animate-pulse" style={{
            animation: 'slideOut 5s linear forwards'
          }}></div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideOut {
          from {
            transform: translateX(-100%);
          }
          to {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  )
}
