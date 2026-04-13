import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTimeAgo(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const seconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000)

  if (seconds < 60) return `${Math.floor(seconds)}s ago`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

export function getUrgencyLevel(
  createdAt: Date | string
): 'normal' | 'warning' | 'urgent' {
  const dateObj = typeof createdAt === 'string' ? new Date(createdAt) : createdAt
  const now = new Date()
  const minutes = Math.floor((now.getTime() - dateObj.getTime()) / 60000)

  if (minutes < 2) return 'normal'
  if (minutes < 5) return 'warning'
  return 'urgent'
}

export function formatPhoneForWhatsApp(phone: string): string {
  return phone.replace(/\D/g, '')
}
