"use client";
import { motion } from 'framer-motion';
import { TrendingUp, Users, Eye, Heart, MessageSquare, Bookmark, Share2, Award } from 'lucide-react';
import { Card } from '@/components/ui/Card';

interface MetricsOverviewProps {
  metrics: any;
}

export function MetricsOverview({ metrics }: MetricsOverviewProps) {
  if (!metrics) return null;

  const engagementMetrics = [
    {
      icon: Eye,
      label: 'Views',
      value: metrics.totalViews.toLocaleString(),
      change: '+8.2%',
      color: 'text-blue-400',
    },
    {
      icon: Heart,
      label: 'Likes',
      value: metrics.totalLikes.toLocaleString(),
      change: '+12.4%',
      color: 'text-pink-400',
    },
    {
      icon: MessageSquare,
      label: 'Comments',
      value: '1.2K', // Mock data
      change: '+5.7%',
      color: 'text-green-400',
    },
    {
      icon: Bookmark,
      label: 'Bookmarks',
      value: '856', // Mock data
      change: '+9.3%',
      color: 'text-yellow-400',
    },
    {
      icon: Share2,
      label: 'Shares',
      value: '2.4K', // Mock data
      change: '+15.8%',
      color: 'text-purple-400',
    },
    {
      icon: Users,
      label: 'New Followers',
      value: '+124', // Mock data
      change: '+3.1%',
      color: 'text-cyan-400',
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Main Metrics Card */}
      <Card className="p-6 lg:col-span-2">
        <h3 className="font-semibold mb-6 flex items-center gap-2">
          <TrendingUp className="text-primary" size={20} />
          Performance Overview
        </h3>
        
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-accent mb-2">
              ${metrics.totalEarnings.toFixed(2)}
            </div>
            <div className="text-sm text-text-muted">Total Earnings</div>
            <div className="text-xs text-green-400 mt-1">+12.5% this month</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">
              {metrics.engagementRate}%
            </div>
            <div className="text-sm text-text-muted">Engagement Rate</div>
            <div className="text-xs text-green-400 mt-1">+0.4% from last month</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-warning mb-2">
              {metrics.avgQualityScore}
            </div>
            <div className="text-sm text-text-muted">Avg Quality Score</div>
            <div className="text-xs text-green-400 mt-1">+2 points improvement</div>
          </div>
        </div>

        {/* Monthly Earnings Progress */}
        <div className="mt-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-text-muted">Monthly Earnings Goal</span>
            <span className="text-text-primary font-medium">
              ${metrics.monthlyEarnings.toFixed(2)} / $50.00
            </span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(metrics.monthlyEarnings / 50) * 100}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-2 rounded-full bg-gradient-90 from-accent to-primary"
            />
          </div>
          <div className="text-xs text-text-muted mt-1">
            {((metrics.monthlyEarnings / 50) * 100).toFixed(1)}% of monthly goal
          </div>
        </div>
      </Card>

      {/* Engagement Metrics */}
      <Card className="p-6">
        <h3 className="font-semibold mb-6 flex items-center gap-2">
          <Users className="text-secondary" size={20} />
          Engagement Metrics
        </h3>
        
        <div className="space-y-4">
          {engagementMetrics.map((metric, index) => {
            const Icon = metric.icon;
            
            return (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Icon size={20} className={metric.color} />
                  <div>
                    <div className="text-sm font-medium text-text-primary">
                      {metric.label}
                    </div>
                    <div className="text-xs text-text-muted">
                      {metric.change} increase
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-text-primary">
                    {metric.value}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}