'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

interface WifiInfoProps {
  wifiName: string
  wifiPassword?: string | null
}

export default function WifiInfo({ wifiName, wifiPassword }: WifiInfoProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  return (
    <div className="space-y-3">
      {/* WiFi Name */}
      <div className="bg-white rounded-xl border-2 border-[#ff6b35] p-4 shadow-sm">
        <p className="text-sm font-semibold text-[#666] mb-2">Network Name</p>
        <div className="flex items-center justify-between">
          <p className="font-mono text-lg text-[#1a1a1a] break-all">{wifiName}</p>
          <button
            onClick={() => copyToClipboard(wifiName, 'ssid')}
            className="ml-2 p-2 rounded-lg hover:bg-[#f5f5f5] transition-colors text-[#ff6b35]"
            title="Copy WiFi name"
          >
            {copiedField === 'ssid' ? (
              <Check size={20} className="text-green-500" />
            ) : (
              <Copy size={20} />
            )}
          </button>
        </div>
      </div>

      {/* WiFi Password */}
      {wifiPassword && (
        <div className="bg-white rounded-xl border-2 border-[#ff6b35] p-4 shadow-sm">
          <p className="text-sm font-semibold text-[#666] mb-2">Password</p>
          <div className="flex items-center justify-between">
            <p className="font-mono text-lg text-[#1a1a1a] break-all">{wifiPassword}</p>
            <button
              onClick={() => copyToClipboard(wifiPassword, 'password')}
              className="ml-2 p-2 rounded-lg hover:bg-[#f5f5f5] transition-colors text-[#ff6b35]"
              title="Copy WiFi password"
            >
              {copiedField === 'password' ? (
                <Check size={20} className="text-green-500" />
              ) : (
                <Copy size={20} />
              )}
            </button>
          </div>
        </div>
      )}

      {/* WiFi Instructions */}
      <div className="bg-[#fff0e8] rounded-xl border border-[#ff6b35] p-3 text-sm text-[#1a1a1a]">
        <p className="font-semibold mb-2">How to Connect:</p>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>Open WiFi settings on your device</li>
          <li>Look for this network name</li>
          <li>Enter the password when prompted</li>
          <li>Enjoy your connection!</li>
        </ol>
      </div>
    </div>
  )
}
