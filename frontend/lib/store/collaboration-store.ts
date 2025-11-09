import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface Collaborator {
  userId: string;
  username: string;
  avatarUrl: string;
  sharePercentage: number;
  contributionType: 'original' | 'remix' | 'collaboration' | 'inspiration';
  contributionHash: string;
  contributedAt: Date;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  isOnline: boolean;
  cursorPosition: number | null;
  charactersAdded: number;
  linesAdded: number;
  editsCount: number;
}

interface CollaborationSession {
  id: string;
  title: string;
  description: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  status: 'draft' | 'active' | 'paused' | 'completed';
  participants: Collaborator[];
  ownerId: string;
  
  // Real-time features
  versionHistory: PoemVersion[];
  currentVersion: string;
  
  // Ownership
  ownershipProposal: OwnershipProposal | null;
  totalShares: number;
  
  // Publishing
  publishedAt: Date | null;
  nftTokenId: string | null;
}

interface PoemVersion {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: Date;
  changeDescription: string;
  diffFromPrevious: string;
}

interface OwnershipProposal {
  id: string;
  proposedBy: string;
  proposedByName: string;
  splits: {
    userId: string;
    username: string;
    percentage: number;
  }[];
  approvals: {
    userId: string;
    approved: boolean;
    respondedAt: Date;
  }[];
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  expiresAt: Date;
}

interface CollaborationState {
  // Current session
  currentSession: CollaborationSession | null;
  activeSessions: CollaborationSession[];
  invitedSessions: CollaborationSession[];
  
  // Real-time state
  isConnected: boolean;
  onlineUsers: string[];
  typingUsers: string[];
  
  // UI state
  isCreatingSession: boolean;
  isSaving: boolean;
  isPublishing: boolean;
  
  // Actions
  createSession: (title: string, description: string) => Promise<CollaborationSession>;
  joinSession: (sessionId: string) => Promise<void>;
  leaveSession: (sessionId: string) => void;
  updateContent: (sessionId: string, content: string, userId: string) => void;
  inviteCollaborator: (sessionId: string, userId: string, share: number) => void;
  proposeOwnership: (sessionId: string, splits: { userId: string; percentage: number }[]) => void;
  approveOwnership: (sessionId: string, proposalId: string, userId: string) => void;
  publishCollaborativePoem: (sessionId: string) => Promise<void>;
  loadActiveSessions: () => Promise<void>;
  loadInvitedSessions: () => Promise<void>;
}

// Mock user data for demonstration
const mockUsers = {
  'user1': { username: 'sarah_poet', avatarUrl: '/avatars/sarah.jpg' },
  'user2': { username: 'alex_verse', avatarUrl: '/avatars/alex.jpg' },
  'user3': { username: 'maya_words', avatarUrl: '/avatars/maya.jpg' },
  'user4': { username: 'jordan_rhymes', avatarUrl: '/avatars/jordan.jpg' },
};

