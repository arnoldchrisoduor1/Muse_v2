"use client";
import { motion } from 'framer-motion';
import { BarChart3, Download, TrendingUp, Eye, Users, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface StudioHeaderProps {
  metrics: any;
  onExport: () => void;
  isExporting: boolean;
}

export function StudioHeader({ metrics, onExport, isExporting }: StudioHeaderProps) {
  const quickStats = [
    {
      icon: DollarSign,
      label: 'Total Earnings',
      value: `$${metrics?.totalEarnings.toFixed(2) || '0.00'}`,
      change: '+12.5%',
      changeType: 'positive' as const,
    },
    {
      icon: Eye,
      label: 'Total Views',
      value: metrics?.totalViews.toLocaleString() || '0',
      change: '+8.2%',
      changeType: 'positive' as const,
    },
    {
      icon: Users,
      label: 'Followers',
      value: metrics?.totalFollowers.toLocaleString() || '0',
      change: '+3.1%',
      changeType: 'positive' as const,
    },
    {
      icon: TrendingUp,
      label: 'Engagement Rate',
      value: `${metrics?.engagementRate.toFixed(1)}%` || '0%',
      change: '+0.4%',
      changeType: 'positive' as const,
    },
  ];

  return (
    <div className="bg-gradient-135 from-purple-900 via-indigo-900 to-blue-900 py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex-1">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl font-bold text-white mb-2"
            >
              Creator Studio
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-white/80 text-lg"
            >
              Advanced analytics and insights for your poetic journey
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Button
              variant="outline"
              icon={Download}
              loading={isExporting}
              onClick={onExport}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              Export Data
            </Button>
          </motion.div>
        </div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-8"
        >
          {quickStats.map((stat, index) => {
            const Icon = stat.icon;
            
            return (
              <div
                key={stat.label}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                    <Icon size={20} className="text-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">
                      {stat.value}
                    </div>
                    <div className="text-white/80 text-sm">
                      {stat.label}
                    </div>
                  </div>
                </div>
                <div className={`text-xs ${
                  stat.changeType === 'positive' ? 'text-green-300' : 'text-red-300'
                }`}>
                  {stat.change} from last period
                </div>
              </div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}