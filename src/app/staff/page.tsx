'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { AlertTriangle } from 'lucide-react'
import StaffHeader from '@/components/staff/StaffHeader'
import RequestList from '@/components/staff/RequestList'
import NotificationBanner from '@/components/staff/NotificationBanner'
import { cn } from '@/lib/utils'

type ServiceRequestStatus = 'PENDING' | 'ACCEPTED' | 'SNOOZED' | 'COMPLETED' | 'AUTO_COMPLETED'

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

type FilterTab = 'all' | 'pending' | 'accepted' | 'snoozed'

export default function StaffPage() {
  const [requests, setRequests] = useState<ServiceRequestWithTable[]>([])
  const [filter, setFilter] = useState<FilterTab>('all')
  const [connected, setConnected] = useState(false)
  const [loading, setLoading] = useState(true)
  const [newRequestAlert, setNewRequestAlert] = useState<ServiceRequestWithTable | null>(null)
  const [restaurantId, setRestaurantId] = useState<string>('')
  const [sseError, setSSEError] = useState<boolean>(false)
  const eventSourceRef = useRef<EventSource | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const retryCountRef = useRef<number>(0)

  // Initialize audio
  useEffect(() => {
    audioRef.current = new Audio(
      'data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAAAAA=='
    )
  }, [])

  // Fetch first restaurant dynamically
  useEffect(() => {
    fetch('/api/restaurant')
      .then((res) => res.json())
      .then((data) => {
        if (data.id) setRestaurantId(data.id)
      })
      .catch((err) => console.error('Failed to fetch restaurant:', err))
  }, [])

  // Fetch initial requests
  const fetchRequests = useCallback(async () => {
    if (!restaurantId) return

    try {
      const response = await fetch(`/api/requests?restaurantId=${restaurantId}`)
      if (response.ok) {
        const data = await response.json()
        setRequests(data)
      }
    } catch (error) {
      console.error('Failed to fetch requests:', error)
    } finally {
      setLoading(false)
    }
  }, [restaurantId])

  useEffect(() => {
    fetchRequests()
  }, [fetchRequests])

  // Setup SSE connection
  useEffect(() => {
    if (!restaurantId) return

    const setupSSE = () => {
      try {
        const eventSource = new EventSource(`/api/requests/stream?restaurantId=${restaurantId}`)
        eventSourceRef.current = eventSource

        eventSource.onopen = () => {
          setConnected(true)
        }

        eventSource.onmessage = (event) => {
          try {
            const parsed = JSON.parse(event.data)
            if (parsed.type === 'REQUEST_UPDATE') {
              const updatedRequest = parsed.data

              setRequests((prev) => {
                const existing = prev.find((r) => r.id === updatedRequest.id)
                if (!existing) {
                  // New request - play sound and show alert
                  playNotificationSound()
                  setNewRequestAlert(updatedRequest)
                  return [updatedRequest, ...prev]
                } else {
                  // Update existing request
                  return prev.map((r) => (r.id === updatedRequest.id ? updatedRequest : r))
                }
              })
            }
          } catch (error) {
            console.error('Failed to parse SSE message:', error)
          }
        }

        eventSource.onerror = () => {
          setConnected(false)
          eventSource.close()
          retryCountRef.current += 1

          if (retryCountRef.current >= 3) {
            // After 3 failed reconnections, show error banner
            setSSEError(true)
          } else {
            // Attempt to reconnect after 3 seconds
            setTimeout(setupSSE, 3000)
          }
        }
      } catch (error) {
        console.error('Failed to setup SSE:', error)
        setConnected(false)
      }
    }

    setupSSE()

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
      }
    }
  }, [restaurantId])

  const handleRefreshPage = () => {
    retryCountRef.current = 0
    setSSEError(false)
    window.location.reload()
  }

  const playNotificationSound = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0
      audioRef.current.play().catch((err) => console.error('Audio play failed:', err))
    }
  }, [])

  const pendingCount = requests.filter((r) => r.status === 'PENDING').length
  const acceptedCount = requests.filter((r) => r.status === 'ACCEPTED').length

  const filterTabs: { label: string; value: FilterTab; count?: number }[] = [
    { label: 'All', value: 'all', count: requests.length },
    { label: 'Pending', value: 'pending', count: pendingCount },
    { label: 'Accepted', value: 'accepted', count: acceptedCount },
    { label: 'Snoozed', value: 'snoozed', count: requests.filter((r) => r.status === 'SNOOZED').length },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <StaffHeader connected={connected} pendingCount={pendingCount} acceptedCount={acceptedCount} />

      {sseError && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 m-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-red-500" size={20} />
            <div>
              <p className="font-semibold text-red-800">Connection Error</p>
              <p className="text-sm text-red-700">Unable to establish real-time connection after multiple attempts</p>
            </div>
          </div>
          <button
            onClick={handleRefreshPage}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded font-medium whitespace-nowrap ml-4"
          >
            Refresh Page
          </button>
        </div>
      )}

      {newRequestAlert && <NotificationBanner request={newRequestAlert} onDismiss={() => setNewRequestAlert(null)} />}

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Filter Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <div className="flex space-x-1 overflow-x-auto">
            {filterTabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setFilter(tab.value)}
                className={cn(
                  'px-4 py-3 font-medium text-sm whitespace-nowrap transition-colors border-b-2',
                  filter === tab.value
                    ? 'border-orange-500 text-orange-600 bg-orange-50'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                )}
              >
                {tab.label}
                {tab.count !== undefined && (
                  <span
                    className={cn(
                      'ml-2 px-2 py-1 rounded-full text-xs font-bold',
                      filter === tab.value ? 'bg-orange-200 text-orange-800' : 'bg-gray-200 text-gray-700'
                    )}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-500">Loading requests...</div>
          </div>
        ) : (
          <RequestList requests={requests} filter={filter} onRequestsUpdate={setRequests} />
        )}
      </main>
    </div>
  )
}