export const useCollaborationStore = create<CollaborationState>()(
  devtools((set, get) => ({
    // Initial State
    currentSession: null,
    activeSessions: [],
    invitedSessions: [],
    isConnected: false,
    onlineUsers: [],
    typingUsers: [],
    isCreatingSession: false,
    isSaving: false,
    isPublishing: false,

    // Create new collaboration session
    createSession: async (title: string, description: string): Promise<CollaborationSession> => {
      set({ isCreatingSession: true });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const newSession: CollaborationSession = {
        id: `collab_${Date.now()}`,
        title,
        description,
        content: '',
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'active',
        participants: [
          {
            userId: 'user1', // Current user
            username: 'sarah_poet',
            avatarUrl: '/avatars/sarah.jpg',
            sharePercentage: 100,
            contributionType: 'original',
            contributionHash: `hash_${Date.now()}`,
            contributedAt: new Date(),
            approvalStatus: 'approved',
            isOnline: true,
            cursorPosition: null,
            charactersAdded: 0,
            linesAdded: 0,
            editsCount: 0,
          }
        ],
        ownerId: 'user1',
        versionHistory: [],
        currentVersion: '1.0',
        ownershipProposal: null,
        totalShares: 100,
        publishedAt: null,
        nftTokenId: null,
      };

      set((state) => ({
        activeSessions: [newSession, ...state.activeSessions],
        currentSession: newSession,
        isCreatingSession: false,
      }));

      return newSession;
    },

    // Join a session
    joinSession: async (sessionId: string) => {
      const { activeSessions, invitedSessions } = get();
      
      // Find session in active or invited
      const session = [...activeSessions, ...invitedSessions].find(s => s.id === sessionId);
      if (!session) return;

      // Add current user as participant (simulated)
      const newParticipant: Collaborator = {
        userId: 'user2', // Simulated joining user
        username: 'alex_verse',
        avatarUrl: '/avatars/alex.jpg',
        sharePercentage: 0, // Will be negotiated
        contributionType: 'collaboration',
        contributionHash: `hash_${Date.now()}`,
        contributedAt: new Date(),
        approvalStatus: 'pending',
        isOnline: true,
        cursorPosition: null,
        charactersAdded: 0,
        linesAdded: 0,
        editsCount: 0,
      };

      const updatedSession = {
        ...session,
        participants: [...session.participants, newParticipant],
        updatedAt: new Date(),
      };

      set({
        currentSession: updatedSession,
        activeSessions: activeSessions.map(s => s.id === sessionId ? updatedSession : s),
      });
    },

    // Leave session
    leaveSession: (sessionId: string) => {
      const { currentSession, activeSessions } = get();
      
      if (currentSession?.id === sessionId) {
        set({ currentSession: null });
      }

      // Remove from active sessions if user was the owner
      set({
        activeSessions: activeSessions.filter(s => s.id !== sessionId),
      });
    },

    // Update content in real-time
    updateContent: (sessionId: string, content: string, userId: string) => {
      const { currentSession, activeSessions } = get();
      
      const updatedSession = {
        ...currentSession!,
        content,
        updatedAt: new Date(),
        participants: currentSession!.participants.map(p =>
          p.userId === userId
            ? {
                ...p,
                charactersAdded: p.charactersAdded + (content.length - (currentSession?.content.length || 0)),
                editsCount: p.editsCount + 1,
              }
            : p
        ),
      };

      // Add to version history if significant change
      if (content.length - (currentSession?.content.length || 0) > 50) {
        const newVersion: PoemVersion = {
          id: `version_${Date.now()}`,
          content,
          authorId: userId,
          authorName: mockUsers[userId as keyof typeof mockUsers]?.username || 'Unknown',
          createdAt: new Date(),
          changeDescription: 'Content update',
          diffFromPrevious: '',
        };

        updatedSession.versionHistory = [newVersion, ...updatedSession.versionHistory.slice(0, 9)];
      }

      set({
        currentSession: updatedSession,
        activeSessions: activeSessions.map(s => s.id === sessionId ? updatedSession : s),
      });
    },

    // Invite collaborator
    inviteCollaborator: (sessionId: string, userId: string, share: number) => {
      const { currentSession, activeSessions } = get();
      
      const newCollaborator: Collaborator = {
        userId,
        username: mockUsers[userId as keyof typeof mockUsers]?.username || 'Unknown',
        avatarUrl: mockUsers[userId as keyof typeof mockUsers]?.avatarUrl || '',
        sharePercentage: share,
        contributionType: 'collaboration',
        contributionHash: `invite_${Date.now()}`,
        contributedAt: new Date(),
        approvalStatus: 'pending',
        isOnline: false,
        cursorPosition: null,
        charactersAdded: 0,
        linesAdded: 0,
        editsCount: 0,
      };

      const updatedSession = {
        ...currentSession!,
        participants: [...currentSession!.participants, newCollaborator],
        updatedAt: new Date(),
      };

      set({
        currentSession: updatedSession,
        activeSessions: activeSessions.map(s => s.id === sessionId ? updatedSession : s),
      });
    },

    // Propose ownership split
    proposeOwnership: (sessionId: string, splits: { userId: string; percentage: number }[]) => {
      const { currentSession, activeSessions } = get();
      
      const totalPercentage = splits.reduce((sum, split) => sum + split.percentage, 0);
      if (totalPercentage !== 100) return;

      const ownershipProposal: OwnershipProposal = {
        id: `proposal_${Date.now()}`,
        proposedBy: 'user1', // Current user
        proposedByName: 'sarah_poet',
        splits: splits.map(split => ({
          ...split,
          username: mockUsers[split.userId as keyof typeof mockUsers]?.username || 'Unknown',
        })),
        approvals: splits.map(split => ({
          userId: split.userId,
          approved: split.userId === 'user1', // Auto-approve for proposer
          respondedAt: split.userId === 'user1' ? new Date() : new Date(0),
        })),
        status: 'pending',
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      };

      const updatedSession = {
        ...currentSession!,
        ownershipProposal,
        updatedAt: new Date(),
      };

      set({
        currentSession: updatedSession,
        activeSessions: activeSessions.map(s => s.id === sessionId ? updatedSession : s),
      });
    },

    // Approve ownership proposal
    approveOwnership: (sessionId: string, proposalId: string, userId: string) => {
      const { currentSession, activeSessions } = get();
      
      if (!currentSession?.ownershipProposal || currentSession.ownershipProposal.id !== proposalId) {
        return;
      }

      const updatedProposal = {
        ...currentSession.ownershipProposal,
        approvals: currentSession.ownershipProposal.approvals.map(approval =>
          approval.userId === userId
            ? { ...approval, approved: true, respondedAt: new Date() }
            : approval
        ),
      };

      // Check if all have approved
      const allApproved = updatedProposal.approvals.every(a => a.approved);
      if (allApproved) {
        updatedProposal.status = 'approved';
        
        // Update participant shares
        const updatedParticipants = currentSession.participants.map(participant => {
          const proposedSplit = updatedProposal.splits.find(s => s.userId === participant.userId);
          return proposedSplit
            ? { ...participant, sharePercentage: proposedSplit.percentage }
            : participant;
        });

        const updatedSession = {
          ...currentSession,
          ownershipProposal: updatedProposal,
          participants: updatedParticipants,
          updatedAt: new Date(),
        };

        set({
          currentSession: updatedSession,
          activeSessions: activeSessions.map(s => s.id === sessionId ? updatedSession : s),
        });
      } else {
        const updatedSession = {
          ...currentSession,
          ownershipProposal: updatedProposal,
          updatedAt: new Date(),
        };

        set({
          currentSession: updatedSession,
          activeSessions: activeSessions.map(s => s.id === sessionId ? updatedSession : s),
        });
      }
    },

    // Publish collaborative poem
    publishCollaborativePoem: async (sessionId: string) => {
      set({ isPublishing: true });

      const { currentSession, activeSessions } = get();
      if (!currentSession || currentSession.ownershipProposal?.status !== 'approved') {
        set({ isPublishing: false });
        return;
      }

      // Simulate blockchain publishing
      await new Promise(resolve => setTimeout(resolve, 3000));

      const updatedSession = {
        ...currentSession,
        status: 'completed',
        publishedAt: new Date(),
        nftTokenId: `collab_nft_${Math.random().toString(36).substr(2, 12)}`,
      };

      set({
        currentSession: updatedSession,
        activeSessions: activeSessions.map(s => s.id === sessionId ? updatedSession : s),
        isPublishing: false,
      });
    },

    // Load active sessions
    loadActiveSessions: async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      const mockSessions: CollaborationSession[] = [
        {
          id: 'collab_1',
          title: 'Neon Dreams Part 1',
          description: 'Cyberpunk poetry collaboration',
          content: `In circuits deep where neon bleeds,
We plant our digital seeds,
A symphony of light and code,
On this electric road we've strode.`,
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
          status: 'active',
          participants: [
            {
              userId: 'user1',
              username: 'sarah_poet',
              avatarUrl: '/avatars/sarah.jpg',
              sharePercentage: 40,
              contributionType: 'original',
              contributionHash: 'hash1',
              contributedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
              approvalStatus: 'approved',
              isOnline: true,
              cursorPosition: 45,
              charactersAdded: 240,
              linesAdded: 8,
              editsCount: 12,
            },
            {
              userId: 'user2',
              username: 'alex_verse',
              avatarUrl: '/avatars/alex.jpg',
              sharePercentage: 35,
              contributionType: 'collaboration',
              contributionHash: 'hash2',
              contributedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
              approvalStatus: 'approved',
              isOnline: true,
              cursorPosition: 120,
              charactersAdded: 180,
              linesAdded: 6,
              editsCount: 8,
            }
          ],
          ownerId: 'user1',
          versionHistory: [],
          currentVersion: '1.2',
          ownershipProposal: {
            id: 'prop_1',
            proposedBy: 'user1',
            proposedByName: 'sarah_poet',
            splits: [
              { userId: 'user1', username: 'sarah_poet', percentage: 40 },
              { userId: 'user2', username: 'alex_verse', percentage: 35 },
              { userId: 'user3', username: 'maya_words', percentage: 25 },
            ],
            approvals: [
              { userId: 'user1', approved: true, respondedAt: new Date(Date.now() - 3 * 60 * 60 * 1000) },
              { userId: 'user2', approved: true, respondedAt: new Date(Date.now() - 2 * 60 * 60 * 1000) },
              { userId: 'user3', approved: false, respondedAt: new Date(0) },
            ],
            status: 'pending',
            createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
            expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          },
          totalShares: 100,
          publishedAt: null,
          nftTokenId: null,
        }
      ];

      set({ activeSessions: mockSessions });
    },

    // Load invited sessions
    loadInvitedSessions: async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockInvited: CollaborationSession[] = [
        {
          id: 'collab_2',
          title: 'Urban Echoes Collective',
          description: 'City life poetry project',
          content: `The city breathes in concrete sighs,
A thousand stories in our eyes,
We walk these streets with hurried pace,
Seeking our own sacred space.`,
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
          status: 'active',
          participants: [
            {
              userId: 'user3',
              username: 'maya_words',
              avatarUrl: '/avatars/maya.jpg',
              sharePercentage: 60,
              contributionType: 'original',
              contributionHash: 'hash3',
              contributedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
              approvalStatus: 'approved',
              isOnline: false,
              cursorPosition: null,
              charactersAdded: 320,
              linesAdded: 10,
              editsCount: 15,
            },
            {
              userId: 'user2', // Current user invited
              username: 'alex_verse',
              avatarUrl: '/avatars/alex.jpg',
              sharePercentage: 0, // Not negotiated yet
              contributionType: 'collaboration',
              contributionHash: 'invite_hash',
              contributedAt: new Date(),
              approvalStatus: 'pending',
              isOnline: true,
              cursorPosition: null,
              charactersAdded: 0,
              linesAdded: 0,
              editsCount: 0,
            }
          ],
          ownerId: 'user3',
          versionHistory: [],
          currentVersion: '1.0',
          ownershipProposal: null,
          totalShares: 100,
          publishedAt: null,
          nftTokenId: null,
        }
      ];

      set({ invitedSessions: mockInvited });
    },
  }), {
    name: 'collaboration-store',
  })
);