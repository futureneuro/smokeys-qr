'use client';

import { useEffect, useState } from 'react';
import { Plus, Trash2, Loader } from 'lucide-react';

interface Promotion {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  linkUrl?: string;
  active: boolean;
  createdAt: string;
}

export default function PromotionsView({ restaurantId }: { restaurantId: string }) {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    linkUrl: '',
  });

  useEffect(() => {
    fetchPromotions();
  }, [restaurantId]);

  const fetchPromotions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/promotions?restaurantId=${restaurantId}`);
      if (response.ok) {
        const data = await response.json();
        setPromotions(Array.isArray(data) ? data : data.promotions || []);
      }
    } catch (error) {
      console.error('Failed to fetch promotions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const response = await fetch('/api/promotions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId,
          ...formData,
          active: true,
        }),
      });
      if (response.ok) {
        setFormData({
          title: '',
          description: '',
          imageUrl: '',
          linkUrl: '',
        });
        setShowForm(false);
        await fetchPromotions();
      }
    } catch (error) {
      console.error('Failed to create promotion:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    try {
      const response = await fetch(`/api/promotions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !currentActive }),
      });
      if (response.ok) {
        await fetchPromotions();
      }
    } catch (error) {
      console.error('Failed to update promotion:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this promotion?')) {
      try {
        const response = await fetch(`/api/promotions/${id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          await fetchPromotions();
        }
      } catch (error) {
        console.error('Failed to delete promotion:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-dark text-opacity-60">Loading promotions...</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-dark mb-2">Promotions</h2>
          <p className="text-dark text-opacity-60">
            Manage promotional offers and campaigns.
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-orange text-white px-6 py-3 rounded-lg hover:bg-opacity-90 transition-all"
        >
          <Plus size={20} />
          New Promotion
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-xl font-semibold text-dark mb-6">Create New Promotion</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-dark mb-2">
                Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
                className="w-full px-4 py-2 border border-dark border-opacity-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                required
                rows={4}
                className="w-full px-4 py-2 border border-dark border-opacity-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark mb-2">
                Image URL (optional)
              </label>
              <input
                type="url"
                value={formData.imageUrl}
                onChange={(e) =>
                  setFormData({ ...formData, imageUrl: e.target.value })
                }
                className="w-full px-4 py-2 border border-dark border-opacity-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark mb-2">
                Link URL (optional)
              </label>
              <input
                type="url"
                value={formData.linkUrl}
                onChange={(e) =>
                  setFormData({ ...formData, linkUrl: e.target.value })
                }
                className="w-full px-4 py-2 border border-dark border-opacity-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 bg-orange text-white px-6 py-2 rounded-lg hover:bg-opacity-90 transition-all disabled:opacity-50"
              >
                {submitting ? (
                  <Loader size={16} className="animate-spin" />
                ) : (
                  <Plus size={16} />
                )}
                {submitting ? 'Creating...' : 'Create Promotion'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-2 border border-dark border-opacity-20 text-dark rounded-lg hover:bg-light transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Promotions List */}
      {promotions.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-dark text-opacity-60 mb-2">No promotions yet</p>
          <p className="text-sm text-dark text-opacity-50">
            Click "New Promotion" to create your first promotion.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {promotions.map((promotion) => (
            <div key={promotion.id} className="bg-white rounded-lg shadow overflow-hidden">
              {promotion.imageUrl && (
                <img
                  src={promotion.imageUrl}
                  alt={promotion.title}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-dark">{promotion.title}</h3>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      promotion.active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {promotion.active ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <p className="text-dark text-opacity-70 text-sm mb-4">
                  {promotion.description}
                </p>

                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      handleToggleActive(promotion.id, promotion.active)
                    }
                    className="flex-1 px-3 py-2 bg-light text-dark rounded-lg text-sm hover:bg-opacity-70 transition-all"
                  >
                    {promotion.active ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => handleDelete(promotion.id)}
                    className="px-3 py-2 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
