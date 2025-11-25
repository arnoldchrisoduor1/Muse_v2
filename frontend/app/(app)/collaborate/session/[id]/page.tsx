"use client";
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Users, Edit, Share2, Settings, Save, Send } from 'lucide-react';
import { useCollaborationStore } from '@/lib/store/collaboration-store';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CollaboratorList } from '@/components/collaboration/CollaboratorList';
import { OwnershipProposalModal } from '@/components/collaboration/OwnershipProposalModal';
import { InviteCollaboratorModal } from '@/components/collaboration/InviteCollaboratorModal';
import { useAuth } from '@/app/hooks/useAuth';

export default function CollaborationSessionPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;
  
  const {
    currentSession,
    getSession,
    updateContent,
    isSaving,
    error
  } = useCollaborationStore();

  const { user } = useAuth();

  const [content, setContent] = useState('');
  const [showOwnershipModal, setShowOwnershipModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    if (sessionId) {
      loadSession();
    }
  }, [sessionId]);

  useEffect(() => {
    if (currentSession) {
      setContent(currentSession.content);
      setIsOwner(currentSession.ownerId === 'current-user-id'); // You'll need to get current user ID
    }
  }, [currentSession]);

  const loadSession = async () => {
    try {
      await getSession(sessionId);
    } catch (error) {
      console.error('Failed to load session:', error);
      router.push('/collaborate');
    }
  };

  const handleSaveContent = async () => {
    try {
        if (user) {
            await updateContent(sessionId, content, user.id);
        }
    } catch (error) {
      console.error('Failed to update content:', error);
    }
  };

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    // Auto-save after delay
    // You might want to implement debounced auto-save
  };

  if (!currentSession) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            icon={ArrowLeft}
            onClick={() => router.push('/collaborate')}
          >
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold gradient-text">{currentSession.title}</h1>
            <p className="text-text-secondary">{currentSession.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isOwner && (
            <>
              <Button
                variant="outline"
                icon={Share2}
                onClick={() => setShowInviteModal(true)}
              >
                Invite
              </Button>
              <Button
                variant="outline"
                icon={Users}
                onClick={() => setShowOwnershipModal(true)}
              >
                Ownership
              </Button>
            </>
          )}
          <Button
            variant="primary"
            icon={Save}
            loading={isSaving}
            onClick={handleSaveContent}
          >
            Save
          </Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* Main Editor - 3/4 width */}
        <div className="xl:col-span-3">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Edit className="text-primary" />
                Collaborative Editor
              </h2>
              <div className="text-sm text-text-muted">
                {content.length} characters
              </div>
            </div>

            <textarea
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
              placeholder="Start writing your collaborative poem here..."
              className="w-full h-96 p-4 bg-background border border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none font-serif leading-relaxed text-lg"
            />

            {/* Real-time collaboration indicators */}
            <div className="mt-4 flex items-center gap-4 text-sm text-text-muted">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
                <span>3 collaborators online</span>
              </div>
              <div>Last saved: 2 minutes ago</div>
            </div>
          </Card>

          {/* Version History */}
          {currentSession.versionHistory.length > 0 && (
            <Card className="p-6 mt-6">
              <h3 className="text-lg font-bold mb-4">Version History</h3>
              <div className="space-y-3">
                {currentSession.versionHistory.slice(0, 5).map((version) => (
                  <div key={version.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div>
                      <div className="font-medium">{version.authorName}</div>
                      <div className="text-sm text-text-muted">{version.changeDescription}</div>
                    </div>
                    <div className="text-sm text-text-muted">
                      {new Date(version.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar - 1/4 width */}
        <div className="space-y-6">
          {/* Collaborators */}
          <CollaboratorList 
            collaborators={currentSession.participants}
            sessionId={sessionId}
            isOwner={isOwner}
          />

          {/* Session Info */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Settings className="text-primary" size={20} />
              Session Info
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-text-secondary">Status</span>
                <span className={`capitalize ${
                  currentSession.status === 'active' ? 'text-accent' :
                  currentSession.status === 'draft' ? 'text-warning' : 'text-primary'
                }`}>
                  {currentSession.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Created</span>
                <span className="text-text-primary">
                  {new Date(currentSession.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Last Updated</span>
                <span className="text-text-primary">
                  {new Date(currentSession.updatedAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Total Shares</span>
                <span className="text-text-primary">{currentSession.totalShares}%</span>
              </div>
            </div>
          </Card>

          {/* Ownership Status */}
          {currentSession.ownershipProposal && (
            <Card className="p-6">
              <h3 className="font-semibold mb-4 text-primary">Ownership Proposal</h3>
              <div className="space-y-3">
                <div className={`px-3 py-2 rounded-lg text-center ${
                  currentSession.ownershipProposal.status === 'approved' 
                    ? 'bg-accent/20 text-accent' 
                    : 'bg-warning/20 text-warning'
                }`}>
                  {currentSession.ownershipProposal.status === 'approved' ? 'Approved' : 'Pending Approval'}
                </div>
                
                {currentSession.ownershipProposal.splits.map((split) => (
                  <div key={split.userId} className="flex justify-between items-center">
                    <span className="text-text-secondary text-sm">{split.username}</span>
                    <span className="text-text-primary font-medium">{split.percentage}%</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Quick Actions */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-center"
                onClick={() => setShowInviteModal(true)}
              >
                Invite Collaborator
              </Button>
              {isOwner && (
                <Button
                  variant="outline"
                  className="w-full justify-center"
                  onClick={() => setShowOwnershipModal(true)}
                >
                  Manage Ownership
                </Button>
              )}
              <Button
                variant="primary"
                className="w-full justify-center"
                onClick={() => router.push(`/poem/publish/${sessionId}`)}
              >
                Publish Poem
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Modals */}
      {showOwnershipModal && (
        <OwnershipProposalModal
          session={currentSession}
          onClose={() => setShowOwnershipModal(false)}
        />
      )}

      {showInviteModal && (
        <InviteCollaboratorModal
          sessionId={sessionId}
          onClose={() => setShowInviteModal(false)}
        />
      )}
    </div>
  );
}