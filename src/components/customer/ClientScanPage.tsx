'use client'

import { useState } from 'react'
import { Table, ServiceRequestOption, Settings, Promotion, Restaurant } from '@prisma/client'
import { Menu, Wifi, Star, MessageCircle, Info } from 'lucide-react'
import ActionButtons from './ActionButtons'
import PromotionCards from './PromotionCards'
import WifiInfo from './WifiInfo'
import ReviewFlow from './ReviewFlow'
import ContactForm from './ContactForm'
import Toast from './Toast'

interface ClientScanPageProps {
  table: Table & { restaurant: Restaurant }
  serviceOptions: ServiceRequestOption[]
  settings: Settings | null
  promotions: Promotion[]
}

type ToastType = 'success' | 'error' | 'info'

interface ToastMessage {
  type: ToastType
  message: string
}

export default function ClientScanPage({
  table,
  serviceOptions,
  settings,
  promotions,
}: ClientScanPageProps) {
  const [activeTab, setActiveTab] = useState<'service' | 'menu' | 'wifi' | 'review' | 'contact'>('service')
  const [toast, setToast] = useState<ToastMessage | null>(null)

  const showToast = (message: string, type: ToastType = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f5f5f5] to-[#e8e8e8] text-[#1a1a1a]">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-gradient-to-r from-[#ff6b35] to-[#d4af37] shadow-lg">
        <div className="px-4 py-6 text-center">
          <h1 className="text-3xl font-bold text-[#f5f5f5] mb-1">
            {table.restaurant.name}
          </h1>
          <p className="text-[#f5f5f5] text-lg opacity-90">
            Table {table.number}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="pb-24 px-4 max-w-2xl mx-auto">
        {/* Service Request Buttons - Always Visible */}
        <div className="mt-6 mb-8">
          <h2 className="text-xl font-bold text-[#1a1a1a] mb-4">Need Something?</h2>
          <ActionButtons
            tableId={table.id}
            serviceOptions={serviceOptions}
            onSuccess={(message) => showToast(message, 'success')}
            onError={(message) => showToast(message, 'error')}
          />
        </div>

        {/* Promotions Section */}
        {promotions.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-[#1a1a1a] mb-4">Special Offers</h2>
            <PromotionCards promotions={promotions} />
          </div>
        )}

        {/* Menu Link */}
        {settings?.menuUrl && (
          <div className="mb-8">
            <a
              href={settings.menuUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 p-4 rounded-xl bg-white border-2 border-[#ff6b35] hover:bg-[#fff0e8] transition-colors shadow-sm"
            >
              <Menu size={24} className="text-[#ff6b35]" />
              <span className="font-semibold text-[#1a1a1a]">View Full Menu</span>
            </a>
          </div>
        )}

        {/* WiFi Section */}
        {settings?.wifiName && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-[#1a1a1a] mb-4 flex items-center gap-2">
              <Wifi size={20} className="text-[#ff6b35]" />
              WiFi Information
            </h2>
            <WifiInfo
              wifiName={settings.wifiName}
              wifiPassword={settings.wifiPassword}
            />
          </div>
        )}

        {/* About Section */}
        {settings?.aboutText && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-[#1a1a1a] mb-4 flex items-center gap-2">
              <Info size={20} className="text-[#ff6b35]" />
              About Us
            </h2>
            <div className="p-4 bg-white rounded-xl border border-[#e0e0e0] shadow-sm">
              <p className="text-[#1a1a1a] leading-relaxed whitespace-pre-wrap">
                {settings.aboutText}
              </p>
            </div>
          </div>
        )}

        {/* Review Section */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-[#1a1a1a] mb-4 flex items-center gap-2">
            <Star size={20} className="text-[#ff6b35]" />
            Share Your Feedback
          </h2>
          <ReviewFlow
            tableId={table.id}
            restaurantId={table.restaurantId}
            googleReviewUrl={settings?.googleReviewUrl}
            onSuccess={(message) => showToast(message, 'success')}
          />
        </div>

        {/* Contact Form Section */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-[#1a1a1a] mb-4 flex items-center gap-2">
            <MessageCircle size={20} className="text-[#ff6b35]" />
            Get in Touch
          </h2>
          <ContactForm
            restaurantId={table.restaurantId}
            tableId={table.id}
            onSuccess={(message) => showToast(message, 'success')}
            onError={(message) => showToast(message, 'error')}
          />
        </div>

        {/* Contact Information Footer */}
        {(settings?.contactPhone || settings?.contactEmail) && (
          <div className="bg-white rounded-xl border border-[#e0e0e0] p-4 shadow-sm">
            <h3 className="font-semibold text-[#1a1a1a] mb-3">Contact Us</h3>
            <div className="space-y-2">
              {settings.contactPhone && (
                <a
                  href={`tel:${settings.contactPhone}`}
                  className="block text-[#ff6b35] hover:text-[#d4af37] font-medium"
                >
                  📞 {settings.contactPhone}
                </a>
              )}
              {settings.contactEmail && (
                <a
                  href={`mailto:${settings.contactEmail}`}
                  className="block text-[#ff6b35] hover:text-[#d4af37] font-medium"
                >
                  ✉️ {settings.contactEmail}
                </a>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Toast Notifications */}
      {toast && (
        <Toast type={toast.type} message={toast.message} />
      )}
    </div>
  )
}
