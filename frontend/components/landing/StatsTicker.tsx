"use client";
import { motion } from 'framer-motion';
import { BookOpen, Users, Zap, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { useState, useEffect } from 'react';

export function StatsTicker() {
  const [stats, setStats] = useState({
    totalPoems: 2847,
    activeCollaborations: 42,
    daoMembers: 892,
    collectiveQueries: 1567
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        totalPoems: prev.totalPoems + Math.floor(Math.random() * 3),
        activeCollaborations: prev.activeCollaborations + Math.floor(Math.random() * 2),
        daoMembers: prev.daoMembers + 1,
        collectiveQueries: prev.collectiveQueries + Math.floor(Math.random() * 5)
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const statItems = [
    { icon: BookOpen, value: stats.totalPoems, label: 'Total Poems', color: 'text-primary' },
    { icon: Users, value: stats.activeCollaborations, label: 'Active Collabs', color: 'text-secondary' },
    { icon: Zap, value: stats.daoMembers, label: 'DAO Members', color: 'text-accent' },
    { icon: TrendingUp, value: stats.collectiveQueries, label: 'Collective Queries', color: 'text-warning' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.6 }}
      className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto"
    >
      {statItems.map((stat, index) => (
        <StatCard key={stat.label} {...stat} index={index} />
      ))}
    </motion.div>
  );
}

function StatCard({ icon: Icon, value, label, color, index }: {
  icon: any;
  value: number;
  label: string;
  color: string;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7 + index * 0.1 }}
    >
      <Card className="p-4 text-center hover:bg-white/5 transition-colors cursor-pointer">
        <Icon size={24} className={`mx-auto mb-2 ${color}`} />
        <div className={`text-2xl font-bold ${color} mb-1`}>
          {value.toLocaleString()}
        </div>
        <div className="text-text-secondary text-sm">{label}</div>
      </Card>
    </motion.div>
  );
}