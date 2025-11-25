"use client";
import { motion } from 'framer-motion';
import { Users, User, Crown, Clock, Edit } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface Collaborator {
  userId: string;
  username: string;
  avatarUrl: string;
  sharePercentage: number;
  contributionType: string;
  approvalStatus: string;
  isOnline: boolean;
  charactersAdded: number;
  editsCount: number;
}

interface CollaboratorListProps {
  collaborators: Collaborator[];
  sessionId: string;
  isOwner: boolean;
}

export function CollaboratorList({ collaborators, sessionId, isOwner }: CollaboratorListProps) {
  const pendingCollaborators = collaborators.filter(c => c.approvalStatus === 'pending');
  const approvedCollaborators = collaborators.filter(c => c.approvalStatus === 'approved');

  return (
    <Card className="p-6">
      <h3 className="font-semibold mb-4 flex items-center gap-2">
        <Users className="text-primary" size={20} />
        Collaborators
        <span className="text-sm bg-primary/20 text-primary px-2 py-1 rounded-full">
          {approvedCollaborators.length}
        </span>
      </h3>

      {/* Approved Collaborators */}
      <div className="space-y-3 mb-4">
        {approvedCollaborators.map((collaborator, index) => (
          <motion.div
            key={collaborator.userId}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                  <User size={16} className="text-primary" />
                </div>
                {collaborator.isOnline && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full border-2 border-background"></div>
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{collaborator.username}</span>
                  {collaborator.userId === 'owner-id' && ( // Replace with actual owner check
                    <Crown size={12} className="text-warning" />
                  )}
                </div>
                <div className="flex items-center gap-4 text-xs text-text-muted">
                  <span>{collaborator.sharePercentage}%</span>
                  <span>{collaborator.charactersAdded} chars</span>
                  <span>{collaborator.editsCount} edits</span>
                </div>
              </div>
            </div>
            
            <div className={`text-xs px-2 py-1 rounded-full ${
              collaborator.isOnline ? 'bg-accent/20 text-accent' : 'bg-gray-500/20 text-gray-400'
            }`}>
              {collaborator.isOnline ? 'Online' : 'Offline'}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Pending Invitations */}
      {pendingCollaborators.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-text-secondary mb-2 flex items-center gap-2">
            <Clock size={14} />
            Pending Invitations ({pendingCollaborators.length})
          </h4>
          <div className="space-y-2">
            {pendingCollaborators.map((collaborator) => (
              <div
                key={collaborator.userId}
                className="flex items-center justify-between p-2 bg-warning/10 rounded text-sm"
              >
                <span className="text-text-secondary">{collaborator.username}</span>
                <div className="flex gap-1">
                  {isOwner && (
                    <Button variant="outline" size="sm">
                      Remind
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Contribution Stats */}
      <div className="mt-4 pt-4 border-t border-white/10">
        <div className="flex justify-between text-xs text-text-muted">
          <span>Total Contributions:</span>
          <span>{approvedCollaborators.reduce((sum, c) => sum + c.charactersAdded, 0).toLocaleString()} characters</span>
        </div>
        <div className="flex justify-between text-xs text-text-muted mt-1">
          <span>Total Edits:</span>
          <span>{approvedCollaborators.reduce((sum, c) => sum + c.editsCount, 0)} edits</span>
        </div>
      </div>
    </Card>
  );
}