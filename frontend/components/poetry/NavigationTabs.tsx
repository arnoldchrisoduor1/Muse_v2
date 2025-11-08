import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Users, Shield } from 'lucide-react';
import { usePoetryStore } from '@/lib/store/poetry-store';

const tabs = [
  { id: 'collective' as const, label: 'Collective Consciousness', icon: Sparkles },
  { id: 'fractional' as const, label: 'Fractional Ownership', icon: Users },
  { id: 'anonymous' as const, label: 'Anonymous Proof', icon: Shield },
];

export const NavigationTabs: React.FC = () => {
  const { activeTab, setActiveTab } = usePoetryStore();

  return (
    <div className="flex gap-4 mb-8 border-b border-border-muted">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        
        return (
          <motion.button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`flex items-center gap-2 px-6 py-3 transition-all ${
              isActive
                ? 'border-b-2 border-secondary text-secondary'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            <Icon size={20} />
            {tab.label}
          </motion.button>
        );
      })}
    </div>
  );
};