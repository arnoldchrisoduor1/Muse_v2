"use client";
import { motion } from 'framer-motion';
import { Users, Database, Gem, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { useCollectiveStore } from '@/lib/store/collective-store';

export function CollectiveStats() {
  const { collectiveStats } = useCollectiveStore();

  const stats = [
    {
      icon: Database,
      label: 'Poems in Training',
      value: collectiveStats.poemsInTraining.toLocaleString(),
      color: 'text-primary',
      change: '+12 today',
    },
    {
      icon: Users,
      label: 'Total Queries',
      value: collectiveStats.totalQueries.toLocaleString(),
      color: 'text-secondary',
      change: '+47 this week',
    },
    {
      icon: Gem,
      label: 'DAO Treasury',
      value: `${collectiveStats.daoTreasury} ETH`,
      color: 'text-accent',
      change: '+2.1 ETH this month',
    },
    {
      icon: TrendingUp,
      label: 'Training Progress',
      value: `${collectiveStats.trainingProgress}%`,
      color: 'text-warning',
      change: 'v' + collectiveStats.modelVersion,
    },
  ];

  return (
    <Card className="p-6">
      <h3 className="font-semibold mb-4">Collective Stats</h3>
      <div className="space-y-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-white/10 ${stat.color}`}>
                  <Icon size={16} />
                </div>
                <div>
                  <div className="text-sm font-medium text-text-primary">
                    {stat.value}
                  </div>
                  <div className="text-xs text-text-muted">
                    {stat.label}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-xs ${stat.color}`}>
                  {stat.change}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Training Progress Bar */}
      <div className="mt-6 pt-4 border-t border-white/10">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-text-secondary">Model Training</span>
          <span className="text-warning">{collectiveStats.trainingProgress}%</span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${collectiveStats.trainingProgress}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-2 rounded-full bg-gradient-90 from-warning to-accent"
          />
        </div>
        <p className="text-xs text-text-muted mt-2">
          Training Collective v{collectiveStats.modelVersion} with new poems
        </p>
      </div>
    </Card>
  );
}