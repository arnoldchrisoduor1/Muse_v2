"use client";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UserPlus, Mail } from 'lucide-react';
import { useCollaborationStore } from '@/lib/store/collaboration-store';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

interface InviteCollaboratorModalProps {
  sessionId: string;
  onClose: () => void;
}

export function InviteCollaboratorModal({ sessionId, onClose }: InviteCollaboratorModalProps) {
  const [inviteeIdentifier, setInviteeIdentifier] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { inviteCollaborator } = useCollaborationStore();

  const handleInvite = async () => {
    if (!inviteeIdentifier.trim()) return;

    setIsLoading(true);
    try {
      await inviteCollaborator(sessionId, inviteeIdentifier);
      setInviteeIdentifier('');
      setMessage('');
      onClose();
    } catch (error) {
      console.error('Failed to invite collaborator:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="glass-card max-w-md w-full"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <UserPlus className="text-primary" />
              Invite Collaborator
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-text-primary">
                Username or Email *
              </label>
              <input
                type="text"
                value={inviteeIdentifier}
                onChange={(e) => setInviteeIdentifier(e.target.value)}
                placeholder="Enter username or email address..."
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-text-primary">
                Personal Message (Optional)
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Add a personal message to your invitation..."
                className="input-field min-h-[80px] resize-none"
              />
            </div>

            <Card className="p-4 bg-primary/10 border-primary/20">
              <div className="flex items-start gap-3">
                <Mail size={16} className="text-primary mt-0.5" />
                <div className="text-sm text-text-secondary">
                  The invited user will receive a notification and can choose to accept or decline the collaboration invitation.
                </div>
              </div>
            </Card>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-white/10">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            
            <Button
              variant="primary"
              loading={isLoading}
              onClick={handleInvite}
              disabled={!inviteeIdentifier.trim()}
              icon={UserPlus}
            >
              Send Invitation
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}