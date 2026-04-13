'use client'

import { useMemo } from 'react'
import RequestCard from './RequestCard'
import { getUrgencyLevel } from '@/lib/utils'

type ServiceRequestStatus = 'PENDING' | 'ACCEPTED' | 'SNOOZED' | 'COMPLETED' | 'AUTO_COMPLETED'
type FilterTab = 'all' | 'pending' | 'accepted' | 'snoozed'

interface ServiceRequestWithTable {
  id: string
  tableId: string
  table: {
    id: string
    number: number
    restaurantId: string
  }
  type: string
  status: ServiceRequestStatus
  createdAt: string | Date
  updatedAt: string | Date
  completedAt: string | Date | null
  staffId?: string | null
  acceptedAt?: string | Date | null
}

interface RequestListProps {
  requests: ServiceRequestWithTable[]
  filter: FilterTab
  onRequestsUpdate: (requests: ServiceRequestWithTable[]) => void
}

export default function RequestList({ requests, filter, onRequestsUpdate }: RequestListProps) {
  // Filter requests based on selected tab
  const filteredRequests = useMemo(() => {
    // Filter out AUTO_COMPLETED items so they don't clog up the dashboard
    let filtered = requests.filter((r) => r.status !== 'AUTO_COMPLETED')

    if (filter === 'pending') {
      filtered = filtered.filter((r) => r.status === 'PENDING')
    } else if (filter === 'accepted') {
      filtered = filtered.filter((r) => r.status === 'ACCEPTED')
    } else if (filter === 'snoozed') {
      filtered = filtered.filter((r) => r.status === 'SNOOZED')
    }

    // Sort by urgency (urgent first, then warning, then normal) and by creation time
    return filtered.sort((a, b) => {
      const urgencyOrder = { urgent: 0, warning: 1, normal: 2 }
      
      const aUrgency = (a.status === 'COMPLETED' || a.status === 'SNOOZED') ? 2 : urgencyOrder[getUrgencyLevel(a.createdAt)]
      const bUrgency = (b.status === 'COMPLETED' || b.status === 'SNOOZED') ? 2 : urgencyOrder[getUrgencyLevel(b.createdAt)]

      if (aUrgency !== bUrgency) {
        return aUrgency - bUrgency
      }

      // Sort by creation time (newer first)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })
  }, [requests, filter])

  const handleStatusChange = async (id: string, newStatus: ServiceRequestStatus) => {
    try {
      const response = await fetch(`/api/requests/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error('Failed to update request')
      }

      const updatedRequest = await response.json()

      // Update the local state
      onRequestsUpdate(
        requests.map((r) => (r.id === id ? updatedRequest : r))
      )
    } catch (error) {
      console.error('Error updating request status:', error)
      throw error
    }
  }

  const handleClearTable = async (tableId: string) => {
    try {
      const tableRequests = requests.filter(
        (r) => r.tableId === tableId && r.status !== 'AUTO_COMPLETED' && r.status !== 'PENDING' && r.status !== 'ACCEPTED'
      )
      
      await Promise.all(
        tableRequests.map((r) => 
          fetch(`/api/requests/${r.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'AUTO_COMPLETED' }),
          })
        )
      )

      // Update locally
      const updatedIds = new Set(tableRequests.map((r) => r.id))
      onRequestsUpdate(
        requests.map((r) => (updatedIds.has(r.id) ? { ...r, status: 'AUTO_COMPLETED' } : r))
      )
    } catch (error) {
      console.error('Error clearing table history:', error)
      alert('Failed to clear table history')
      throw error
    }
  }

  if (filteredRequests.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-block">
          <div className="text-gray-400 mb-3">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-1">No requests</h3>
          <p className="text-gray-500">
            {filter === 'all' && 'Waiting for customers to place requests...'}
            {filter === 'pending' && 'No pending requests at the moment.'}
            {filter === 'accepted' && 'No accepted requests.'}
            {filter === 'snoozed' && 'No snoozed requests.'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {filteredRequests.map((request) => (
        <RequestCard
          key={request.id}
          id={request.id}
          tableId={request.tableId}
          tableNumber={request.table.number}
          type={request.type}
          status={request.status}
          createdAt={request.createdAt}
          completedAt={request.completedAt}
          onStatusChange={handleStatusChange}
          onClearTable={handleClearTable}
        />
      ))}
    </div>
  )
}
