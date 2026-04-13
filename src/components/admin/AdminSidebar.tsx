'use client';

import { useState } from 'react';
import {
  BarChart3,
  Grid3X3,
  Star,
  Users,
  Megaphone,
  Settings,
  Menu,
  X,
} from 'lucide-react';

type AdminSection = 'dashboard' | 'tables' | 'reviews' | 'customers' | 'promotions' | 'settings';

interface AdminSidebarProps {
  activeSection: AdminSection;
  onSectionChange: (section: AdminSection) => void;
}

const sections = [
  { id: 'dashboard' as AdminSection, label: 'Dashboard', icon: BarChart3 },
  { id: 'tables' as AdminSection, label: 'Tables', icon: Grid3X3 },
  { id: 'reviews' as AdminSection, label: 'Reviews', icon: Star },
  { id: 'customers' as AdminSection, label: 'Customers', icon: Users },
  { id: 'promotions' as AdminSection, label: 'Promotions', icon: Megaphone },
  { id: 'settings' as AdminSection, label: 'Settings', icon: Settings },
];

export default function AdminSidebar({
  activeSection,
  onSectionChange,
}: AdminSidebarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleSectionClick = (section: AdminSection) => {
    onSectionChange(section);
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="fixed top-4 left-4 z-50 md:hidden bg-orange text-white p-2 rounded-lg"
      >
        {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed md:relative w-64 h-screen bg-dark text-light transition-transform duration-300 transform md:transform-none z-40 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Logo/Header */}
        <div className="p-6 border-b border-orange border-opacity-20">
          <h1 className="text-2xl font-bold text-orange">Smokey's QR</h1>
          <p className="text-sm text-light text-opacity-60 mt-1">Admin Panel</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {sections.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;
            return (
              <button
                key={section.id}
                onClick={() => handleSectionClick(section.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-orange text-dark font-semibold'
                    : 'text-light hover:bg-dark hover:bg-opacity-50 text-opacity-80'
                }`}
              >
                <Icon size={20} />
                <span>{section.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-orange border-opacity-20">
          <p className="text-xs text-light text-opacity-50">
            © 2026 Smokey's Restaurant
          </p>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  );
}
