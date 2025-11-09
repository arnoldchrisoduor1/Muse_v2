"use client";
import { motion } from 'framer-motion';
import { DollarSign, FileText, Users, Sparkles, TrendingUp, Gift } from 'lucide-react';
import { Card } from '@/components/ui/Card';

interface EarningsBreakdownProps {
  breakdown: any;
}

export function EarningsBreakdown({ breakdown }: EarningsBreakdownProps) {
  if (!breakdown) return null;

  const earningsSources = [
    {
      icon: FileText,
      label: 'NFT Sales',
      value: breakdown.nftSales,
      color: 'text-primary',
      description: 'Primary and secondary market sales',
    },
    {
      icon: DollarSign,
      label: 'Micro-payments',
      value: breakdown.microPayments,
      color: 'text-accent',
      description: 'Pay-per-view revenue',
    },
    {
      icon: TrendingUp,
      label: 'Licensing',
      value: breakdown.licensing,
      color: 'text-secondary',
      description: 'Commercial usage rights',
    },
    {
      icon: Sparkles,
      label: 'Collective Royalties',
      value: breakdown.collectiveRoyalties,
      color: 'text-warning',
      description: 'AI training contributions',
    },
    {
      icon: Users,
      label: 'Collaborations',
      value: breakdown.collaborations,
      color: 'text-purple-400',
      description: 'Shared ownership revenue',
    },
    {
      icon: Gift,
      label: 'Tips',
      value: breakdown.tips,
      color: 'text-pink-400',
      description: 'Reader appreciation',
    },
  ];

  const totalEarnings = Object.values(breakdown).reduce((sum: number, value: any) => sum + value, 0);

  return (
    <Card className="p-6">
      <h3 className="font-semibold mb-6 flex items-center gap-2">
        <DollarSign className="text-accent" size={20} />
        Earnings Breakdown
      </h3>

      {/* Earnings Chart */}
      <div className="mb-6">
        <div className="flex h-4 rounded-full overflow-hidden bg-white/10 mb-4">
          {earningsSources.map((source, index) => (
            <motion.div
              key={source.label}
              initial={{ width: 0 }}
              animate={{ width: `${(source.value / totalEarnings) * 100}%` }}
              transition={{ duration: 1, delay: index * 0.1 }}
              className="h-4"
              style={{ backgroundColor: `var(--color-${source.color.replace('text-', '')})` }}
              title={`${source.label}: $${source.value.toFixed(2)}`}
            />
          ))}
        </div>
        
        <div className="flex justify-between text-xs text-text-muted">
          {earningsSources.map(source => (
            <span key={source.label}>
              {((source.value / totalEarnings) * 100).toFixed(0)}%
            </span>
          ))}
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className="space-y-3">
        {earningsSources.map((source, index) => (
          <motion.div
            key={source.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          >
            <div className="flex items-center gap-3">
              <source.icon size={20} className={source.color} />
              <div>
                <div className="text-sm font-medium text-text-primary">
                  {source.label}
                </div>
                <div className="text-xs text-text-muted">
                  {source.description}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-text-primary">
                ${source.value.toFixed(2)}
              </div>
              <div className="text-xs text-text-muted">
                {((source.value / totalEarnings) * 100).toFixed(1)}%
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Total Summary */}
      <div className="mt-6 pt-4 border-t border-white/10">
        <div className="flex justify-between items-center">
          <span className="text-text-muted">Total Earnings</span>
          <div className="text-right">
            <div className="text-2xl font-bold text-accent">
              ${totalEarnings.toFixed(2)}
            </div>
            <div className="text-xs text-text-muted">
              All-time revenue
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}