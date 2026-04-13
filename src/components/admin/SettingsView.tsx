'use client';

import { useEffect, useState } from 'react';
import { Save, AlertCircle, CheckCircle, Loader } from 'lucide-react';

interface Settings {
  throttleSeconds?: number;
  autoCloseMinutes?: number;
  googleReviewUrl?: string;
  menuUrl?: string;
  wifiName?: string;
  wifiPassword?: string;
  aboutText?: string;
  contactPhone?: string;
  contactEmail?: string;
}

type MessageType = 'success' | 'error' | null;

export default function SettingsView({ restaurantId }: { restaurantId: string }) {
  const [settings, setSettings] = useState<Settings>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: MessageType; text: string }>({
    type: null,
    text: '',
  });

  useEffect(() => {
    fetchSettings();
  }, [restaurantId]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/settings?restaurantId=${restaurantId}`);
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      setMessage({
        type: 'error',
        text: 'Failed to load settings',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    field: keyof Settings,
    value: string | number
  ) => {
    setSettings({
      ...settings,
      [field]: value,
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const response = await fetch(`/api/settings?restaurantId=${restaurantId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        setMessage({
          type: 'success',
          text: 'Settings saved successfully!',
        });
        setTimeout(() => setMessage({ type: null, text: '' }), 3000);
      } else {
        setMessage({
          type: 'error',
          text: 'Failed to save settings',
        });
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      setMessage({
        type: 'error',
        text: 'Failed to save settings',
      });
    } finally {
      setSaving(false);
    }
  };

  const SettingField = ({
    label,
    field,
    type = 'text',
    placeholder = '',
    help = '',
  }: {
    label: string;
    field: keyof Settings;
    type?: string;
    placeholder?: string;
    help?: string;
  }) => (
    <div>
      <label className="block text-sm font-medium text-dark mb-2">
        {label}
      </label>
      <input
        type={type}
        value={settings[field] ?? ''}
        onChange={(e) => handleChange(field, e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-2 border border-dark border-opacity-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange"
      />
      {help && (
        <p className="text-xs text-dark text-opacity-50 mt-1">{help}</p>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-dark text-opacity-60">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-dark mb-2">Settings</h2>
        <p className="text-dark text-opacity-60">
          Configure your restaurant QR system settings.
        </p>
      </div>

      {/* Message */}
      {message.type && (
        <div
          className={`mb-6 flex items-center gap-3 px-4 py-3 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle size={20} />
          ) : (
            <AlertCircle size={20} />
          )}
          {message.text}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        {/* System Settings */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold text-dark mb-6 flex items-center gap-2">
            <span className="w-1 h-6 bg-orange rounded-full"></span>
            System Settings
          </h3>
          <div className="space-y-4">
            <SettingField
              label="Throttle Seconds"
              field="throttleSeconds"
              type="number"
              placeholder="3600"
              help="Seconds to throttle requests from the same IP"
            />
            <SettingField
              label="Auto-Close Minutes"
              field="autoCloseMinutes"
              type="number"
              placeholder="5"
              help="Minutes before auto-closing the menu"
            />
          </div>
        </div>

        {/* Links & URLs */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold text-dark mb-6 flex items-center gap-2">
            <span className="w-1 h-6 bg-orange rounded-full"></span>
            Links & URLs
          </h3>
          <div className="space-y-4">
            <SettingField
              label="Google Review URL"
              field="googleReviewUrl"
              placeholder="https://g.page/your-restaurant"
              help="URL to your Google review page"
            />
            <SettingField
              label="Menu URL"
              field="menuUrl"
              placeholder="https://menu.yoursite.com"
              help="URL to your online menu"
            />
          </div>
        </div>

        {/* WiFi Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold text-dark mb-6 flex items-center gap-2">
            <span className="w-1 h-6 bg-orange rounded-full"></span>
            WiFi Information
          </h3>
          <div className="space-y-4">
            <SettingField
              label="WiFi Network Name"
              field="wifiName"
              placeholder="Smokeys_Guest"
              help="WiFi SSID to display to customers"
            />
            <SettingField
              label="WiFi Password"
              field="wifiPassword"
              type="password"
              placeholder="••••••••"
              help="WiFi password to display to customers"
            />
          </div>
        </div>

        {/* About & Contact */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold text-dark mb-6 flex items-center gap-2">
            <span className="w-1 h-6 bg-orange rounded-full"></span>
            About & Contact
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-dark mb-2">
                About Text
              </label>
              <textarea
                value={settings.aboutText ?? ''}
                onChange={(e) => handleChange('aboutText', e.target.value)}
                placeholder="Tell your customers about your restaurant..."
                rows={4}
                className="w-full px-4 py-2 border border-dark border-opacity-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange"
              />
              <p className="text-xs text-dark text-opacity-50 mt-1">
                This text will be displayed to customers
              </p>
            </div>

            <SettingField
              label="Contact Phone"
              field="contactPhone"
              placeholder="+1 (555) 123-4567"
              help="Restaurant contact phone number"
            />
            <SettingField
              label="Contact Email"
              field="contactEmail"
              type="email"
              placeholder="info@smokeys.com"
              help="Restaurant contact email address"
            />
          </div>
        </div>

        {/* Save Button */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-orange text-white px-8 py-3 rounded-lg hover:bg-opacity-90 transition-all disabled:opacity-50 font-medium"
          >
            {saving ? (
              <Loader size={20} className="animate-spin" />
            ) : (
              <Save size={20} />
            )}
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
          <button
            type="button"
            onClick={fetchSettings}
            className="px-8 py-3 border border-dark border-opacity-20 text-dark rounded-lg hover:bg-light transition-all"
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  );
}
