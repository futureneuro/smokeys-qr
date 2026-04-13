'use client'

import { useState } from 'react'
import { Table, ServiceRequestOption, Settings, Promotion, Restaurant } from '@prisma/client'
import { Menu, Wifi, Star, MessageCircle, Info, Bell, Tag } from 'lucide-react'
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
  const [toast, setToast] = useState<ToastMessage | null>(null)
  const [activeTab, setActiveTab] = useState('services')

  const scrollTo = (id: string) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
      setActiveTab(id)
    }
  }

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
        <div id="services" className="mt-6 mb-8 scroll-mt-24">
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
          <div id="offers" className="mb-8 scroll-mt-24">
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
          <div id="info" className="mb-8 scroll-mt-24">
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
          <div id={!settings?.wifiName ? 'info' : undefined} className="mb-8 scroll-mt-24">
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
        <div id="feedback" className="mb-8 scroll-mt-24">
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

      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#e0e0e0] shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-50">
        <div className="max-w-2xl mx-auto flex justify-between px-2 py-3">
          <button
            onClick={() => scrollTo('services')}
            className={`flex flex-col items-center flex-1 transition-colors ${activeTab === 'services' ? 'text-[#ff6b35]' : 'text-gray-500 hover:text-gray-800'}`}
          >
            <Bell size={24} className="mb-1" />
            <span className="text-[10px] font-semibold text-center uppercase tracking-wider">Services</span>
          </button>

          {promotions.length > 0 && (
            <button
              onClick={() => scrollTo('offers')}
              className={`flex flex-col items-center flex-1 transition-colors ${activeTab === 'offers' ? 'text-[#ff6b35]' : 'text-gray-500 hover:text-gray-800'}`}
            >
              <Tag size={24} className="mb-1" />
              <span className="text-[10px] font-semibold text-center uppercase tracking-wider">Offers</span>
            </button>
          )}

          <button
            onClick={() => scrollTo('info')}
            className={`flex flex-col items-center flex-1 transition-colors ${activeTab === 'info' ? 'text-[#ff6b35]' : 'text-gray-500 hover:text-gray-800'}`}
          >
            <Info size={24} className="mb-1" />
            <span className="text-[10px] font-semibold text-center uppercase tracking-wider">Info</span>
          </button>

          <button
            onClick={() => scrollTo('feedback')}
            className={`flex flex-col items-center flex-1 transition-colors ${activeTab === 'feedback' ? 'text-[#ff6b35]' : 'text-gray-500 hover:text-gray-800'}`}
          >
            <Star size={24} className="mb-1" />
            <span className="text-[10px] font-semibold text-center uppercase tracking-wider">Feedback</span>
          </button>
        </div>
      </div>
    </div>
  )
}
