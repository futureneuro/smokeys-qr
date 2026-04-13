'use client'

import { useState } from 'react'
import { Mail, Phone, User, CheckCircle } from 'lucide-react'

interface ContactFormProps {
  restaurantId: string
  tableId: string
  onSuccess: (message: string) => void
  onError: (message: string) => void
}

type FormStep = 'form' | 'submitted'

export default function ContactForm({
  restaurantId,
  tableId,
  onSuccess,
  onError,
}: ContactFormProps) {
  const [step, setStep] = useState<FormStep>('form')
  const [loading, setLoading] = useState(false)
  const [emailError, setEmailError] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    consent: false,
  })

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, type } = e.target
    const value = type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Real-time email validation
    if (name === 'email' && value.trim()) {
      if (!validateEmail(value)) {
        setEmailError('Please enter a valid email address')
      } else {
        setEmailError('')
      }
    } else if (name === 'email') {
      setEmailError('')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!formData.name.trim() || !formData.phone.trim() || !formData.email.trim()) {
      onError('Please fill in all required fields')
      return
    }

    if (!validateEmail(formData.email)) {
      setEmailError('Please enter a valid email address')
      return
    }

    if (!formData.consent) {
      onError('Please agree to receive updates')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId,
          tableId,
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          consent: formData.consent,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to submit form')
      }

      onSuccess('Thank you! We will be in touch soon.')
      setStep('submitted')

      // Reset form after delay
      setTimeout(() => {
        setFormData({
          name: '',
          phone: '',
          email: '',
          consent: false,
        })
        setEmailError('')
        setStep('form')
      }, 3000)
    } catch (error) {
      console.error('Error submitting form:', error)
      onError('Failed to submit. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (step === 'submitted') {
    return (
      <div className="bg-white rounded-xl border-2 border-green-500 p-6 text-center shadow-sm">
        <CheckCircle size={48} className="mx-auto mb-3 text-green-500" />
        <p className="font-bold text-[#1a1a1a] mb-2">Thank You!</p>
        <p className="text-[#666] text-sm">We will get back to you soon</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border-2 border-[#ff6b35] p-6 shadow-sm space-y-4">
      {/* Name Field */}
      <div>
        <label className="block text-sm font-semibold text-[#1a1a1a] mb-2">
          <User size={16} className="inline mr-1" />
          Name *
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Your full name"
          className="w-full px-4 py-3 rounded-lg border border-[#e0e0e0] focus:border-[#ff6b35] focus:ring-2 focus:ring-[#ff6b35] focus:ring-opacity-20 outline-none text-[#1a1a1a] placeholder-[#999]"
          required
        />
      </div>

      {/* Phone Field */}
      <div>
        <label className="block text-sm font-semibold text-[#1a1a1a] mb-2">
          <Phone size={16} className="inline mr-1" />
          Phone (WhatsApp) *
        </label>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="+1 (555) 000-0000"
          className="w-full px-4 py-3 rounded-lg border border-[#e0e0e0] focus:border-[#ff6b35] focus:ring-2 focus:ring-[#ff6b35] focus:ring-opacity-20 outline-none text-[#1a1a1a] placeholder-[#999]"
          required
        />
      </div>

      {/* Email Field */}
      <div>
        <label className="block text-sm font-semibold text-[#1a1a1a] mb-2">
          <Mail size={16} className="inline mr-1" />
          Email *
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="your@email.com"
          className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-opacity-20 outline-none text-[#1a1a1a] placeholder-[#999] ${
            emailError
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
              : 'border-[#e0e0e0] focus:border-[#ff6b35] focus:ring-[#ff6b35]'
          }`}
          required
        />
        {emailError && <p className="mt-1 text-sm text-red-500">{emailError}</p>}
      </div>

      {/* Consent Checkbox */}
      <div className="flex items-start gap-3 p-3 bg-[#fff0e8] rounded-lg border border-[#ff6b35]">
        <input
          type="checkbox"
          name="consent"
          id="consent"
          checked={formData.consent}
          onChange={handleChange}
          className="mt-1 w-5 h-5 rounded border-[#ff6b35] text-[#ff6b35] focus:ring-[#ff6b35] cursor-pointer"
          required
        />
        <label htmlFor="consent" className="text-sm text-[#1a1a1a] cursor-pointer flex-1">
          I agree to receive updates about special offers and promotions via WhatsApp and email
        </label>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className={`w-full py-3 rounded-lg font-semibold transition-all duration-200 ${
          loading
            ? 'bg-[#ccc] text-[#999] cursor-not-allowed'
            : 'bg-gradient-to-r from-[#ff6b35] to-[#d4af37] text-[#f5f5f5] hover:shadow-lg active:scale-95'
        }`}
      >
        {loading ? 'Submitting...' : 'Get in Touch'}
      </button>

      <p className="text-xs text-center text-[#999]">
        We respect your privacy and will never share your information.
      </p>
    </form>
  )
}
