// collaboration-store.ts
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import axios from "axios";
import { useAuthStore } from "./auth-store";

// --- API SETUP ---
const COLLABORATION_API_URL = 
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

const collaborationApiClient = axios.create({
  baseURL: `${COLLABORATION_API_URL}/api/v1/collaboration`,
  withCredentials: true,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Auth setup
const getAccessToken = () => {
  return useAuthStore.getState().accessToken ?? null;
};

const setAuthHeader = (token: string | null) => {
  if (token) {
    collaborationApiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete collaborationApiClient.defaults.headers.common["Authorization"];
  }
};

// --- INTERFACES ---
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

// DTO Interfaces matching backend
interface CreateSessionDto {
  title: string;
  description: string;
  content?: string;
}

interface UpdateSessionDto {
  title?: string;
  description?: string;
  status?: string;
}

interface UpdateContentDto {
  content: string;
  changeDescription?: string;
}

interface InviteCollaboratorDto {
  inviteeIdentifier: string; // email or username
}

interface OwnershipProposalDto {
  splits: {
    userId: string;
    percentage: number;
  }[];
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
  isLoading: boolean;
  error: string | null;
  
  // Actions
  createSession: (title: string, description: string) => Promise<CollaborationSession>;
  joinSession: (sessionId: string) => Promise<void>;
  leaveSession: (sessionId: string) => Promise<void>;
  updateContent: (sessionId: string, content: string, userId: string, changeDescription?: string) => Promise<void>;
  inviteCollaborator: (sessionId: string, inviteeIdentifier: string) => Promise<void>;
  approveCollaboration: (sessionId: string) => Promise<void>;
  proposeOwnership: (sessionId: string, splits: { userId: string; percentage: number }[]) => Promise<void>;
  approveOwnership: (sessionId: string, proposalId: string) => Promise<void>;
  publishCollaborativePoem: (sessionId: string) => Promise<void>;
  loadActiveSessions: () => Promise<void>;
  loadInvitedSessions: () => Promise<void>;
  getSession: (sessionId: string) => Promise<void>;
  clearError: () => void;
}

// Helper function to map API response to CollaborationSession
const mapApiSessionToSession = (apiSession: any): CollaborationSession => {
  console.log('Mapping API session to frontend session:', apiSession);
  
  return {
    id: apiSession.id,
    title: apiSession.title,
    description: apiSession.description,
    content: apiSession.content || '',
    createdAt: new Date(apiSession.createdAt),
    updatedAt: new Date(apiSession.updatedAt),
    status: apiSession.status || 'active',
    participants: apiSession.participants?.map((p: any) => ({
      userId: p.userId,
      username: p.user?.username || 'Unknown',
      avatarUrl: p.user?.avatarUrl || '',
      sharePercentage: p.sharePercentage || 0,
      contributionType: p.contributionType || 'collaboration',
      contributionHash: p.contributionHash || '',
      contributedAt: new Date(p.contributedAt || apiSession.createdAt),
      approvalStatus: p.approvalStatus || 'pending',
      isOnline: false, // This would come from real-time service
      cursorPosition: null,
      charactersAdded: 0,
      linesAdded: 0,
      editsCount: 0,
    })) || [],
    ownerId: apiSession.authorId || apiSession.ownerId,
    versionHistory: apiSession.versionHistory || [],
    currentVersion: apiSession.currentVersion || '1.0',
    ownershipProposal: apiSession.ownershipProposal || null,
    totalShares: apiSession.totalShares || 100,
    publishedAt: apiSession.publishedAt ? new Date(apiSession.publishedAt) : null,
    nftTokenId: apiSession.nftTokenId || null,
  };
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
    isLoading: false,
    error: null,

    // Clear error
    clearError: () => set({ error: null }),

    // Create new collaboration session
    createSession: async (title: string, description: string): Promise<CollaborationSession> => {
      console.log('Creating new collaboration session:', { title, description });
      set({ isCreatingSession: true, error: null });

      const accessToken = getAccessToken();
      setAuthHeader(accessToken);

      try {
        const createSessionDto: CreateSessionDto = {
          title,
          description,
          content: '',
        };

        const response = await collaborationApiClient.post('/sessions', createSessionDto);
        console.log('Session created successfully:', response.data);

        const newSession = mapApiSessionToSession(response.data);

        set((state) => ({
          activeSessions: [newSession, ...state.activeSessions],
          currentSession: newSession,
          isCreatingSession: false,
        }));

        return newSession;
      } catch (error: any) {
        console.error('Failed to create session:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Failed to create session';
        set({ 
          isCreatingSession: false, 
          error: errorMessage 
        });
        throw new Error(errorMessage);
      }
    },

    // Join a session
    joinSession: async (sessionId: string) => {
      console.log('Joining session:', sessionId);
      set({ error: null });

      const accessToken = getAccessToken();
      setAuthHeader(accessToken);

      try {
        const response = await collaborationApiClient.post(`/sessions/${sessionId}/approve`);
        console.log('Joined session successfully:', response.data);

        // Reload the session to get updated data
        await get().getSession(sessionId);
      } catch (error: any) {
        console.error('Failed to join session:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Failed to join session';
        set({ error: errorMessage });
        throw new Error(errorMessage);
      }
    },

    // Leave session
    leaveSession: async (sessionId: string) => {
      console.log('Leaving session:', sessionId);
      set({ error: null });

      const accessToken = getAccessToken();
      setAuthHeader(accessToken);

      try {
        await collaborationApiClient.delete(`/sessions/${sessionId}`);
        console.log('Left session successfully');

        set((state) => ({
          currentSession: state.currentSession?.id === sessionId ? null : state.currentSession,
          activeSessions: state.activeSessions.filter(s => s.id !== sessionId),
          invitedSessions: state.invitedSessions.filter(s => s.id !== sessionId),
        }));
      } catch (error: any) {
        console.error('Failed to leave session:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Failed to leave session';
        set({ error: errorMessage });
        throw new Error(errorMessage);
      }
    },

    // Update content in real-time
    updateContent: async (sessionId: string, content: string, userId: string, changeDescription: string = 'Content update') => {
      console.log('Updating content for session:', sessionId, 'content length:', content.length);
      set({ isSaving: true, error: null });

      const accessToken = getAccessToken();
      setAuthHeader(accessToken);

      try {
        const updateContentDto: UpdateContentDto = {
          content,
          changeDescription,
        };

        const response = await collaborationApiClient.put(`/sessions/${sessionId}/content`, updateContentDto);
        console.log('Content updated successfully:', response.data);

        const updatedSession = mapApiSessionToSession(response.data);

        set((state) => ({
          currentSession: state.currentSession?.id === sessionId ? updatedSession : state.currentSession,
          activeSessions: state.activeSessions.map(s => s.id === sessionId ? updatedSession : s),
          isSaving: false,
        }));
      } catch (error: any) {
        console.error('Failed to update content:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Failed to update content';
        set({ 
          isSaving: false, 
          error: errorMessage 
        });
        throw new Error(errorMessage);
      }
    },

    // Invite collaborator
    inviteCollaborator: async (sessionId: string, inviteeIdentifier: string) => {
      console.log('Inviting collaborator to session:', sessionId, 'invitee:', inviteeIdentifier);
      set({ error: null });

      const accessToken = getAccessToken();
      setAuthHeader(accessToken);

      try {
        const inviteDto: InviteCollaboratorDto = {
          inviteeIdentifier,
        };

        const response = await collaborationApiClient.post(`/sessions/${sessionId}/invite`, inviteDto);
        console.log('Collaborator invited successfully:', response.data);

        // Reload session to get updated participant list
        await get().getSession(sessionId);
      } catch (error: any) {
        console.error('Failed to invite collaborator:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Failed to invite collaborator';
        set({ error: errorMessage });
        throw new Error(errorMessage);
      }
    },

    // Approve collaboration (for invited users)
    approveCollaboration: async (sessionId: string) => {
      console.log('Approving collaboration for session:', sessionId);
      set({ error: null });

      const accessToken = getAccessToken();
      setAuthHeader(accessToken);

      try {
        const response = await collaborationApiClient.post(`/sessions/${sessionId}/approve`);
        console.log('Collaboration approved successfully:', response.data);

        // Reload session to get updated data
        await get().getSession(sessionId);
      } catch (error: any) {
        console.error('Failed to approve collaboration:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Failed to approve collaboration';
        set({ error: errorMessage });
        throw new Error(errorMessage);
      }
    },

    // Propose ownership split
    proposeOwnership: async (sessionId: string, splits: { userId: string; percentage: number }[]) => {
      console.log('Proposing ownership for session:', sessionId, 'splits:', splits);
      set({ error: null });

      const accessToken = getAccessToken();
      setAuthHeader(accessToken);

      try {
        const proposalDto: OwnershipProposalDto = { splits };

        const response = await collaborationApiClient.post(`/sessions/${sessionId}/ownership`, proposalDto);
        console.log('Ownership proposed successfully:', response.data);

        const updatedSession = mapApiSessionToSession(response.data);

        set((state) => ({
          currentSession: state.currentSession?.id === sessionId ? updatedSession : state.currentSession,
          activeSessions: state.activeSessions.map(s => s.id === sessionId ? updatedSession : s),
        }));
      } catch (error: any) {
        console.error('Failed to propose ownership:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Failed to propose ownership';
        set({ error: errorMessage });
        throw new Error(errorMessage);
      }
    },

    // Approve ownership proposal
    approveOwnership: async (sessionId: string, proposalId: string) => {
      console.log('Approving ownership proposal:', proposalId, 'for session:', sessionId);
      set({ error: null });

      // Note: This endpoint might need to be implemented in your backend
      // For now, we'll simulate the approval
      try {
        console.log('Ownership approval would be processed here');
        // Implementation depends on your backend API
        
        // Reload session to get updated data
        await get().getSession(sessionId);
      } catch (error: any) {
        console.error('Failed to approve ownership:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Failed to approve ownership';
        set({ error: errorMessage });
        throw new Error(errorMessage);
      }
    },

    // Publish collaborative poem
    publishCollaborativePoem: async (sessionId: string) => {
      console.log('Publishing collaborative poem for session:', sessionId);
      set({ isPublishing: true, error: null });

      // Note: This endpoint might need to be implemented in your backend
      // For now, we'll simulate the publishing
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        console.log('Collaborative poem published successfully');

        set((state) => ({
          currentSession: state.currentSession ? {
            ...state.currentSession,
            status: 'completed',
            publishedAt: new Date(),
            nftTokenId: `collab_nft_${Math.random().toString(36).substr(2, 12)}`,
          } : null,
          activeSessions: state.activeSessions.map(s => 
            s.id === sessionId ? {
              ...s,
              status: 'completed',
              publishedAt: new Date(),
              nftTokenId: `collab_nft_${Math.random().toString(36).substr(2, 12)}`,
            } : s
          ),
          isPublishing: false,
        }));
      } catch (error: any) {
        console.error('Failed to publish collaborative poem:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Failed to publish collaborative poem';
        set({ 
          isPublishing: false, 
          error: errorMessage 
        });
        throw new Error(errorMessage);
      }
    },

    // Load active sessions
    loadActiveSessions: async () => {
      console.log('Loading active sessions');
      set({ isLoading: true, error: null });

      const accessToken = getAccessToken();
      setAuthHeader(accessToken);

      try {
        const response = await collaborationApiClient.get('/sessions');
        console.log('Active sessions loaded successfully:', response.data);

        const sessions = Array.isArray(response.data) 
          ? response.data.map(mapApiSessionToSession)
          : [];

        set({ 
          activeSessions: sessions,
          isLoading: false,
        });
      } catch (error: any) {
        console.error('Failed to load active sessions:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Failed to load active sessions';
        set({ 
          isLoading: false, 
          error: errorMessage 
        });
        throw new Error(errorMessage);
      }
    },

    // Load invited sessions
    loadInvitedSessions: async () => {
      console.log('Loading invited sessions');
      set({ isLoading: true, error: null });

      const accessToken = getAccessToken();
      setAuthHeader(accessToken);

      try {
        const response = await collaborationApiClient.get('/sessions/invited');
        console.log('Invited sessions loaded successfully:', response.data);

        const sessions = Array.isArray(response.data) 
          ? response.data.map(mapApiSessionToSession)
          : [];

        set({ 
          invitedSessions: sessions,
          isLoading: false,
        });
      } catch (error: any) {
        console.error('Failed to load invited sessions:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Failed to load invited sessions';
        set({ 
          isLoading: false, 
          error: errorMessage 
        });
        throw new Error(errorMessage);
      }
    },

    // Get specific session
    getSession: async (sessionId: string) => {
      console.log('Loading session:', sessionId);
      set({ isLoading: true, error: null });

      const accessToken = getAccessToken();
      setAuthHeader(accessToken);

      try {
        const response = await collaborationApiClient.get(`/sessions/${sessionId}`);
        console.log('Session loaded successfully:', response.data);

        const session = mapApiSessionToSession(response.data);

        set((state) => ({
          currentSession: session,
          activeSessions: state.activeSessions.map(s => s.id === sessionId ? session : s),
          invitedSessions: state.invitedSessions.map(s => s.id === sessionId ? session : s),
          isLoading: false,
        }));
      } catch (error: any) {
        console.error('Failed to load session:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Failed to load session';
        set({ 
          isLoading: false, 
          error: errorMessage 
        });
        throw new Error(errorMessage);
      }
    },
  }), {
    name: 'collaboration-store',
  })
);