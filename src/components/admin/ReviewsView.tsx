'use client';

import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';

interface Review {
  id: string;
  rating: number;
  feedback: string;
  createdAt: string;
  redirectedToGoogle?: boolean;
}

export default function ReviewsView({ restaurantId }: { restaurantId: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterRating, setFilterRating] = useState<number | null>(null);

  useEffect(() => {
    fetchReviews();
  }, [restaurantId]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/reviews?restaurantId=${restaurantId}`);
      if (response.ok) {
        const data = await response.json();
        setReviews(Array.isArray(data) ? data : data.reviews || []);
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredReviews = filterRating
    ? reviews.filter((r) => r.rating === filterRating)
    : reviews;

  const StarRating = ({ rating, size = 16 }: { rating: number; size?: number }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          className={star <= rating ? 'text-gold fill-gold' : 'text-gray-300'}
        />
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-dark text-opacity-60">Loading reviews...</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-dark mb-2">Reviews</h2>
        <p className="text-dark text-opacity-60">
          Customer feedback and ratings from your QR system.
        </p>
      </div>

      {/* Filter Buttons */}
      <div className="mb-6 flex gap-2 flex-wrap">
        <button
          onClick={() => setFilterRating(null)}
          className={`px-4 py-2 rounded-lg transition-all ${
            filterRating === null
              ? 'bg-orange text-white'
              : 'bg-light text-dark hover:bg-opacity-80'
          }`}
        >
          All Reviews
        </button>
        {[5, 4, 3, 2, 1].map((rating) => (
          <button
            key={rating}
            onClick={() => setFilterRating(rating)}
            className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
              filterRating === rating
                ? 'bg-orange text-white'
                : 'bg-light text-dark hover:bg-opacity-80'
            }`}
          >
            <Star size={16} className="fill-current" />
            {rating}+
          </button>
        ))}
      </div>

      {/* Reviews List */}
      {filteredReviews.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-dark text-opacity-60 mb-2">
            {filterRating ? 'No reviews with this rating' : 'No reviews yet'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((review) => (
            <div key={review.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <StarRating rating={review.rating} />
                  <p className="text-sm text-dark text-opacity-60 mt-2">
                    {new Date(review.createdAt).toLocaleString()}
                  </p>
                </div>
                {review.redirectedToGoogle && (
                  <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                    Sent to Google
                  </span>
                )}
              </div>
              <p className="text-dark text-opacity-80">{review.feedback}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
