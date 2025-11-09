"use client";
import { motion } from 'framer-motion';
import { TrendingUp, Users, Clock, Check, X, PieChart } from 'lucide-react';
import { useDAOStore } from '@/lib/store/dao-store';
import { Card } from '@/components/ui/Card';

export function ProposalStats() {
  const { proposals } = useDAOStore();

  const stats = {
    total: proposals.length,
    active: proposals.filter(p => p.status === 'active').length,
    passed: proposals.filter(p => p.status === 'passed' || p.status === 'executed').length,
    rejected: proposals.filter(p => p.status === 'rejected').length,
    participationRate: 67, // Mock data
    avgTurnout: 245000, // Mock data
  };

  const typeDistribution = proposals.reduce((acc, proposal) => {
    acc[proposal.proposalType] = (acc[proposal.proposalType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = [
    { label: 'Active', value: stats.active, color: 'bg-accent' },
    { label: 'Passed', value: stats.passed, color: 'bg-primary' },
    { label: 'Rejected', value: stats.rejected, color: 'bg-error' },
    { label: 'Draft', value: proposals.filter(p => p.status === 'draft').length, color: 'bg-warning' },
  ];

  return (
    <Card className="p-6">
      <h3 className="font-semibold mb-4 flex items-center gap-2">
        <PieChart className="text-primary" size={20} />
        Proposal Statistics
      </h3>

      {/* Main Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-text-primary mb-1">
            {stats.total}
          </div>
          <div className="text-xs text-text-muted">Total Proposals</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-accent mb-1">
            {stats.active}
          </div>
          <div className="text-xs text-text-muted">Active</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-primary mb-1">
            {stats.passed}
          </div>
          <div className="text-xs text-text-muted">Passed</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-error mb-1">
            {stats.rejected}
          </div>
          <div className="text-xs text-text-muted">Rejected</div>
        </div>
      </div>

      {/* Status Chart */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-text-muted">Status Distribution</span>
        </div>
        <div className="flex h-4 rounded-full overflow-hidden bg-white/10">
          {chartData.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ width: 0 }}
              animate={{ width: `${(item.value / stats.total) * 100}%` }}
              transition={{ duration: 1, delay: index * 0.1 }}
              className={`h-4 ${item.color}`}
              title={`${item.label}: ${item.value}`}
            />
          ))}
        </div>
        <div className="flex justify-between text-xs text-text-muted mt-2">
          {chartData.map(item => (
            <span key={item.label}>
              {item.label}: {item.value}
            </span>
          ))}
        </div>
      </div>

      {/* Type Distribution */}
      <div>
        <div className="flex justify-between text-sm mb-3">
          <span className="text-text-muted">By Type</span>
        </div>
        <div className="space-y-2">
          {Object.entries(typeDistribution).map(([type, count], index) => (
            <motion.div
              key={type}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between text-sm"
            >
              <span className="text-text-secondary capitalize">
                {type.replace('_', ' ')}
              </span>
              <div className="flex items-center gap-2">
                <div className="w-16 bg-white/10 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(count / stats.total) * 100}%` }}
                    transition={{ duration: 1, delay: index * 0.2 }}
                    className="h-2 rounded-full bg-primary"
                  />
                </div>
                <span className="text-text-primary w-8 text-right">
                  {count}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-white/10 text-center">
        <div>
          <div className="text-lg font-bold text-warning mb-1">
            {stats.participationRate}%
          </div>
          <div className="text-xs text-text-muted">Participation</div>
        </div>
        <div>
          <div className="text-lg font-bold text-secondary mb-1">
            {stats.avgTurnout.toLocaleString()}
          </div>
          <div className="text-xs text-text-muted">Avg. Turnout</div>
        </div>
      </div>
    </Card>
  );
}