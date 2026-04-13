'use client';

import { useState, useEffect } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import DashboardView from '@/components/admin/DashboardView';
import TablesView from '@/components/admin/TablesView';
import ReviewsView from '@/components/admin/ReviewsView';
import CustomersView from '@/components/admin/CustomersView';
import PromotionsView from '@/components/admin/PromotionsView';
import SettingsView from '@/components/admin/SettingsView';

type AdminSection = 'dashboard' | 'tables' | 'reviews' | 'customers' | 'promotions' | 'settings';

export default function AdminPage() {
  const [activeSection, setActiveSection] = useState<AdminSection>('dashboard');
  const [restaurantId, setRestaurantId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/restaurant')
      .then((res) => res.json())
      .then((data) => {
        if (data.id) setRestaurantId(data.id);
      })
      .catch((err) => console.error('Failed to fetch restaurant:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#1a1a1a]">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <DashboardView restaurantId={restaurantId} />;
      case 'tables':
        return <TablesView restaurantId={restaurantId} />;
      case 'reviews':
        return <ReviewsView restaurantId={restaurantId} />;
      case 'customers':
        return <CustomersView restaurantId={restaurantId} />;
      case 'promotions':
        return <PromotionsView restaurantId={restaurantId} />;
      case 'settings':
        return <SettingsView restaurantId={restaurantId} />;
      default:
        return <DashboardView restaurantId={restaurantId} />;
    }
  };

  return (
    <div className="flex h-screen bg-[#f5f5f5]">
      <AdminSidebar activeSection={activeSection} onSectionChange={setActiveSection} />
      <main className="flex-1 overflow-auto">
        {renderContent()}
      </main>
    </div>
  );
}
