"use client";
import { motion } from 'framer-motion';
import { BookOpen, Users, DollarSign, Eye, Heart, Award } from 'lucide-react';
import { Card } from '@/components/ui/Card';

interface ProfileStatsProps {
  profile: any;
  poems: any[];
}

export function ProfileStats({ profile, poems }: ProfileStatsProps) {
  const stats = [
    {
      icon: BookOpen,
      label: 'Poems Published',
      value: poems.length,
      color: 'text-primary',
    },
    {
      icon: Users,
      label: 'Collaborations',
      value: profile.totalCollaborations,
      color: 'text-secondary',
    },
    {
      icon: DollarSign,
      label: 'Total Earnings',
      value: profile.totalEarnings,
      color: 'text-accent',
    },
    {
      icon: Eye,
      label: 'Poems Read',
      value: profile?.poemsRead?.toLocaleString(),
      color: 'text-warning',
    },
    {
      icon: Heart,
      label: 'Poems Liked',
      value: profile?.poemsLiked?.toLocaleString(),
      color: 'text-pink-500',
    },
    {
      icon: Award,
      label: 'Reputation',
      value: profile.reputation,
      color: 'text-purple-500',
    },
  ];

  return (
    <Card className="p-6">
      <h3 className="font-semibold mb-4">Stats & Achievements</h3>
      <div className="grid grid-cols-1 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="text-center p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
            >
              <Icon size={20} className={`mx-auto mb-2 ${stat.color}`} />
              <div className={`text-lg font-bold ${stat.color} mb-1`}>
                {stat.value}
              </div>
              <div className="text-xs text-text-muted">
                {stat.label}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Collective Contributor Status */}
      {profile.isCollectiveContributor && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-4 p-3 bg-accent/10 border border-accent/20 rounded-lg"
        >
          <div className="flex items-center gap-2 text-accent text-sm">
            <Award size={16} />
            <span className="font-medium">Collective Contributor</span>
          </div>
          <p className="text-xs text-text-secondary mt-1">
            Your poems are training the Collective Consciousness AI
          </p>
        </motion.div>
      )}
    </Card>
  );
}