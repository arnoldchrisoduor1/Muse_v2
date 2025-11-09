"use client";
import { motion } from 'framer-motion';
import { Users, TrendingUp, DollarSign, CheckCircle, Clock, Award, Share2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';

interface CollaborationAnalyticsProps {
  insights: any;
}

export function CollaborationAnalytics({ insights }: CollaborationAnalyticsProps) {
  if (!insights) {
    return (
      <Card className="p-8 text-center">
        <Users size={48} className="text-text-muted mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No collaboration data</h3>
        <p className="text-text-secondary">Start collaborating to see analytics here.</p>
      </Card>
    );
  }

  const stats = [
    {
      icon: Users,
      label: 'Total Collaborations',
      value: insights.totalCollaborations,
      color: 'text-primary',
      description: 'All-time collaborative projects',
    },
    {
      icon: CheckCircle,
      label: 'Completed',
      value: insights.completedCollaborations,
      color: 'text-accent',
      description: 'Successfully finished projects',
    },
    {
      icon: Clock,
      label: 'Active',
      value: insights.activeCollaborations,
      color: 'text-warning',
      description: 'Currently ongoing projects',
    },
    {
      icon: DollarSign,
      label: 'Collaboration Earnings',
      value: `$${insights.totalCollaborationEarnings.toFixed(2)}`,
      color: 'text-green-400',
      description: 'Revenue from collaborations',
    },
  ];

  const successRate = insights.totalCollaborations > 0 
    ? (insights.completedCollaborations / insights.totalCollaborations) * 100 
    : 0;

  return (
    <div className="space-y-6">
      {/* Collaboration Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                  {stat.description}
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Success Metrics */}
        <Card className="p-6">
          <h3 className="font-semibold mb-6 flex items-center gap-2">
            <TrendingUp className="text-primary" size={20} />
            Success Metrics
          </h3>
          
          <div className="space-y-6">
            {/* Success Rate */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-text-muted">Completion Rate</span>
                <span className="text-text-primary font-medium">
                  {successRate.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${successRate}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className={`h-2 rounded-full ${
                    successRate >= 80 ? 'bg-accent' :
                    successRate >= 60 ? 'bg-primary' :
                    'bg-warning'
                  }`}
                />
              </div>
            </div>

            {/* Average Earnings per Collaboration */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-text-muted">Avg. Earnings per Project</span>
                <span className="text-text-primary font-medium">
                  ${(insights.totalCollaborationEarnings / insights.totalCollaborations).toFixed(2)}
                </span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '65%' }} // Mock data
                  transition={{ duration: 1, delay: 0.3 }}
                  className="h-2 rounded-full bg-green-400"
                />
              </div>
            </div>

            {/* Collaboration Frequency */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-text-muted">Projects per Month</span>
                <span className="text-text-primary font-medium">
                  {(insights.totalCollaborations / 12).toFixed(1)} {/* Assuming 12 months */}
                </span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '45%' }} // Mock data
                  transition={{ duration: 1, delay: 0.6 }}
                  className="h-2 rounded-full bg-blue-400"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Top Collaborators */}
        <Card className="p-6">
          <h3 className="font-semibold mb-6 flex items-center gap-2">
            <Award className="text-warning" size={20} />
            Top Collaborators
          </h3>
          
          <div className="space-y-4">
            {insights.topCollaborators.map((collaborator: any, index: number) => (
              <motion.div
                key={collaborator.username}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-90 from-primary to-secondary flex items-center justify-center">
                    <span className="text-white text-xs font-bold">
                      {collaborator.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-text-primary">
                      {collaborator.username}
                    </div>
                    <div className="text-xs text-text-muted">
                      {collaborator.collaborations} project{collaborator.collaborations !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-accent">
                    ${collaborator.earnings.toFixed(2)}
                  </div>
                  <div className="text-xs text-text-muted">
                    Earned together
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Collaboration Tips */}
          <div className="mt-6 p-4 bg-primary/10 border border-primary/20 rounded-lg">
            <h4 className="font-semibold text-primary mb-2 flex items-center gap-2">
              <Share2 size={16} />
              Collaboration Tips
            </h4>
            <ul className="text-xs text-text-secondary space-y-1">
              <li>• Clear communication improves project success by 40%</li>
              <li>• Set ownership splits early to avoid disputes</li>
              <li>• Use real-time editing for better coordination</li>
              <li>• Regular check-ins maintain project momentum</li>
            </ul>
          </div>
        </Card>
      </div>

      {/* Collaboration Impact */}
      <Card className="p-6">
        <h3 className="font-semibold mb-6">Collaboration Impact</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div>
            <div className="text-2xl font-bold text-primary mb-1">
              +{Math.round(insights.totalCollaborationEarnings * 0.3)}%
            </div>
            <div className="text-sm text-text-muted">Earnings Boost</div>
            <div className="text-xs text-text-secondary mt-1">
              Compared to solo work
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-secondary mb-1">
              {Math.round(insights.topCollaborators.length * 1.5)}x
            </div>
            <div className="text-sm text-text-muted">Audience Reach</div>
            <div className="text-xs text-text-secondary mt-1">
              Through collaborator networks
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-accent mb-1">
              {successRate >= 80 ? 'High' : successRate >= 60 ? 'Good' : 'Developing'}
            </div>
            <div className="text-sm text-text-muted">Success Rating</div>
            <div className="text-xs text-text-secondary mt-1">
              Based on completion rate
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}