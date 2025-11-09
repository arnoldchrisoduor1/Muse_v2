// lib/store/studio-store.ts
import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface StudioMetrics {
  totalEarnings: number;
  monthlyEarnings: number;
  totalViews: number;
  totalLikes: number;
  totalFollowers: number;
  engagementRate: number;
  avgQualityScore: number;
}

interface EarningsBreakdown {
  nftSales: number;
  microPayments: number;
  licensing: number;
  collectiveRoyalties: number;
  collaborations: number;
  tips: number;
}

interface RevenueTrend {
  date: Date;
  earnings: number;
  views: number;
  poemsPublished: number;
}

interface AudienceDemographics {
  countries: { country: string; percentage: number; viewers: number }[];
  devices: { device: string; percentage: number; viewers: number }[];
  ageGroups: { group: string; percentage: number }[];
  peakHours: { hour: number; viewers: number }[];
}

interface ContentPerformance {
  poemId: string;
  title: string;
  publishedAt: Date;
  views: number;
  likes: number;
  comments: number;
  bookmarks: number;
  shares: number;
  earnings: number;
  engagementRate: number;
  qualityScore: number;
}

interface CollaborationInsights {
  totalCollaborations: number;
  activeCollaborations: number;
  completedCollaborations: number;
  totalCollaborationEarnings: number;
  topCollaborators: { username: string; collaborations: number; earnings: number }[];
}

interface StudioState {
  // Core metrics
  metrics: StudioMetrics | null;
  earningsBreakdown: EarningsBreakdown | null;
  revenueTrends: RevenueTrend[];
  
  // Content analytics
  contentPerformance: ContentPerformance[];
  topPerformingPoems: ContentPerformance[];
  
  // Audience insights
  audienceDemographics: AudienceDemographics | null;
  
  // Collaboration insights
  collaborationInsights: CollaborationInsights | null;
  
  // Time period filter
  timeFilter: '7d' | '30d' | '90d' | '1y' | 'all';
  
  // UI state
  isLoading: boolean;
  isExporting: boolean;
  
  // Actions
  loadStudioData: (timeFilter?: string) => Promise<void>;
  loadContentPerformance: () => Promise<void>;
  loadAudienceInsights: () => Promise<void>;
  loadCollaborationInsights: () => Promise<void>;
  exportAnalytics: (format: 'csv' | 'pdf') => Promise<void>;
  setTimeFilter: (filter: '7d' | '30d' | '90d' | '1y' | 'all') => void;
}

// Mock data for demonstration
const mockMetrics: StudioMetrics = {
  totalEarnings: 124.67,
  monthlyEarnings: 12.45,
  totalViews: 124578,
  totalLikes: 4231,
  totalFollowers: 1247,
  engagementRate: 3.4,
  avgQualityScore: 82,
};

const mockEarningsBreakdown: EarningsBreakdown = {
  nftSales: 45.20,
  microPayments: 32.15,
  licensing: 25.80,
  collectiveRoyalties: 15.32,
  collaborations: 6.20,
  tips: 0.00,
};

const mockRevenueTrends: RevenueTrend[] = [
  { date: new Date('2024-01-01'), earnings: 8.45, views: 1245, poemsPublished: 1 },
  { date: new Date('2024-01-02'), earnings: 2.30, views: 856, poemsPublished: 0 },
  { date: new Date('2024-01-03'), earnings: 15.20, views: 2345, poemsPublished: 1 },
  { date: new Date('2024-01-04'), earnings: 3.25, views: 987, poemsPublished: 0 },
  { date: new Date('2024-01-05'), earnings: 1.50, views: 654, poemsPublished: 1 },
  { date: new Date('2024-01-06'), earnings: 12.80, views: 1876, poemsPublished: 0 },
  { date: new Date('2024-01-07'), earnings: 4.20, views: 1123, poemsPublished: 1 },
];

