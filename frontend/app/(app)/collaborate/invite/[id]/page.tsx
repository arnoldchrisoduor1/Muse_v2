"use client";
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Users, Mail, Check, X, User, Clock, FileText } from 'lucide-react';
import { useCollaborationStore } from '@/lib/store/collaboration-store';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/app/hooks/useAuth';
import { CollaborationSession } from '@/lib/store/collaboration-store';

export default function InvitationPage() {
  const params = useParams();
  const router = useRouter();
  const invitationId = params.id as string;

  const { user } = useAuth();

  const {
    invitedSessions,
    loadInvitedSessions,
    approveCollaboration,
    getSession
  } = useCollaborationStore();

  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    loadSession();
  }, [invitationId]);

  useEffect(() =>{
    if (!session) return;
    console.log('session updated', session);
  },[session]);

  const loadSession = async () => {
  setIsLoading(true);
  try {
    console.log("Attempting to load invited sessions");

    // Load invited sessions (this updates the store)
    await loadInvitedSessions();

    // read latest invitedSessions from the zustand store directly to avoid stale closure
    const latestInvited = useCollaborationStore.getState().invitedSessions as CollaborationSession[] | undefined;

    // guard: ensure we have a user id to compare
    const currentUserId = user?.id;
    if (!currentUserId) {
      console.warn('No current user id available yet');
      setIsLoading(false);
      return;
    }

    // find an invitation where any participant has userId === currentUserId
    const invitation = latestInvited?.find((s) =>
      Array.isArray(s.participants) && s.participants.some((p) => p.userId === currentUserId)
    );

    console.log("Invitation: ", invitation);

    if (invitation) {
      setSession(invitation);
      console.log('session:: ', session);
    } else {
      console.log('Invitation for current user not found in invited sessions');
    }
  } catch (error) {
    console.error('Failed to load invitation:', error);
  } finally {
    setIsLoading(false);
  }
};

  const handleAccept = async () => {
    setIsProcessing(true);
    try {
      await approveCollaboration(invitationId);
      // Redirect to the collaboration session
      router.push(`/collaborate/session/${invitationId}`);
    } catch (error) {
      console.error('Failed to accept invitation:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDecline = async () => {
    // You'll need to implement decline functionality in your store
    setIsProcessing(true);
    try {
      // await declineCollaboration(invitationId);
      router.push('/collaborate');
    } catch (error) {
      console.error('Failed to decline invitation:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="h-32 bg-gray-700 rounded mb-4"></div>
          <div className="h-12 bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="p-8 text-center">
          <Mail size={64} className="text-text-muted mx-auto mb-6" />
          <h2 className="text-2xl font-bold mb-4">Invitation Not Found</h2>
          <p className="text-text-secondary mb-6">
            This invitation may have expired or been cancelled.
          </p>
          <Button
            variant="primary"
            icon={ArrowLeft}
            onClick={() => router.push('/collaborate')}
          >
            Back to Collaborations
          </Button>
        </Card>
      </div>
    );
  }

  const owner = session.participants.find((p: any) => p.userId === session.ownerId);
  const currentUserInvitation = session.participants.find((p: any) => 
    p.userId === user?.id
  );

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4 mb-8"
      >
        <Button
          variant="outline"
          icon={ArrowLeft}
          onClick={() => router.push('/collaborate')}
        >
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold gradient-text">Collaboration Invitation</h1>
          <p className="text-text-secondary">You've been invited to collaborate on a poem</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="space-y-6"
      >
        {/* Session Details */}
        <Card className="p-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center shrink-0">
              <FileText className="text-primary" size={24} />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">{session.title}</h2>
              <p className="text-text-secondary">{session.description}</p>
            </div>
          </div>

          {/* Content Preview */}
          {session.content && (
            <div className="mb-6 p-4 bg-white/5 rounded-lg border border-white/10">
              <h3 className="font-semibold mb-3 text-text-primary">Poem Preview</h3>
              <div className="text-text-secondary font-serif leading-relaxed max-h-32 overflow-y-auto">
                {session.content || 'No content yet...'}
              </div>
            </div>
          )}

          {/* Session Info */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <User size={16} className="text-text-muted" />
              <span className="text-text-secondary">Owner:</span>
              <span className="text-text-primary">{owner?.username || 'Unknown'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users size={16} className="text-text-muted" />
              <span className="text-text-secondary">Collaborators:</span>
              <span className="text-text-primary">
                {session.participants.filter((p: any) => p.approvalStatus === 'approved').length}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-text-muted" />
              <span className="text-text-secondary">Created:</span>
              <span className="text-text-primary">
                {new Date(session.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Mail size={16} className="text-text-muted" />
              <span className="text-text-secondary">Your Status:</span>
              <span className="text-warning capitalize">
                {currentUserInvitation?.approvalStatus || 'pending'}
              </span>
            </div>
          </div>
        </Card>

        {/* Current Collaborators */}
        {session.participants.filter((p: any) => p.approvalStatus === 'approved').length > 0 && (
          <Card className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Users className="text-primary" size={20} />
              Current Collaborators
            </h3>
            <div className="space-y-3">
              {session.participants
                .filter((p: any) => p.approvalStatus === 'approved')
                .map((participant: any) => (
                  <div key={participant.userId} className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                      <User size={16} className="text-primary" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">{participant.username}</div>
                      <div className="text-xs text-text-muted">
                        {participant.sharePercentage}% ownership
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </Card>
        )}

        {/* Action Buttons */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4 text-primary">Your Response</h3>
          <p className="text-text-secondary mb-6">
            Accept this invitation to join the collaboration and start writing poetry together. 
            You'll be able to contribute to the poem and participate in ownership discussions.
          </p>
          
          <div className="flex gap-4">
            <Button
              variant="outline"
              icon={X}
              onClick={handleDecline}
              disabled={isProcessing}
              className="flex-1"
            >
              Decline
            </Button>
            <Button
              variant="primary"
              icon={Check}
              loading={isProcessing}
              onClick={handleAccept}
              className="flex-1"
            >
              Accept Invitation
            </Button>
          </div>
        </Card>

        {/* What Happens Next */}
        <Card className="p-6 bg-primary/10 border-primary/20">
          <h3 className="font-semibold text-primary mb-3">What happens next?</h3>
          <div className="space-y-2 text-sm text-text-secondary">
            <p>• You'll be redirected to the collaboration session</p>
            <p>• You can start writing and editing the poem immediately</p>
            <p>• The owner may propose an ownership split for revenue sharing</p>
            <p>• All collaborators must approve ownership changes</p>
            <p>• The poem can be published as a collaborative work</p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}