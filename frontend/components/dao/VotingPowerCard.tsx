"use client";
import { motion } from 'framer-motion';
import { Gem, Users, TrendingUp, Target } from 'lucide-react';
import { useDAOStore } from '@/lib/store/dao-store';
import { Card } from '@/components/ui/Card';

export function VotingPowerCard() {
  const { userVotingPower, userDelegatedPower, userAvailablePower } = useDAOStore();

  const votingStats = [
    {
      icon: Gem,
      label: 'Total Power',
      value: userVotingPower.toLocaleString(),
      color: 'text-primary',
      description: 'Based on contributions',
    },
    {
      icon: Users,
      label: 'Delegated',
      value: userDelegatedPower.toLocaleString(),
      color: 'text-secondary',
      description: 'To other voters',
    },
    {
      icon: TrendingUp,
      label: 'Available',
      value: userAvailablePower.toLocaleString(),
      color: 'text-accent',
      description: 'For voting',
    },
    {
      icon: Target,
      label: 'Influence',
      value: `${((userVotingPower / 500000) * 100).toFixed(2)}%`,
      color: 'text-warning',
      description: 'Of total supply',
    },
  ];

  return (
    <Card className="p-6">
      <h3 className="font-semibold mb-4 flex items-center gap-2">
        <Gem className="text-primary" size={20} />
        Your Voting Power
      </h3>

      <div className="space-y-4">
        {votingStats.map((stat, index) => {
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
                <Icon size={20} className={stat.color} />
                <div>
                  <div className="text-sm font-medium text-text-primary">
                    {stat.label}
                  </div>
                  <div className="text-xs text-text-muted">
                    {stat.description}
                  </div>
                </div>
              </div>
              <div className={`text-lg font-bold ${stat.color}`}>
                {stat.value}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Power Breakdown */}
      <div className="mt-6 pt-4 border-t border-white/10">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-text-secondary">Power Distribution</span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-2">
          <div className="flex h-2 rounded-full">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(userAvailablePower / userVotingPower) * 100}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-2 rounded-l-full bg-accent"
            />
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(userDelegatedPower / userVotingPower) * 100}%` }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
              className="h-2 bg-secondary"
            />
          </div>
        </div>
        <div className="flex justify-between text-xs text-text-muted mt-2">
          <span>Available: {userAvailablePower.toLocaleString()}</span>
          <span>Delegated: {userDelegatedPower.toLocaleString()}</span>
        </div>
      </div>

      {/* Earning Tips */}
      <div className="mt-4 p-3 bg-primary/10 border border-primary/20 rounded-lg">
        <h4 className="text-sm font-medium text-primary mb-1">Earn More Power</h4>
        <ul className="text-xs text-text-secondary space-y-1">
          <li>• Publish high-quality poems (+50-200)</li>
          <li>• Get poems added to Collective (+100)</li>
          <li>• Successful collaborations (+75)</li>
          <li>• Active participation (+25/week)</li>
        </ul>
      </div>
    </Card>
  );
}