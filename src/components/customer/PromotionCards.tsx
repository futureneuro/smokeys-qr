'use client'

import { Promotion } from '@prisma/client'
import { ExternalLink } from 'lucide-react'
import { useRef } from 'react'

interface PromotionCardsProps {
  promotions: Promotion[]
}

export default function PromotionCards({ promotions }: PromotionCardsProps) {
  const scrollContainer = useRef<HTMLDivElement>(null)

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainer.current) {
      const scrollAmount = 300
      scrollContainer.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      })
    }
  }

  return (
    <div className="relative group">
      <div
        ref={scrollContainer}
        className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide"
        style={{
          scrollBehavior: 'smooth',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {promotions.map((promotion) => (
          <a
            key={promotion.id}
            href={promotion.linkUrl || '#'}
            target={promotion.linkUrl ? '_blank' : undefined}
            rel={promotion.linkUrl ? 'noopener noreferrer' : undefined}
            className="flex-shrink-0 w-80 bg-white rounded-xl border-2 border-[#ff6b35] overflow-hidden shadow-md hover:shadow-lg hover:scale-105 transition-transform duration-200"
          >
            {/* Promotion Image Placeholder */}
            <div className="w-full h-40 bg-gradient-to-br from-[#ff6b35] to-[#d4af37] flex items-center justify-center">
              {promotion.imageUrl ? (
                <img
                  src={promotion.imageUrl}
                  alt={promotion.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center text-[#f5f5f5]">
                  <div className="text-4xl mb-2">🎉</div>
                  <p className="font-bold">Special Offer</p>
                </div>
              )}
            </div>

            {/* Promotion Content */}
            <div className="p-4">
              <h3 className="font-bold text-[#1a1a1a] text-lg mb-2">
                {promotion.title}
              </h3>
              {promotion.description && (
                <p className="text-[#666] text-sm mb-3 line-clamp-2">
                  {promotion.description}
                </p>
              )}
              {promotion.linkUrl && (
                <div className="flex items-center gap-2 text-[#ff6b35] font-semibold text-sm">
                  Learn More
                  <ExternalLink size={14} />
                </div>
              )}
            </div>
          </a>
        ))}
      </div>

      {/* Scroll Buttons */}
      {promotions.length > 3 && (
        <>
          <button
            onClick={() => scroll('left')}
            className="hidden group-hover:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 items-center justify-center w-10 h-10 rounded-full bg-[#ff6b35] text-[#f5f5f5] hover:bg-[#d4af37] transition-colors shadow-lg"
            aria-label="Scroll left"
          >
            ‹
          </button>
          <button
            onClick={() => scroll('right')}
            className="hidden group-hover:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 items-center justify-center w-10 h-10 rounded-full bg-[#ff6b35] text-[#f5f5f5] hover:bg-[#d4af37] transition-colors shadow-lg"
            aria-label="Scroll right"
          >
            ›
          </button>
        </>
      )}
    </div>
  )
}
