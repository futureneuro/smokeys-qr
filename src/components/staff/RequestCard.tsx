'use client'

import { useState } from 'react'
import { Check, Pause, Clock, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatTimeAgo, getUrgencyLevel } from '@/lib/utils'

type ServiceRequestStatus = 'PENDING' | 'ACCEPTED' | 'SNOOZED' | 'COMPLETED' | 'AUTO_COMPLETED'

interface RequestCardProps {
  id: string
  tableNumber: number
  type: string
  status: ServiceRequestStatus
  createdAt: string | Date
  completedAt: string | Date | null
  onStatusChange: (id: string, newStatus: ServiceRequestStatus) => Promise<void>
}

export default function RequestCard({
  id,
  tableNumber,
  type,
  status,
  createdAt,
  completedAt: _completedAt,
  onStatusChange,
}: RequestCardProps) {
  const [isLoading, setIsLoading] = useState(false)
  const urgencyLevel = getUrgencyLevel(createdAt)
  const timeAgo = formatTimeAgo(createdAt)

  const handleStatusChange = async (newStatus: ServiceRequestStatus) => {
    setIsLoading(true)
    try {
      await onStatusChange(id, newStatus)
    } catch (error) {
      console.error('Failed to update status:', error)
      alert('Failed to update request status')
    } finally {
      setIsLoading(false)
    }
  }

  const urgencyColors = {
    normal: 'border-green-400 border-2',
    warning: 'border-yellow-400 border-2',
    urgent: 'border-red-500 border-2 shadow-lg shadow-red-500/50',
  }

  const urgencyBgColors = {
    normal: 'bg-green-50',
    warning: 'bg-yellow-50',
    urgent: 'bg-red-50',
  }


  return (
    <div
      className={cn(
        'rounded-lg p-4 transition-all hover:shadow-md',
        urgencyColors[urgencyLevel],
        urgencyBgColors[urgencyLevel]
      )}
    >
      {/* Urgent Pulse Animation */}
      {urgencyLevel === 'urgent' && (
        <div className="absolute inset-0 rounded-lg animate-pulse bg-red-500 opacity-5"></div>
      )}

      <div className="relative flex items-start justify-between">
        {/* Left: Table Number and Details */}
        <div className="flex-1">
          {/* Table Number - Large */}
          <div className="flex items-baseline space-x-3 mb-2">
            <h3 className="text-4xl font-bold text-gray-900">Table {tableNumber}</h3>
            {urgencyLevel === 'urgent' && <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>}
          </div>

          {/* Type and Time */}
          <div className="flex items-center space-x-4 text-sm text-gray-700">
            <span className="font-medium capitalize text-gray-900">{type}</span>
            <div className="flex items-center space-x-1 text-gray-500">
              <Clock className="w-4 h-4" />
              <span>{timeAgo}</span>
            </div>
          </div>

          {/* Urgency Indicator */}
          <div className="mt-2 flex items-center space-x-2">
            <div className={cn('w-2 h-2 rounded-full', urgencyColors[urgencyLevel].split(' ')[1])}>
              {urgencyLevel === 'urgent' && <div className="w-full h-full bg-red-500 rounded-full animate-pulse"></div>}
            </div>
            <span
              className={cn(
                'text-xs font-semibold uppercase tracking-wide',
                urgencyLevel === 'normal' && 'text-green-700',
                urgencyLevel === 'warning' && 'text-yellow-700',
                urgencyLevel === 'urgent' && 'text-red-700'
              )}
            >
              {urgencyLevel === 'normal' && 'Normal'}
              {urgencyLevel === 'warning' && 'Warning'}
              {urgencyLevel === 'urgent' && 'Urgent'}
            </span>
          </div>
        </div>

        {/* Right: Actions/Status */}
        <div className="ml-4 flex flex-col items-end space-y-2">
          {status === 'PENDING' && (
            <>
              <button
                onClick={() => handleStatusChange('ACCEPTED')}
                disabled={isLoading}
                className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg transition-colors"
              >
                <Check className="w-5 h-5" />
                <span>Accept</span>
              </button>
              <button
                onClick={() => handleStatusChange('SNOOZED')}
                disabled={isLoading}
                className="flex items-center space-x-2 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg transition-colors"
              >
                <Pause className="w-5 h-5" />
                <span>Snooze</span>
              </button>
            </>
          )}

          {status === 'ACCEPTED' && (
            <button
              onClick={() => handleStatusChange('COMPLETED')}
              disabled={isLoading}
              className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg transition-colors"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>Complete</span>
            </button>
          )}

          {status === 'SNOOZED' && (
            <div className="flex items-center space-x-2 bg-yellow-100 text-yellow-800 font-bold py-2 px-3 rounded-lg">
              <Pause className="w-4 h-4" />
              <span className="text-sm">Snoozed</span>
            </div>
          )}

          {(status === 'COMPLETED' || status === 'AUTO_COMPLETED') && (
            <div className="flex items-center space-x-2 bg-green-100 text-green-800 font-bold py-2 px-3 rounded-lg">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-sm">Done</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
