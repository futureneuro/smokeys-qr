'use client';

import { useEffect, useState } from 'react';
import {
  TrendingUp,
  Clock,
  MessageSquare,
  Users as UsersIcon,
} from 'lucide-react';

interface Analytics {
  totalRequests: number;
  avgResponseTime: number;
  reviewStats: {
    totalReviews: number;
    avgRating: number;
  };
  customerCaptureCount: number;
}

export default function DashboardView({ restaurantId }: { restaurantId: string }) {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch(`/api/analytics?restaurantId=${restaurantId}`);
        if (response.ok) {
          const data = await response.json();
          setAnalytics(data);
        }
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [restaurantId]);

  const StatCard = ({
    icon: Icon,
    label,
    value,
    unit = '',
  }: {
    icon: React.ComponentType<{ size: number }>;
    label: string;
    value: string | number;
    unit?: string;
  }) => (
    <div className="bg-white rounded-lg shadow p-6 border-l-4 border-orange">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-dark text-opacity-60 mb-1">{label}</p>
          <p className="text-3xl font-bold text-dark">
            {value}
            {unit && <span className="text-lg ml-1 text-opacity-70">{unit}</span>}
          </p>
        </div>
        <div className="bg-orange bg-opacity-10 p-3 rounded-lg">
          <Icon size={32} className="text-orange" />
        </div>
      </div>
    </div>
  );

  const ChartPlaceholder = ({ title }: { title: string }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-dark mb-4">{title}</h3>
      <div className="h-64 bg-light rounded-lg flex items-center justify-center text-dark text-opacity-40">
        <p>Chart placeholder - {title}</p>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-dark text-opacity-60">Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-dark mb-2">Dashboard</h2>
        <p className="text-dark text-opacity-60">
          Welcome back! Here's your restaurant performance overview.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={TrendingUp}
          label="Total Requests"
          value={analytics?.totalRequests || 0}
        />
        <StatCard
          icon={Clock}
          label="Avg Response Time"
          value={analytics?.avgResponseTime || 0}
          unit="ms"
        />
        <StatCard
          icon={MessageSquare}
          label="Reviews"
          value={analytics?.reviewStats?.totalReviews || 0}
        />
        <StatCard
          icon={UsersIcon}
          label="Customer Contacts"
          value={analytics?.customerCaptureCount || 0}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartPlaceholder title="Requests by Hour" />
        <ChartPlaceholder title="Requests by Type" />
        <ChartPlaceholder title="Customer Satisfaction" />
        <ChartPlaceholder title="Peak Times" />
      </div>
    </div>
  );
}
