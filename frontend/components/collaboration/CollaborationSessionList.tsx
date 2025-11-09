"use client";
import { motion } from 'framer-motion';
import { Users, Clock, Edit, Zap, TrendingUp } from 'lucide-react';
import { useCollaborationStore } from '@/lib/store/collaboration-store';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface CollaborationSessionListProps {
  title: string;
  sessions: any[];
  type: 'active' | 'invited';
}

export function CollaborationSessionList({ title, sessions, type }: CollaborationSessionListProps) {
  const { joinSession } = useCollaborationStore();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-accent';
      case 'draft': return 'text-warning';
      case 'completed': return 'text-primary';
      default: return 'text-text-muted';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return Zap;
      case 'draft': return Edit;
      case 'completed': return TrendingUp;
      default: return Clock;
    }
  };

  if (sessions.length === 0) {
    return (
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Users className="text-primary" size={20} />
          {title}
        </h2>
        <div className="text-center py-8">
          <Users size={48} className="text-text-muted mx-auto mb-4" />
          <p className="text-text-secondary mb-2">
            {type === 'active' ? 'No active collaborations' : 'No pending invitations'}
          </p>
          <p className="text-text-muted text-sm">
            {type === 'active' 
              ? 'Start a new collaboration to see it here' 
              : 'You\'ll see invitations here when others invite you'
            }
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Users className="text-primary" size={20} />
          {title}
          <span className="text-sm bg-primary/20 text-primary px-2 py-1 rounded-full">
            {sessions.length}
          </span>
        </h2>
      </div>

      <div className="space-y-4">
        {sessions.map((session, index) => {
          const StatusIcon = getStatusIcon(session.status);
          const onlineParticipants = session.participants.filter((p: any) => p.isOnline);
          const totalContributions = session.participants.reduce((sum: number, p: any) => sum + p.charactersAdded, 0);
          
          return (
            <motion.div
              key={session.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-text-primary group-hover:text-primary transition-colors">
                      {session.title}
                    </h3>
                    <div className={`flex items-center gap-1 text-xs ${getStatusColor(session.status)}`}>
                      <StatusIcon size={14} />
                      <span className="capitalize">{session.status}</span>
                    </div>
                  </div>
                  <p className="text-text-secondary text-sm mb-2 line-clamp-2">
                    {session.description}
                  </p>
                </div>
                
                {type === 'invited' && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => joinSession(session.id)}
                    className="ml-4 flex-shrink-0"
                  >
                    Join
                  </Button>
                )}
              </div>

              {/* Session Details */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-4 text-text-muted">
                  {/* Participants */}
                  <div className="flex items-center gap-2">
                    <Users size={14} />
                    <span>
                      {onlineParticipants.length}/{session.participants.length} online
                    </span>
                  </div>

                  {/* Contributions */}
                  <div className="flex items-center gap-2">
                    <Edit size={14} />
                    <span>{totalContributions.toLocaleString()} chars</span>
                  </div>

                  {/* Last Updated */}
                  <div className="flex items-center gap-2">
                    <Clock size={14} />
                    <span>
                      {new Date(session.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {type === 'active' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {/* Navigate to session */}}
                  >
                    Continue
                  </Button>
                )}
              </div>

              {/* Ownership Status */}
              {session.ownershipProposal && (
                <div className="mt-3 pt-3 border-t border-white/10">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-text-muted">Ownership Proposal</span>
                    <div className={`px-2 py-1 rounded-full ${
                      session.ownershipProposal.status === 'approved'
                        ? 'bg-accent/20 text-accent'
                        : session.ownershipProposal.status === 'pending'
                        ? 'bg-warning/20 text-warning'
                        : 'bg-error/20 text-error'
                    }`}>
                      {session.ownershipProposal.status === 'approved' ? 'Approved' :
                       session.ownershipProposal.status === 'pending' ? 'Pending Approval' : 'Rejected'}
                    </div>
                  </div>
                  
                  {/* Split Preview */}
                  {session.ownershipProposal.status === 'pending' && (
                    <div className="flex items-center gap-2 mt-2">
                      {session.ownershipProposal.splits.slice(0, 3).map((split: any) => (
                        <div key={split.userId} className="text-xs text-text-muted">
                          {split.username}: {split.percentage}%
                        </div>
                      ))}
                      {session.ownershipProposal.splits.length > 3 && (
                        <div className="text-xs text-text-muted">
                          +{session.ownershipProposal.splits.length - 3} more
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </Card>
  );
}