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
  joinedAt: Date;
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
  earnedAt: Date;
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
  date: Date;
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
  loadUserProfile: (userId: string) => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  loadUserPoems: (userId: string) => Promise<void>;
  loadUserCollections: (userId: string) => Promise<void>;
  loadEarningsData: (userId: string) => Promise<void>;
  loadPoemAnalytics: (poemId: string) => Promise<void>;
  followUser: (userId: string) => Promise<void>;
  unfollowUser: (userId: string) => Promise<void>;
}

// Mock data for demonstration
const mockUserProfile: UserProfile = {
  id: 'user1',
  username: 'sarah_poet',
  email: 'sarah@example.com',
  walletAddress: '0x742d35Cc6634C0532925a3b8D...',
  bio: 'Digital poet exploring the intersection of technology and humanity. Collector of moments, weaver of words.',
  avatarUrl: '/avatars/sarah.jpg',
  coverImageUrl: '/covers/sarah-cover.jpg',
  joinedAt: new Date('2023-01-15'),
  reputation: 95,
  totalPoems: 24,
  totalCollaborations: 8,
  totalEarnings: 124.67,
  followersCount: 1247,
  followingCount: 89,
  poemsRead: 2847,
  poemsLiked: 567,
  isCollectiveContributor: true,
  badges: [
    {
      id: 'badge1',
      type: 'collective_contributor',
      earnedAt: new Date('2023-03-20'),
      displayName: 'Collective Contributor',
      iconUrl: '/badges/collective.svg',
      description: 'Poems included in Collective Consciousness training'
    },
    {
      id: 'badge2',
      type: 'trending_poet',
      earnedAt: new Date('2023-06-15'),
      displayName: 'Trending Poet',
      iconUrl: '/badges/trending.svg',
      description: 'Featured in trending poems multiple times'
    },
    {
      id: 'badge3',
      type: 'collaboration_master',
      earnedAt: new Date('2023-08-10'),
      displayName: 'Collaboration Master',
      iconUrl: '/badges/collaboration.svg',
      description: 'Successfully completed 5+ collaborations'
    }
  ],
  verificationStatus: 'verified',
  allowRemixes: true,
  defaultLicenseType: 'cc-by',
  notificationPreferences: {
    emailOnComment: true,
    emailOnRemix: true,
    emailOnSale: true,
    emailOnCollabInvite: true,
    pushNotifications: true,
  },
  website: 'https://sarahpoet.com',
  twitter: 'sarah_poet',
  instagram: 'sarah.poetry',
};

const mockEarningsData: EarningsData = {
  totalEarnings: 124.67,
  thisMonth: 12.45,
  lastMonth: 28.90,
  bySource: {
    nftSales: 45.20,
    microPayments: 32.15,
    licensing: 25.80,
    collectiveRoyalties: 15.32,
    collaborations: 6.20,
  },
  history: [
    { date: new Date('2024-01-01'), value: 8.45, source: 'nftSales' },
    { date: new Date('2024-01-02'), value: 2.30, source: 'microPayments' },
    { date: new Date('2024-01-03'), value: 15.20, source: 'licensing' },
    { date: new Date('2024-01-04'), value: 3.25, source: 'collectiveRoyalties' },
    { date: new Date('2024-01-05'), value: 1.50, source: 'collaborations' },
  ],
};

