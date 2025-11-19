"use client";
import { motion } from 'framer-motion';
import { TrendingUp, Clock, Sparkles, Users, Shield } from 'lucide-react';
import { useDiscoveryStore } from '@/lib/store/discovery-store';
import { Card } from '@/components/ui/Card';

export function QuickFilters() {
  const { performSearch, setSearchFilters } = useDiscoveryStore();

  const quickFilters = [
    {
      label: 'Trending',
      description: 'Most popular right now',
      icon: TrendingUp,
      color: 'from-secondary to-primary',
      action: () => {
        setSearchFilters({ sortBy: 'trending' });
        performSearch();
      },
    },
    {
      label: 'New',
      description: 'Freshly published poems',
      icon: Clock,
      color: 'from-primary to-accent',
      action: () => {
        setSearchFilters({ sortBy: 'recent' });
        performSearch();
      },
    },
    {
      label: 'High Quality',
      description: 'AI-rated excellent poems',
      icon: Sparkles,
      color: 'from-accent to-warning',
      action: () => {
        setSearchFilters({ minQualityScore: 80 });
        performSearch();
      },
    },
    {
      label: 'Collaborative',
      description: 'Written by multiple poets',
      icon: Users,
      color: 'from-warning to-secondary',
      action: () => {
        setSearchFilters({ isCollaborative: true });
        performSearch();
      },
    },
    {
      label: 'Anonymous',
      description: 'Hidden author poems',
      icon: Shield,
      color: 'from-purple-500 to-pink-500',
      action: () => {
        setSearchFilters({ isCollaborative: false }); // Assuming anonymous are solo
        performSearch();
      },
    },
  ];

  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold mb-4">Quick Discover</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {quickFilters.map((filter, index) => {
          const Icon = filter.icon;
          
          return (
            // inside map, replace the button JSX with this:
<motion.button
  key={filter.label}
  initial={{ opacity: 0, scale: 0.8 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={{ delay: index * 0.1 }}
  onClick={filter.action}
  className={`p-4 rounded-lg bg-linear-to-br ${filter.color} hover:scale-105 transition-all duration-300 text-left group`}
>
  <Icon size={24} className="text-white mb-2 group-hover:scale-110 transition-transform" />
  <div className="text-white font-semibold text-sm mb-1">{filter.label}</div>
  <div className="text-white/80 text-xs">{filter.description}</div>
</motion.button>

          );
        })}
      </div>
    </Card>
  );
}