"use client";
import { motion } from 'framer-motion';
import { Award, Sparkles, Users, TrendingUp, Star, Shield } from 'lucide-react';
import { Card } from '@/components/ui/Card';

interface BadgeDisplayProps {
  badges: any[];
}

const badgeIcons = {
  'collective_contributor': Sparkles,
  'top_curator': Award,
  'early_adopter': Star,
  'collaboration_master': Users,
  'remix_artist': TrendingUp,
  'trending_poet': Shield,
};

const badgeColors = {
  'collective_contributor': 'from-purple-500 to-pink-500',
  'top_curator': 'from-yellow-500 to-orange-500',
  'early_adopter': 'from-blue-500 to-cyan-500',
  'collaboration_master': 'from-green-500 to-emerald-500',
  'remix_artist': 'from-red-500 to-pink-500',
  'trending_poet': 'from-indigo-500 to-purple-500',
};

export function BadgeDisplay({ badges }: BadgeDisplayProps) {
  if (badges?.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Award className="text-warning" size={20} />
          Badges
        </h3>
        <p className="text-text-secondary text-sm text-center py-4">
          No badges yet. Keep contributing to earn recognition!
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="font-semibold mb-4 flex items-center gap-2">
        <Award className="text-warning" size={20} />
        Badges ({badges?.length})
      </h3>
      
      <div className="grid grid-cols-2 gap-4">
        {badges?.map((badge, index) => {
          const Icon = badgeIcons[badge.type as keyof typeof badgeIcons] || Award;
          const color = badgeColors[badge.type as keyof typeof badgeColors] || 'from-gray-500 to-gray-700';
          
          return (
            <motion.div
              key={badge.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="text-center group cursor-help"
              title={badge?.description}
            >
              <div className={`w-12 h-12 rounded-lg bg-gradient-90 ${color} flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform`}>
                <Icon size={20} className="text-white" />
              </div>
              <div className="text-xs font-medium text-text-primary line-clamp-2">
                {badge?.displayName}
              </div>
              <div className="text-xs text-text-muted mt-1">
  {badge.earnedAt.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
</div>

            </motion.div>
          );
        })}
      </div>
    </Card>
  );
}