export const useUserStore = create<UserState>()(
  devtools((set, get) => ({
    // Initial State
    currentUser: null,
    isAuthenticated: true, // Mock authenticated
    viewedProfile: null,
    userPoems: [],
    userCollections: [],
    userCollaborations: [],
    earnings: null,
    poemAnalytics: {},
    isUpdatingProfile: false,
    isLoading: false,

    // Load user profile
    loadUserProfile: async (userId: string) => {
      set({ isLoading: true });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // For demo, always return mock data
      const profile = { ...mockUserProfile, id: userId };
      
      set({
        currentUser: userId === 'current' ? profile : null,
        viewedProfile: profile,
        isLoading: false,
      });
    },

    // Update profile
    updateProfile: async (updates: Partial<UserProfile>) => {
      set({ isUpdatingProfile: true });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      const { currentUser, viewedProfile } = get();
      
      if (currentUser) {
        const updatedUser = { ...currentUser, ...updates };
        set({
          currentUser: updatedUser,
          viewedProfile: viewedProfile?.id === currentUser.id ? updatedUser : viewedProfile,
          isUpdatingProfile: false,
        });
      }
    },

    // Load user poems
    loadUserPoems: async (userId: string) => {
      set({ isLoading: true });

      await new Promise(resolve => setTimeout(resolve, 800));

      // Mock poems data
      const mockPoems = [
        {
          id: 'poem1',
          title: 'Digital Solitude',
          content: 'In the quiet hum of machines...',
          excerpt: 'In the quiet hum of machines, I find a different kind of silence...',
          createdAt: new Date('2024-01-01'),
          views: 12457,
          likes: 423,
          comments: 67,
          bookmarks: 89,
          qualityScore: 85,
          nftTokenId: 'nft_abc123',
          earnings: 8.45,
        },
        {
          id: 'poem2',
          title: 'Urban Echoes',
          content: 'Concrete canyons whisper secrets...',
          excerpt: 'Concrete canyons whisper secrets, Neon lights paint stories...',
          createdAt: new Date('2024-01-05'),
          views: 8567,
          likes: 287,
          comments: 34,
          bookmarks: 45,
          qualityScore: 78,
          nftTokenId: 'nft_def456',
          earnings: 5.23,
        },
        // Add more mock poems as needed
      ];

      set({ userPoems: mockPoems, isLoading: false });
    },

    // Load user collections
    loadUserCollections: async (userId: string) => {
      set({ isLoading: true });

      await new Promise(resolve => setTimeout(resolve, 600));

      const mockCollections = [
        {
          id: 'collection1',
          title: 'Cyber Dreams',
          description: 'Poems exploring digital consciousness',
          poemCount: 8,
          followers: 124,
          isPublic: true,
          createdAt: new Date('2024-01-10'),
        },
        {
          id: 'collection2',
          title: 'Private Thoughts',
          description: 'Personal reflections and memories',
          poemCount: 12,
          followers: 0,
          isPublic: false,
          createdAt: new Date('2024-01-15'),
        },
      ];

      set({ userCollections: mockCollections, isLoading: false });
    },

    // Load earnings data
    loadEarningsData: async (userId: string) => {
      set({ isLoading: true });

      await new Promise(resolve => setTimeout(resolve, 700));

      set({ earnings: mockEarningsData, isLoading: false });
    },

    // Load poem analytics
    loadPoemAnalytics: async (poemId: string) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      const mockAnalytics: PoemAnalytics = {
        poemId,
        views: 12457,
        likes: 423,
        comments: 67,
        bookmarks: 89,
        shares: 234,
        earnings: 8.45,
        viewsOverTime: [
          { date: new Date('2024-01-01'), value: 1245, source: 'direct' },
          { date: new Date('2024-01-02'), value: 2345, source: 'social' },
          { date: new Date('2024-01-03'), value: 1876, source: 'platform' },
        ],
        audienceDemographics: {
          countries: [
            { country: 'United States', percentage: 35 },
            { country: 'United Kingdom', percentage: 15 },
            { country: 'Canada', percentage: 12 },
            { country: 'Australia', percentage: 8 },
            { country: 'Other', percentage: 30 },
          ],
          devices: [
            { device: 'Mobile', percentage: 65 },
            { device: 'Desktop', percentage: 30 },
            { device: 'Tablet', percentage: 5 },
          ],
        },
      };

      set((state) => ({
        poemAnalytics: {
          ...state.poemAnalytics,
          [poemId]: mockAnalytics,
        },
      }));
    },

    // Follow user
    followUser: async (userId: string) => {
      const { viewedProfile } = get();
      if (viewedProfile) {
        const updatedProfile = {
          ...viewedProfile,
          followersCount: viewedProfile.followersCount + 1,
        };
        set({ viewedProfile: updatedProfile });
      }
    },

    // Unfollow user
    unfollowUser: async (userId: string) => {
      const { viewedProfile } = get();
      if (viewedProfile && viewedProfile.followersCount > 0) {
        const updatedProfile = {
          ...viewedProfile,
          followersCount: viewedProfile.followersCount - 1,
        };
        set({ viewedProfile: updatedProfile });
      }
    },
  }), {
    name: 'user-store',
  })
);