'use client'

import { Check, AlertCircle, Info } from 'lucide-react'

interface ToastProps {
  type: 'success' | 'error' | 'info'
  message: string
}

export default function Toast({ type, message }: ToastProps) {
  const bgColor = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
  }[type]

  const icon = {
    success: <Check size={20} />,
    error: <AlertCircle size={20} />,
    info: <Info size={20} />,
  }[type]

  return (
    <div
      className={`fixed bottom-24 left-1/2 -translate-x-1/2 ${bgColor} text-white px-6 py-4 rounded-xl shadow-lg flex items-center gap-3 animate-in slide-in-from-bottom-4 fade-in duration-300 max-w-sm z-[100]`}
    >
      <div className="flex-shrink-0">{icon}</div>
      <p className="flex-1 font-semibold">{message}</p>
    </div>
  )
}
