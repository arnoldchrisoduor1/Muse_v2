import axios from 'axios';
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { useAuthStore } from './auth-store';

interface UserProfile {
  id: string;
  username: string;
  email: string;
  walletAddress: string;
  bio: string;
  avatarUrl: string;
  coverImageUrl: string;
  joinedAt: Date | string;
  reputation: number;
  anonymous: boolean;
  passwordHash?: string;

  // Stats
  totalPoems: number;
  totalCollaborations: number;
  totalEarnings: number;
  followersCount: number;
  followingCount: number;
  poemsRead: number;
  poemsLiked: number;

  // Badges & Status
  isCollectiveContributor: boolean;
  badges: UserBadge[];
  verificationStatus: 'verified' | 'unverified';

  // Preferences
  allowRemixes: boolean;
  defaultLicenseType: string;
  notificationPreferences: NotificationSettings;

  // Social Links
  website?: string;
  twitter?: string;
  instagram?: string;
}

interface UserBadge {
  id: string;
  type: 'collective_contributor' | 'top_curator' | 'early_adopter' | 'collaboration_master' | 'remix_artist' | 'trending_poet';
  earnedAt: Date | string;
  displayName: string;
  iconUrl: string;
  description: string;
}

interface NotificationSettings {
  emailOnComment: boolean;
  emailOnRemix: boolean;
  emailOnSale: boolean;
  emailOnCollabInvite: boolean;
  pushNotifications: boolean;
}

interface EarningsData {
  totalEarnings: number;
  thisMonth: number;
  lastMonth: number;
  bySource: {
    nftSales: number;
    microPayments: number;
    licensing: number;
    collectiveRoyalties: number;
    collaborations: number;
  };
  history: TimeSeriesData[];
}

interface TimeSeriesData {
  date: Date | string;
  value: number;
  source: string;
}

interface PoemAnalytics {
  poemId: string;
  views: number;
  likes: number;
  comments: number;
  bookmarks: number;
  shares: number;
  earnings: number;
  viewsOverTime: TimeSeriesData[];
  audienceDemographics: {
    countries: { country: string; percentage: number }[];
    devices: { device: string; percentage: number }[];
  };
}

interface UserState {
  // Profile being viewed (could be current user or another user)
  viewedProfile: UserProfile | null;

  // User content
  userPoems: any[];
  userCollections: any[];
  userCollaborations: any[];

  // Studio data
  earnings: EarningsData | null;
  poemAnalytics: Record<string, PoemAnalytics>;

  // UI state
  isUpdatingProfile: boolean;
  isLoading: boolean;

  isFollowing: Boolean;

  // Actions
  loadUserProfile: (userIdOrUsername: string) => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  loadUserPoems: (userId: string) => Promise<void>;
  loadUserCollections: (userId: string) => Promise<void>;
  loadEarningsData: (userId: string) => Promise<void>;
  loadPoemAnalytics: (poemId: string) => Promise<void>;
  followUser: (followerId: string, targetId: string) => Promise<void>;
  unfollowUser: (followerId: string, targetId: string) => Promise<void>;
  checkIfIfollowThisUser : (followerId: string, followingId: string) => Promise<void>;
}

const USER_API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

const api = axios.create({
    baseURL: `${USER_API_URL}/api/v1`, 
    withCredentials: true,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    }
});

