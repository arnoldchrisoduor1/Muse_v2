import axios from 'axios';
import { create } from "zustand";
import { devtools } from "zustand/middleware";

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
  // Current user
  currentUser: UserProfile | null;
  isAuthenticated: boolean;

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

  // Actions
  loadUserProfile: (userIdOrUsername: string) => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  loadUserPoems: (userId: string) => Promise<void>;
  loadUserCollections: (userId: string) => Promise<void>;
  loadEarningsData: (userId: string) => Promise<void>;
  loadPoemAnalytics: (poemId: string) => Promise<void>;
  followUser: (followerId: string, targetId: string) => Promise<void>;
  unfollowUser: (followerId: string, targetId: string) => Promise<void>;
}

// Configure axios instance
// const api = axios.create({
//   baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
//   // You can add default headers here (e.g., Authorization) if needed
//   // headers: { Authorization: `Bearer ${token}` }
// });

const USER_API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'

const api = axios.create({
    baseURL: `${USER_API_URL}/api/v1/users`, 
    withCredentials: true,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    }
});

export const useUserStore = create<UserState>()(
  devtools((set, get) => ({
    // Initial State
    currentUser: null,
    isAuthenticated: true, // keep mocked auth flag, replace with real auth later
    viewedProfile: null,
    userPoems: [],
    userCollections: [],
    userCollaborations: [],
    earnings: null,
    poemAnalytics: {},
    isUpdatingProfile: false,
    isLoading: false,

    // Load user profile (tries by id first, then by username)
    loadUserProfile: async (userIdOrUsername: string) => {
      set({ isLoading: true });
      try {
        // try by id
        let res = null;
        try {
          res = await api.get(`/users/${encodeURIComponent(userIdOrUsername)}`);
        } catch (err: any) {
          // if 404 try username route
          if (err?.response?.status === 404) {
            res = await api.get(`/users/username/${encodeURIComponent(userIdOrUsername)}`);
          } else {
            throw err;
          }
        }

        const profile: UserProfile = res.data;
        // Optionally convert date strings to Date objects:
        // profile.joinedAt = new Date(profile.joinedAt as string);

        // If this is the "current" user (your app might use a different check)
        const current = get().currentUser;
        set({
          currentUser: current?.id === profile.id ? profile : current,
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

      try {
        const { currentUser, viewedProfile } = get();
        if (!currentUser) {
          throw new Error('No current user to update');
        }

        const res = await api.patch(`/users/${encodeURIComponent(currentUser.id)}`, updates);
        const updatedUser: UserProfile = res.data;

        set({
          currentUser: updatedUser,
          viewedProfile: viewedProfile?.id === currentUser.id ? updatedUser : viewedProfile,
          isUpdatingProfile: false,
        });
      } catch (err) {
        console.error('updateProfile error', err);
        // optimistic rollback or show error in UI as needed
        set({ isUpdatingProfile: false });
      }
    },

    // Load user poems - endpoint guessed as /users/:id/poems
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

    // Load user collections - endpoint guessed as /users/:id/collections
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

    // Load earnings data - endpoint guessed as /users/:id/earnings
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

    // Load poem analytics - endpoint guessed as /poems/:id/analytics
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
        // leave existing analytics untouched
      }
    },

    // Follow user
    followUser: async (followerId: string, targetId: string) => {
      try {
        await api.post(`/users/${encodeURIComponent(followerId)}/follow/${encodeURIComponent(targetId)}`);
        // update local viewedProfile followersCount if it matches target
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
  }), {
    name: 'user-store',
  })
);
