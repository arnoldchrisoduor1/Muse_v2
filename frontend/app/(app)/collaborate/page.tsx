"use client";
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Plus, Clock, Zap, TrendingUp, Mail, AlertCircle } from 'lucide-react';
import { CollaborationSessionList } from '@/components/collaboration/CollaborationSessionList';
import { CreateSessionModal } from '@/components/collaboration/CreateSessionModal';
import { QuickStats } from '@/components/collaboration/QuickStats';
import { useCollaborationStore } from '@/lib/store/collaboration-store';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export default function CollaboratePage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { 
    activeSessions, 
    invitedSessions, 
    loadActiveSessions, 
    loadInvitedSessions,
    isLoading,
    error
  } = useCollaborationStore();

  useEffect(() => {
    loadActiveSessions();
    loadInvitedSessions();
  }, [loadActiveSessions, loadInvitedSessions]);

  // Real stats based on actual data
  const totalCollaborators = activeSessions.reduce((total, session) => 
    total + session.participants.filter((p: any) => p.approvalStatus === 'approved').length, 0
  );
  
  const pendingInvitations = invitedSessions.length;
  const totalCharacters = activeSessions.reduce((total, session) => 
    total + session.participants.reduce((sum: number, p: any) => sum + p.charactersAdded, 0), 0
  );

  const stats = [
    {
      icon: Users,
      label: 'Active Sessions',
      value: activeSessions.length.toString(),
      color: 'text-primary',
      change: `${activeSessions.filter(s => s.status === 'active').length} active`,
    },
    {
      icon: Mail,
      label: 'Pending Invites',
      value: pendingInvitations.toString(),
      color: 'text-warning',
      change: pendingInvitations > 0 ? 'Needs attention' : 'All clear',
    },
    {
      icon: Zap,
      label: 'Collaborators',
      value: totalCollaborators.toString(),
      color: 'text-accent',
      change: 'Across all sessions',
    },
    {
      icon: TrendingUp,
      label: 'Total Contributions',
      value: `${(totalCharacters / 1000).toFixed(1)}k`,
      color: 'text-secondary',
      change: 'Characters written',
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

      {/* Error Alert */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Card className="p-4 bg-error/20 border-error/30">
            <div className="flex items-center gap-3">
              <AlertCircle className="text-error" size={20} />
              <div>
                <div className="font-medium text-error">Error</div>
                <div className="text-sm text-text-secondary">{error}</div>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

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
        <div className="xl:col-span-2 space-y-8">
          {/* Pending Invitations - Show first if any */}
          {invitedSessions.length > 0 && (
            <CollaborationSessionList
              title="Pending Invitations"
              sessions={invitedSessions}
              type="invited"
              priority={true}
            />
          )}

          {/* Active Sessions */}
          <CollaborationSessionList
            title="Your Active Collaborations"
            sessions={activeSessions}
            type="active"
          />

          {/* Empty State when no sessions */}
          {activeSessions.length === 0 && invitedSessions.length === 0 && !isLoading && (
            <Card className="p-12 text-center">
              <Users size={64} className="text-text-muted mx-auto mb-6" />
              <h3 className="text-2xl font-bold mb-4">No Collaborations Yet</h3>
              <p className="text-text-secondary mb-6 max-w-md mx-auto">
                Start your first collaboration to write poetry with others, split ownership fairly, and publish together.
              </p>
              <Button
                variant="primary"
                icon={Plus}
                onClick={() => setShowCreateModal(true)}
                size="lg"
              >
                Start Your First Collaboration
              </Button>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <QuickStats />
          
          {/* Quick Actions */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4 text-primary">Quick Actions</h3>
            <div className="space-y-3">
              <Button
                variant="primary"
                className="w-full justify-center"
                onClick={() => setShowCreateModal(true)}
                icon={Plus}
              >
                New Session
              </Button>
              {invitedSessions.length > 0 && (
                <Link href={`/collaboration/invite/${invitedSessions[0].id}`} className="block">
                  <Button
                    variant="primary"
                    className="w-full justify-center"
                    icon={Mail}
                  >
                    Review Invitations
                  </Button>
                </Link>
              )}
            </div>
          </Card>

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
        </div>
      </div>

      {/* Create Session Modal */}
      {showCreateModal && (
        <CreateSessionModal onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  );
}