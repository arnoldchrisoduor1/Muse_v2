"use client";
import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, Download, Upload, PieChart, BarChart3 } from 'lucide-react';
import { useDAOStore } from '@/lib/store/dao-store';
import { Card } from '@/components/ui/Card';

export function TreasuryOverview() {
  const { treasury } = useDAOStore();

  if (!treasury) {
    return (
      <Card className="p-8 text-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-text-secondary">Loading treasury data...</p>
      </Card>
    );
  }

  const stats = [
    {
      icon: DollarSign,
      label: 'Total Treasury',
      value: `${treasury.totalBalance} ETH`,
      secondary: `$${treasury.balanceUSD.toLocaleString()}`,
      color: 'text-accent',
    },
    {
      icon: TrendingUp,
      label: 'Total Revenue',
      value: `${treasury.totalRevenue} ETH`,
      secondary: 'All time',
      color: 'text-primary',
    },
    {
      icon: Download,
      label: 'Distributed',
      value: `${treasury.totalDistributed} ETH`,
      secondary: 'To community',
      color: 'text-secondary',
    },
    {
      icon: Upload,
      label: 'Active Proposals',
      value: treasury.activeProposals.toString(),
      secondary: 'Seeking funding',
      color: 'text-warning',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Treasury Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-6 text-center hover:bg-white/10 transition-colors">
                <Icon size={32} className={`mx-auto mb-3 ${stat.color}`} />
                <div className={`text-2xl font-bold ${stat.color} mb-1`}>
                  {stat.value}
                </div>
                <div className="text-sm font-medium text-text-primary mb-1">
                  {stat.label}
                </div>
                <div className="text-xs text-text-muted">
                  {stat.secondary}
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Revenue Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <PieChart className="text-primary" size={20} />
            Revenue Sources
          </h3>
          <div className="space-y-3">
            {Object.entries(treasury.revenueBreakdown).map(([source, amount], index) => (
              <motion.div
                key={source}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-primary" />
                  <span className="text-sm font-medium capitalize">
                    {source.replace(/([A-Z])/g, ' $1').replace('_', ' ')}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-text-primary font-medium">
                    {amount} ETH
                  </div>
                  <div className="text-xs text-text-muted">
                    {((amount / treasury.totalRevenue) * 100).toFixed(1)}%
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>

        {/* Distribution Breakdown */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="text-secondary" size={20} />
            Fund Distribution
          </h3>
          <div className="space-y-3">
            {Object.entries(treasury.distributionBreakdown).map(([category, amount], index) => (
              <motion.div
                key={category}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-secondary" />
                  <span className="text-sm font-medium capitalize">
                    {category}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-text-primary font-medium">
                    {amount} ETH
                  </div>
                  <div className="text-xs text-text-muted">
                    {((amount / treasury.totalDistributed) * 100).toFixed(1)}%
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      </div>

      {/* Treasury Health */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Treasury Health</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-accent mb-2">
              {((treasury.totalBalance / treasury.totalRevenue) * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-text-muted">Reserve Ratio</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">
              ${(treasury.balanceUSD / 1000).toFixed(1)}K
            </div>
            <div className="text-sm text-text-muted">Runway (Months)</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-secondary mb-2">
              +{((treasury.totalRevenue - treasury.totalDistributed) / treasury.totalDistributed * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-text-muted">Growth Rate</div>
          </div>
        </div>
      </Card>
    </div>
  );
}