// Add auth token to requests automatically
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const useUserStore = create<UserState>()(
  devtools((set, get) => ({
    // Initial State - REMOVED duplicate auth state
    viewedProfile: null,
    userPoems: [],
    userCollections: [],
    userCollaborations: [],
    earnings: null,
    poemAnalytics: {},
    isUpdatingProfile: false,
    isLoading: false,
    isFollowing: false,

    // Load user profile
    loadUserProfile: async (username: string) => {
      set({ isLoading: true });
      try {
        const res = await api.get(`/users/username/${encodeURIComponent(username)}`);
        const profile: UserProfile = res?.data;
        
        set({
          viewedProfile: profile,
          isLoading: false,
        });
      } catch (error) {
        console.error('loadUserProfile error', error);
        set({ isLoading: false });
      }
    },

    // Update profile
    updateProfile: async (updates: Partial<UserProfile>) => {
      set({ isUpdatingProfile: true });

      console.log("Attempting to update user with: ", updates);

      try {
        // Get current user from auth store
        const currentUser = useAuthStore.getState().user;
        if (!currentUser) {
          throw new Error('No current user to update');
        }

        const res = await api.patch(`/users/${encodeURIComponent(currentUser.id)}`, updates);
        const updatedUser: UserProfile = res.data;

        console.log("Profile Updated sucessfully: ", updatedUser);

        const { viewedProfile } = get();
        set({
          viewedProfile: viewedProfile?.id === currentUser.id ? updatedUser : viewedProfile,
          isUpdatingProfile: false,
        });

        // Update auth store if we updated the current user
        if (currentUser.id === updatedUser.id) {
          useAuthStore.setState({
            user: {
              ...currentUser,
              username: updatedUser.username,
              email: updatedUser.email,
              avatarUrl: updatedUser.avatarUrl,
              walletAddress: updatedUser.walletAddress,
            }
          });
        }
      } catch (err) {
        console.error('updateProfile error', err);
        set({ isUpdatingProfile: false });
      }
    },

    // Load user poems
    loadUserPoems: async (userId: string) => {
      set({ isLoading: true });
      try {
        const res = await api.get(`/users/${encodeURIComponent(userId)}/poems`);
        set({ userPoems: res.data || [], isLoading: false });
      } catch (err) {
        console.warn('loadUserPoems failed, returning empty list', err);
        set({ userPoems: [], isLoading: false });
      }
    },

    // Load user collections
    loadUserCollections: async (userId: string) => {
      set({ isLoading: true });
      try {
        const res = await api.get(`/users/${encodeURIComponent(userId)}/collections`);
        set({ userCollections: res.data || [], isLoading: false });
      } catch (err) {
        console.warn('loadUserCollections failed, returning empty list', err);
        set({ userCollections: [], isLoading: false });
      }
    },

    // Load earnings data
    loadEarningsData: async (userId: string) => {
      set({ isLoading: true });
      try {
        const res = await api.get(`/users/${encodeURIComponent(userId)}/earnings`);
        set({ earnings: res.data || null, isLoading: false });
      } catch (err) {
        console.warn('loadEarningsData failed', err);
        set({ earnings: null, isLoading: false });
      }
    },

    // Load poem analytics
    loadPoemAnalytics: async (poemId: string) => {
      try {
        const res = await api.get(`/poems/${encodeURIComponent(poemId)}/analytics`);
        const analytics: PoemAnalytics = res.data;
        set((state) => ({
          poemAnalytics: {
            ...state.poemAnalytics,
            [poemId]: analytics,
          },
        }));
      } catch (err) {
        console.warn('loadPoemAnalytics failed', err);
      }
    },

    // Follow user
    followUser: async (followerId: string, targetId: string) => {
      try {
        await api.post(`/users/${encodeURIComponent(followerId)}/follow/${encodeURIComponent(targetId)}`);
        const { viewedProfile } = get();
        if (viewedProfile && viewedProfile.id === targetId) {
          set({
            viewedProfile: {
              ...viewedProfile,
              followersCount: (viewedProfile.followersCount || 0) + 1,
            },
          });
        }
      } catch (err) {
        console.error('followUser error', err);
      }
    },

    // Unfollow user
    unfollowUser: async (followerId: string, targetId: string) => {
      try {
        await api.delete(`/users/${encodeURIComponent(followerId)}/follow/${encodeURIComponent(targetId)}`);
        const { viewedProfile } = get();
        if (viewedProfile && viewedProfile.id === targetId) {
          set({
            viewedProfile: {
              ...viewedProfile,
              followersCount: Math.max(0, (viewedProfile.followersCount || 0) - 1),
            },
          });
        }
      } catch (err) {
        console.error('unfollowUser error', err);
      }
    },

    checkIfIfollowThisUser: async(followerId: string, followingId: string) => {
      try {
        const res = await api.get(`/users/${encodeURIComponent(followerId)}/is-following/${encodeURIComponent(followingId)}`);
        console.log("Is following check: ", res);
        set({
          isFollowing: true,
        })
      } catch (error) {
        console.log("Could not check follow user status");
      }
    }
  }), {
    name: 'user-store',
  })
);