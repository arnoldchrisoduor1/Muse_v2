"use client";
import { motion } from 'framer-motion';
import { TrendingUp, Users, Clock, DollarSign } from 'lucide-react';
import { Card } from '@/components/ui/Card';

export function QuickStats() {
  const stats = [
    {
      icon: Users,
      label: 'Active Collaborators',
      value: '3',
      description: 'Working with you now',
      color: 'text-primary',
    },
    {
      icon: Clock,
      label: 'Session Time',
      value: '2.5h',
      description: 'Across all collaborations',
      color: 'text-secondary',
    },
    {
      icon: DollarSign,
      label: 'Shared Revenue',
      value: '$147.50',
      description: 'From collaborative works',
      color: 'text-accent',
    },
    {
      icon: TrendingUp,
      label: 'Success Rate',
      value: '92%',
      description: 'Projects completed',
      color: 'text-warning',
    },
  ];

  return (
    <Card className="p-6">
      <h3 className="font-semibold mb-4">Your Collaboration Stats</h3>
      <div className="space-y-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-4 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
            >
              <div className={`p-2 rounded-lg bg-white/10 ${stat.color}`}>
                <Icon size={20} />
              </div>
              <div className="flex-1">
                <div className="text-lg font-bold text-text-primary">
                  {stat.value}
                </div>
                <div className="text-sm text-text-primary font-medium">
                  {stat.label}
                </div>
                <div className="text-xs text-text-muted">
                  {stat.description}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Progress Bar */}
      <div className="mt-6 pt-4 border-t border-white/10">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-text-secondary">Collaboration Level</span>
          <span className="text-primary">Expert</span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '85%' }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-2 rounded-full bg-gradient-90 from-primary to-secondary"
          />
        </div>
        <p className="text-xs text-text-muted mt-2">
          Based on successful collaborations and revenue sharing
        </p>
      </div>
    </Card>
  );
}