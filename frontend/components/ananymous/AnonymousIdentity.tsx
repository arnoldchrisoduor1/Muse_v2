"use client";
import { motion } from 'framer-motion';
import { Shield, EyeOff, DollarSign, FileText, TrendingUp } from 'lucide-react';
import { useAnonymousStore } from '@/lib/store/anonymous-store';
import { Card } from '@/components/ui/Card';
import { Button } from '../ui/Button';

export function AnonymousIdentity() {
  const { anonymousIdentity, publishedPoems } = useAnonymousStore();

  if (!anonymousIdentity) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="text-accent" size={20} />
          <h3 className="font-semibold">Anonymous Identity</h3>
        </div>
        <div className="text-center py-4">
          <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-text-secondary text-sm">Loading identity...</p>
        </div>
      </Card>
    );
  }

  const unclaimedEarnings = publishedPoems
    .filter(poem => !poem.isClaimed)
    .reduce((sum, poem) => sum + poem.earnings, 0);

  const stats = [
    {
      icon: FileText,
      label: 'Poems Published',
      value: anonymousIdentity.verifiedPoems.toString(),
      color: 'text-primary',
    },
    {
      icon: DollarSign,
      label: 'Total Earned',
      value: `$${anonymousIdentity.totalEarnings.toFixed(2)}`,
      color: 'text-accent',
    },
    {
      icon: TrendingUp,
      label: 'Anonymous Rep',
      value: `${anonymousIdentity.anonymousReputation}/100`,
      color: 'text-warning',
    },
    {
      icon: EyeOff,
      label: 'Identity Protection',
      value: '100%',
      color: 'text-secondary',
    },
  ];

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <Shield className="text-accent" size={20} />
        <h3 className="font-semibold">Anonymous Identity</h3>
      </div>

      {/* Identity Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="text-center p-3 rounded-lg bg-white/5"
            >
              <Icon size={20} className={`mx-auto mb-1 ${stat.color}`} />
              <div className={`text-lg font-bold ${stat.color}`}>
                {stat.value}
              </div>
              <div className="text-xs text-text-muted">
                {stat.label}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Unclaimed Earnings */}
      {unclaimedEarnings > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-accent/10 border border-accent/20 rounded-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-accent">Unclaimed Earnings</div>
              <div className="text-lg font-bold text-accent">${unclaimedEarnings.toFixed(2)}</div>
            </div>
            <Button variant="accent" size="sm">
              Claim Now
            </Button>
          </div>
        </motion.div>
      )}

      {/* Identity Age */}
      <div className="mt-4 pt-4 border-t border-white/10 text-center">
        <p className="text-xs text-text-muted">
          Identity created {new Date(anonymousIdentity.createdAt).toLocaleDateString()}
        </p>
        <p className="text-xs text-text-muted mt-1">
          Public Key: {anonymousIdentity.publicKey.substring(0, 16)}...
        </p>
      </div>
    </Card>
  );
}