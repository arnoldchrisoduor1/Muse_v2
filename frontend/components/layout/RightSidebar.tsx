// components/layout/RightSidebar.tsx
"use client";
import { motion } from 'framer-motion';
import { TrendingUp, Users, Sparkles, DollarSign, BookOpen } from 'lucide-react';
import { Card } from '@/components/ui/Card';

export function RightSidebar() {
  const mockStats = {
    dailyEarnings: 3.45,
    poemsRead: 12,
    newFollowers: 2,
    collectiveQueries: 8,
    activeCollaborations: 1
  };

  return (
    <div className="space-y-6 h-full overflow-y-auto no-scrollbar pb-20 lg:pb-6">
      {/* Quick Stats */}
      <Card className="p-4">
        <h3 className="text-sm font-semibold text-text-muted mb-3 flex items-center gap-2">
          <TrendingUp size={16} />
          Today's Stats
        </h3>
        <div className="space-y-3">
          <StatItem 
            icon={DollarSign} 
            label="Earnings" 
            value={`$${mockStats.dailyEarnings}`} 
            color="text-accent" 
          />
          <StatItem 
            icon={BookOpen} 
            label="Poems Read" 
            value={mockStats.poemsRead.toString()} 
            color="text-primary" 
          />
          <StatItem 
            icon={Users} 
            label="New Followers" 
            value={mockStats.newFollowers.toString()} 
            color="text-secondary" 
          />
          <StatItem 
            icon={Sparkles} 
            label="Collective Queries" 
            value={mockStats.collectiveQueries.toString()} 
            color="text-warning" 
          />
        </div>
      </Card>

      {/* Platform Health */}
      <Card className="p-4">
        <h3 className="text-sm font-semibold text-text-muted mb-3">Platform Health</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-text-secondary">Total Poems</span>
            <span className="text-text-primary font-medium">2,847</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">Active Poets</span>
            <span className="text-text-primary font-medium">892</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">DAO Treasury</span>
            <span className="text-text-primary font-medium">34.2 ETH</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">Collective Training</span>
            <span className="text-accent font-medium">Active</span>
          </div>
        </div>
      </Card>

      {/* Recent Activity */}
      <Card className="p-4">
        <h3 className="text-sm font-semibold text-text-muted mb-3">Recent Activity</h3>
        <div className="space-y-3">
          <ActivityItem 
            type="poem_published"
            user="sarah_poet"
            poem="Digital Solitude"
            time="2h ago"
          />
          <ActivityItem 
            type="collective_query"
            user="raj_writer"
            poem="What is hope after heartbreak?"
            time="4h ago"
          />
          <ActivityItem 
            type="collaboration_started"
            user="alex_poet"
            poem="Neon Dreams Part 1"
            time="6h ago"
          />
        </div>
      </Card>
    </div>
  );
}

// Helper Components
function StatItem({ icon: Icon, label, value, color }: { 
  icon: any; 
  label: string; 
  value: string; 
  color: string; 
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Icon size={16} className="text-text-muted" />
        <span className="text-text-secondary text-sm">{label}</span>
      </div>
      <span className={`font-semibold ${color}`}>{value}</span>
    </div>
  );
}

function ActivityItem({ type, user, poem, time }: {
  type: string;
  user: string;
  poem: string;
  time: string;
}) {
  const getIcon = () => {
    switch (type) {
      case 'poem_published': return '📝';
      case 'collective_query': return '💭';
      case 'collaboration_started': return '👥';
      default: return '🔔';
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-start gap-3 text-sm"
    >
      <span className="text-lg">{getIcon()}</span>
      <div className="flex-1 min-w-0">
        <p className="text-text-primary truncate">
          <span className="font-medium">@{user}</span> {type.replace('_', ' ')}
        </p>
        <p className="text-text-secondary text-xs truncate">"{poem}"</p>
        <p className="text-text-muted text-xs">{time}</p>
      </div>
    </motion.div>
  );
}