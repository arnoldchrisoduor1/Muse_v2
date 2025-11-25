// components/collaboration/CreateSessionModal.tsx
"use client";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, Settings, Share2 } from 'lucide-react';
import { useCollaborationStore } from '@/lib/store/collaboration-store';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

interface CreateSessionModalProps {
  onClose: () => void;
}

export function CreateSessionModal({ onClose }: CreateSessionModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [invitees, setInvitees] = useState<string[]>([]);
  const [newInvitee, setNewInvitee] = useState('');
  
  const { createSession, isCreatingSession } = useCollaborationStore();

  const handleCreateSession = async () => {
    try {
      if (!title.trim()) return;
      console.log("Attempting to create sesion");
      
      await createSession(title, description);
      console.log("session created successfully");
      onClose();
    } catch (error) {
      console.error("could not create session", error);
      onClose();
    }
    
  };

  const handleAddInvitee = () => {
    try {
        if (newInvitee.trim() && !invitees.includes(newInvitee)) {
        setInvitees([...invitees, newInvitee.trim()]);
        setNewInvitee('');
      }
      console.log("Invites sent successfully");
    } catch (error) {
      console.error("Could not send invite", error);
    }
  };

  const handleRemoveInvitee = (invitee: string) => {
    setInvitees(invitees.filter(i => i !== invitee));
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="glass-card max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Users className="text-primary" />
              Start New Collaboration
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Session Details */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-text-primary">
                  Session Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., 'Neon Dreams - Cyberpunk Poetry'"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-text-primary">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your collaboration project, themes, or goals..."
                  className="input-field min-h-[100px] resize-none"
                />
              </div>
            </div>

            {/* Invite Collaborators */}
            <Card className="p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Share2 size={18} className="text-secondary" />
                Invite Collaborators
              </h3>
              
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newInvitee}
                    onChange={(e) => setNewInvitee(e.target.value)}
                    placeholder="Enter username or email..."
                    className="input-field flex-1"
                  />
                  <Button
                    variant="secondary"
                    onClick={handleAddInvitee}
                    disabled={!newInvitee.trim()}
                  >
                    Add
                  </Button>
                </div>

                {invitees.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-sm text-text-muted">Invited:</label>
                    <div className="flex flex-wrap gap-2">
                      {invitees.map((invitee) => (
                        <div
                          key={invitee}
                          className="flex items-center gap-2 bg-primary/20 text-primary px-3 py-1 rounded-full text-sm"
                        >
                          {invitee}
                          <button
                            onClick={() => handleRemoveInvitee(invitee)}
                            className="hover:text-primary-dark"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Settings */}
            <Card className="p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Settings size={18} className="text-warning" />
                Collaboration Settings
              </h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary">Real-time Editing</span>
                  <span className="text-text-primary font-medium">Enabled</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary">Version History</span>
                  <span className="text-text-primary font-medium">Auto-save</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary">Ownership Negotiation</span>
                  <span className="text-text-primary font-medium">Required</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary">Auto-publish</span>
                  <span className="text-text-muted">Disabled</span>
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
              loading={isCreatingSession}
              onClick={handleCreateSession}
              disabled={!title.trim()}
              icon={Users}
            >
              Create Collaboration
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}