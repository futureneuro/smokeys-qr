'use client'

import { useState } from 'react'
import { ServiceRequestOption } from '@prisma/client'
import {
  Bell,
  Receipt,
  Wine,
  HelpCircle,
  Clock,
  Utensils,
  AlertCircle,
} from 'lucide-react'

interface ActionButtonsProps {
  tableId: string
  serviceOptions: ServiceRequestOption[]
  onSuccess: (message: string) => void
  onError: (message: string) => void
}

const iconMap: Record<string, React.ComponentType<{ size: number; className: string }>> = {
  'Call Waiter': Bell,
  'Request Bill': Receipt,
  'Order Drinks': Wine,
  'Need Help': HelpCircle,
  'Check Wait': Clock,
  'Order Food': Utensils,
  'Issue': AlertCircle,
}

export default function ActionButtons({
  tableId,
  serviceOptions,
  onSuccess,
  onError,
}: ActionButtonsProps) {
  const [loading, setLoading] = useState<Record<string, boolean>>({})
  const [cooldown, setCooldown] = useState<Record<string, number>>({})

  const handleRequest = async (option: ServiceRequestOption) => {
    if (cooldown[option.id]) {
      onError('Please wait before making another request')
      return
    }

    setLoading((prev) => ({ ...prev, [option.id]: true }))

    try {
      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableId,
          type: option.label,
        }),
      })

      if (response.status === 429) {
        onError('Please wait before making another request of this type')
        setLoading((prev) => ({ ...prev, [option.id]: false }))
        return
      }

      if (!response.ok) {
        throw new Error('Failed to submit request')
      }

      onSuccess(`${option.label} request sent!`)

      // Set cooldown
      setCooldown((prev) => ({ ...prev, [option.id]: 3 }))
      const interval = setInterval(() => {
        setCooldown((prev) => {
          const newCooldown = { ...prev }
          if (newCooldown[option.id] > 1) {
            newCooldown[option.id]--
          } else {
            delete newCooldown[option.id]
            clearInterval(interval)
          }
          return newCooldown
        })
      }, 1000)
    } catch (error) {
      console.error('Error submitting request:', error)
      onError('Failed to submit request. Please try again.')
    } finally {
      setLoading((prev) => ({ ...prev, [option.id]: false }))
    }
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      {serviceOptions.map((option) => {
        const IconComponent = option.icon
          ? iconMap[option.label] || HelpCircle
          : HelpCircle
        const isLoading = loading[option.id]
        const cooldownTime = cooldown[option.id]
        const isDisabled = isLoading || cooldownTime > 0

        return (
          <button
            key={option.id}
            onClick={() => handleRequest(option)}
            disabled={isDisabled}
            className={`relative flex flex-col items-center justify-center gap-2 p-6 rounded-2xl border-2 font-semibold text-[#f5f5f5] transition-all duration-200 active:scale-95 ${
              isDisabled
                ? 'bg-gradient-to-br from-[#ccc] to-[#aaa] border-[#999] cursor-not-allowed opacity-70'
                : 'bg-gradient-to-br from-[#ff6b35] to-[#d4af37] border-[#ff6b35] hover:shadow-lg hover:scale-105'
            }`}
          >
            <IconComponent size={32} className="text-[#f5f5f5]" />
            <span className="text-sm font-bold text-center leading-tight max-w-[100px]">
              {option.label}
            </span>
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-2xl">
                <div className="animate-spin h-6 w-6 border-2 border-[#f5f5f5] border-t-transparent rounded-full"></div>
              </div>
            )}
            {cooldownTime && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-2xl">
                <span className="text-lg font-bold text-[#f5f5f5]">{cooldownTime}s</span>
              </div>
            )}
          </button>
        )
      })}
    </div>
  )
}
