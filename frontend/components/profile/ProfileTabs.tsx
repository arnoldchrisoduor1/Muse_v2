"use client";

import { motion } from 'framer-motion';
import { BookOpen, Users, PieChart, Library } from 'lucide-react';

interface ProfileTabsProps {
  activeTab: string;
  onTabChange: (tab: 'poems' | 'collections' | 'collaborations' | 'analytics') => void;
  stats: {
    poems: number;
    collections: number;
    collaborations: number;
  };
}

export function ProfileTabs({ activeTab, onTabChange, stats }: ProfileTabsProps) {
  const tabs = [
    {
      id: 'poems' as const,
      label: 'Poems',
      icon: BookOpen,
      count: stats.poems,
    },
    {
      id: 'collections' as const,
      label: 'Collections',
      icon: Library,
      count: stats.collections,
    },
    {
      id: 'collaborations' as const,
      label: 'Collaborations',
      icon: Users,
      count: stats.collaborations,
    },
    {
      id: 'analytics' as const,
      label: 'Analytics',
      icon: PieChart,
      count: null,
    },
  ];

  return (
    <div className="flex flex-wrap sm:flex-nowrap space-y-1 sm:space-y-0 sm:space-x-1 glass-card p-1 rounded-lg w-full">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-3 rounded-md transition-all flex-1 justify-center min-w-0 ${
              isActive
                ? 'bg-primary text-white'
                : 'text-text-muted hover:text-text-primary hover:bg-white/10'
            }`}
          >
            <Icon size={16} className="sm:w-5 sm:h-5" />
            <span className="font-medium text-sm sm:text-base truncate">{tab.label}</span>
            {tab.count !== null && (
              <span className={`text-xs px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full ${
                isActive
                  ? 'bg-white/20 text-white'
                  : 'bg-white/10 text-text-muted'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}