const mockContentPerformance: ContentPerformance[] = [
  {
    poemId: 'poem1',
    title: 'Digital Solitude',
    publishedAt: new Date('2024-01-01'),
    views: 12457,
    likes: 423,
    comments: 67,
    bookmarks: 89,
    shares: 234,
    earnings: 8.45,
    engagementRate: 3.4,
    qualityScore: 85,
  },
  {
    poemId: 'poem2',
    title: 'Urban Echoes',
    publishedAt: new Date('2024-01-03'),
    views: 8567,
    likes: 287,
    comments: 34,
    bookmarks: 45,
    shares: 123,
    earnings: 5.23,
    engagementRate: 2.8,
    qualityScore: 78,
  },
  {
    poemId: 'poem3',
    title: 'Neon Dreams',
    publishedAt: new Date('2024-01-05'),
    views: 5678,
    likes: 234,
    comments: 45,
    bookmarks: 67,
    shares: 89,
    earnings: 3.45,
    engagementRate: 3.1,
    qualityScore: 88,
  },
];

const mockAudienceDemographics: AudienceDemographics = {
  countries: [
    { country: 'United States', percentage: 35, viewers: 43592 },
    { country: 'United Kingdom', percentage: 15, viewers: 18687 },
    { country: 'Canada', percentage: 12, viewers: 14949 },
    { country: 'Australia', percentage: 8, viewers: 9966 },
    { country: 'Germany', percentage: 6, viewers: 7475 },
    { country: 'Other', percentage: 24, viewers: 29909 },
  ],
  devices: [
    { device: 'Mobile', percentage: 65, viewers: 80976 },
    { device: 'Desktop', percentage: 30, viewers: 37374 },
    { device: 'Tablet', percentage: 5, viewers: 6229 },
  ],
  ageGroups: [
    { group: '18-24', percentage: 28 },
    { group: '25-34', percentage: 35 },
    { group: '35-44', percentage: 22 },
    { group: '45+', percentage: 15 },
  ],
  peakHours: [
    { hour: 8, viewers: 1245 },
    { hour: 12, viewers: 2345 },
    { hour: 18, viewers: 1876 },
    { hour: 21, viewers: 1567 },
  ],
};

const mockCollaborationInsights: CollaborationInsights = {
  totalCollaborations: 8,
  activeCollaborations: 2,
  completedCollaborations: 6,
  totalCollaborationEarnings: 24.50,
  topCollaborators: [
    { username: 'alex_verse', collaborations: 3, earnings: 12.25 },
    { username: 'maya_words', collaborations: 2, earnings: 8.15 },
    { username: 'jordan_rhymes', collaborations: 1, earnings: 4.10 },
  ],
};

export const useStudioStore = create<StudioState>()(
  devtools((set, get) => ({
    // Initial State
    metrics: null,
    earningsBreakdown: null,
    revenueTrends: [],
    contentPerformance: [],
    topPerformingPoems: [],
    audienceDemographics: null,
    collaborationInsights: null,
    timeFilter: '30d',
    isLoading: false,
    isExporting: false,

    // Load studio data
    loadStudioData: async (timeFilter = '30d') => {
      set({ isLoading: true });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      set({
        metrics: mockMetrics,
        earningsBreakdown: mockEarningsBreakdown,
        revenueTrends: mockRevenueTrends,
        contentPerformance: mockContentPerformance,
        topPerformingPoems: mockContentPerformance.slice(0, 3),
        timeFilter: timeFilter as any,
        isLoading: false,
      });
    },

    // Load content performance
    loadContentPerformance: async () => {
      set({ isLoading: true });

      await new Promise(resolve => setTimeout(resolve, 1000));

      set({
        contentPerformance: mockContentPerformance,
        topPerformingPoems: mockContentPerformance.slice(0, 3),
        isLoading: false,
      });
    },

    // Load audience insights
    loadAudienceInsights: async () => {
      set({ isLoading: true });

      await new Promise(resolve => setTimeout(resolve, 1200));

      set({
        audienceDemographics: mockAudienceDemographics,
        isLoading: false,
      });
    },

    // Load collaboration insights
    loadCollaborationInsights: async () => {
      set({ isLoading: true });

      await new Promise(resolve => setTimeout(resolve, 800));

      set({
        collaborationInsights: mockCollaborationInsights,
        isLoading: false,
      });
    },

    // Export analytics
    exportAnalytics: async (format: 'csv' | 'pdf') => {
      set({ isExporting: true });

      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 2000));

      console.log(`Exporting analytics as ${format.toUpperCase()}`);
      
      set({ isExporting: false });
    },

    // Set time filter
    setTimeFilter: (filter: '7d' | '30d' | '90d' | '1y' | 'all') => {
      set({ timeFilter: filter });
      // In real app, this would trigger a data reload
    },
  }), {
    name: 'studio-store',
  })
);