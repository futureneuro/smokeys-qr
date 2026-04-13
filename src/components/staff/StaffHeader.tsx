'use client'

import { Wifi, WifiOff, Bell, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StaffHeaderProps {
  connected: boolean
  pendingCount: number
  acceptedCount: number
}

export default function StaffHeader({ connected, pendingCount, acceptedCount }: StaffHeaderProps) {
  const urgentCount = pendingCount > 0 ? pendingCount : 0

  return (
    <header className="bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Title and Icon */}
          <div className="flex items-center space-x-3">
            <Bell className="w-8 h-8" />
            <div>
              <h1 className="text-2xl font-bold">Staff Dashboard</h1>
              <p className="text-orange-100 text-sm">Real-time service requests</p>
            </div>
          </div>

          {/* Status and Badges */}
          <div className="flex items-center space-x-6">
            {/* Connection Status */}
            <div className="flex items-center space-x-2">
              {connected ? (
                <>
                  <div className="flex items-center space-x-1 bg-green-500 px-3 py-1 rounded-full">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium">Connected</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center space-x-1 bg-red-500 px-3 py-1 rounded-full">
                    <WifiOff className="w-4 h-4" />
                    <span className="text-sm font-medium">Disconnected</span>
                  </div>
                </>
              )}
            </div>

            {/* Request Badges */}
            {urgentCount > 0 && (
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1 bg-red-500 px-3 py-1 rounded-full">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-sm font-bold">{urgentCount} Pending</span>
                </div>
              </div>
            )}

            {acceptedCount > 0 && (
              <div className="flex items-center space-x-1 bg-yellow-500 px-3 py-1 rounded-full">
                <span className="text-sm font-bold">{acceptedCount} Accepted</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
