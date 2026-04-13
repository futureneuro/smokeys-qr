'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'

interface ReviewFlowProps {
  tableId: string
  restaurantId: string
  googleReviewUrl?: string | null
  onSuccess: (message: string) => void
}

type ReviewStep = 'rating' | 'feedback' | 'completed'

export default function ReviewFlow({
  tableId,
  restaurantId,
  googleReviewUrl,
  onSuccess,
}: ReviewFlowProps) {
  const [step, setStep] = useState<ReviewStep>('rating')
  const [rating, setRating] = useState<number>(0)
  const [feedback, setFeedback] = useState<string>('')
  const [hoveredRating, setHoveredRating] = useState<number>(0)
  const [loading, setLoading] = useState(false)

  const handleRatingSubmit = (selectedRating: number) => {
    setRating(selectedRating)

    if (selectedRating >= 4) {
      // High rating - redirect to Google review
      submitReview(selectedRating)
    } else {
      // Low rating - show feedback form
      setStep('feedback')
    }
  }

  const submitReview = async (selectedRating: number = rating, feedbackText = feedback) => {
    setLoading(true)

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableId,
          restaurantId,
          rating: selectedRating,
          feedback: feedbackText || null,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to submit review')
      }

      onSuccess('Thank you for your feedback!')

      if (selectedRating >= 4 && googleReviewUrl) {
        // Redirect to Google review
        setTimeout(() => {
          window.open(googleReviewUrl, '_blank')
          setStep('completed')
        }, 1500)
      } else {
        setStep('completed')
      }
    } catch (error) {
      console.error('Error submitting review:', error)
      onSuccess('Your feedback has been recorded!')
      setStep('completed')
    } finally {
      setLoading(false)
    }
  }

  if (step === 'completed') {
    return (
      <div className="bg-white rounded-xl border-2 border-green-500 p-6 text-center shadow-sm">
        <div className="text-4xl mb-3">✨</div>
        <p className="font-bold text-[#1a1a1a] mb-2">Thank You!</p>
        <p className="text-[#666] text-sm">We appreciate your feedback</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border-2 border-[#ff6b35] p-6 shadow-sm">
      {step === 'rating' && (
        <div className="space-y-4">
          <p className="font-semibold text-[#1a1a1a] text-center">
            How was your experience?
          </p>

          {/* Star Rating */}
          <div className="flex justify-center gap-3">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                onClick={() => handleRatingSubmit(value)}
                onMouseEnter={() => setHoveredRating(value)}
                onMouseLeave={() => setHoveredRating(0)}
                className="transition-transform duration-100 hover:scale-110 active:scale-95"
              >
                <Star
                  size={40}
                  className={`${
                    value <= (hoveredRating || 0)
                      ? 'fill-[#d4af37] text-[#d4af37]'
                      : 'text-[#ccc]'
                  } transition-colors`}
                />
              </button>
            ))}
          </div>

          <p className="text-xs text-center text-[#999]">
            Tap a star to rate us
          </p>
        </div>
      )}

      {step === 'feedback' && (
        <div className="space-y-4">
          <p className="font-semibold text-[#1a1a1a] text-center">
            Please tell us what we can improve
          </p>

          {/* Rating Display */}
          <div className="flex justify-center gap-1">
            {[1, 2, 3, 4, 5].map((value) => (
              <Star
                key={value}
                size={24}
                className={`${
                  value <= rating
                    ? 'fill-[#d4af37] text-[#d4af37]'
                    : 'text-[#ccc]'
                }`}
              />
            ))}
          </div>

          {/* Feedback Textarea */}
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Tell us what went wrong... (optional)"
            maxLength={500}
            className="w-full p-3 rounded-lg border border-[#e0e0e0] focus:border-[#ff6b35] focus:ring-2 focus:ring-[#ff6b35] focus:ring-opacity-20 outline-none resize-none h-24 text-[#1a1a1a] placeholder-[#999]"
          />

          <div className="text-xs text-right text-[#999]">
            {feedback.length}/500
          </div>

          {/* Submit Button */}
          <button
            onClick={() => submitReview()}
            disabled={loading}
            className={`w-full py-3 rounded-lg font-semibold transition-all duration-200 ${
              loading
                ? 'bg-[#ccc] text-[#999] cursor-not-allowed'
                : 'bg-gradient-to-r from-[#ff6b35] to-[#d4af37] text-[#f5f5f5] hover:shadow-lg active:scale-95'
            }`}
          >
            {loading ? 'Submitting...' : 'Submit Feedback'}
          </button>

          {/* Back Button */}
          <button
            onClick={() => setStep('rating')}
            disabled={loading}
            className="w-full py-2 rounded-lg font-semibold text-[#ff6b35] border-2 border-[#ff6b35] hover:bg-[#fff0e8] transition-colors disabled:opacity-50"
          >
            Back
          </button>
        </div>
      )}
    </div>
  )
}
