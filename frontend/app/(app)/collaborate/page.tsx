"use client";
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Plus, Clock, Zap, TrendingUp } from 'lucide-react';
import { CollaborationSessionList } from '@/components/collaboration/CollaborationSessionList';
import { CreateSessionModal } from '@/components/collaboration/CreateSessionModal';
import { QuickStats } from '@/components/collaboration/QuickStats';
import { useCollaborationStore } from '@/lib/store/collaboration-store';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function CollaboratePage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { 
    activeSessions, 
    invitedSessions, 
    loadActiveSessions, 
    loadInvitedSessions
  } = useCollaborationStore();

  useEffect(() => {
    loadActiveSessions();
    loadInvitedSessions();
  }, [loadActiveSessions, loadInvitedSessions]);

  const stats = [
    {
      icon: Users,
      label: 'Active Collaborations',
      value: activeSessions.length.toString(),
      color: 'text-primary',
      change: '+2 this week',
    },
    {
      icon: Clock,
      label: 'Total Time',
      value: '24h',
      color: 'text-secondary',
      change: 'Across all sessions',
    },
    {
      icon: Zap,
      label: 'Collaborators',
      value: '8',
      color: 'text-accent',
      change: 'Working with you',
    },
    {
      icon: TrendingUp,
      label: 'Success Rate',
      value: '85%',
      color: 'text-warning',
      change: 'Projects completed',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="text-4xl font-bold gradient-text mb-2">Collaborate</h1>
          <p className="text-text-secondary text-lg">
            Write poetry together in real-time. Split ownership and revenue fairly.
          </p>
        </div>
        
        <Button
          variant="primary"
          icon={Plus}
          onClick={() => setShowCreateModal(true)}
        >
          New Collaboration
        </Button>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 xl:grid-cols-4 gap-6 mb-12"
      >
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
                  {stat.change}
                </div>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Active Sessions */}
          <CollaborationSessionList
            title="Your Active Collaborations"
            sessions={activeSessions}
            type="active"
          />

          {/* Invited Sessions */}
          <CollaborationSessionList
            title="Pending Invitations"
            sessions={invitedSessions}
            type="invited"
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <QuickStats />
          
          {/* How It Works */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Users className="text-primary" size={20} />
              How Collaboration Works
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-primary text-xs font-bold">1</span>
                </div>
                <p className="text-text-secondary">
                  Start or join a collaboration session
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-primary text-xs font-bold">2</span>
                </div>
                <p className="text-text-secondary">
                  Write together in real-time with live cursors
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-primary text-xs font-bold">3</span>
                </div>
                <p className="text-text-secondary">
                  Negotiate ownership splits based on contributions
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-primary text-xs font-bold">4</span>
                </div>
                <p className="text-text-secondary">
                  Publish as fractional NFT with automatic revenue sharing
                </p>
              </div>
            </div>
          </Card>

          {/* Benefits */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4 text-primary">Collaboration Benefits</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-text-secondary">Revenue Sharing</span>
                <span className="text-primary font-medium">Automatic</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Ownership Tracking</span>
                <span className="text-primary font-medium">Blockchain</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Real-time Editing</span>
                <span className="text-primary font-medium">Live</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Version Control</span>
                <span className="text-primary font-medium">Full History</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Create Session Modal */}
      {showCreateModal && (
        <CreateSessionModal onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  );
}