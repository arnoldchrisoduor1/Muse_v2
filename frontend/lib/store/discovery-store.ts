import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface Poem {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  author: {
    id: string;
    username: string;
    avatarUrl: string;
    isVerified: boolean;
  };
  createdAt: Date;
  views: number;
  likes: number;
  comments: number;
  bookmarks: number;
  qualityScore: number;
  tags: string[];
  themes: string[];
  mood: string;
  isCollaborative: boolean;
  isAnonymous: boolean;
  nftTokenId: string | null;
  licenseType: string;
  readingTime: number;
}

interface SearchFilters {
  query: string;
  semanticQuery: string;
  tags: string[];
  themes: string[];
  moods: string[];
  minQualityScore: number;
  maxQualityScore: number;
  isCollaborative: boolean | null;
  hasNFT: boolean | null;
  licenseTypes: string[];
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
  sortBy: 'recent' | 'popular' | 'quality' | 'trending' | 'semantic';
}

interface SearchResults {
  poems: Poem[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
  semanticMatches?: SemanticMatch[];
}

interface SemanticMatch {
  poemId: string;
  poem: Poem;
  similarityScore: number;
  matchedThemes: string[];
}

interface DiscoveryState {
  // Search state
  searchFilters: SearchFilters;
  searchResults: SearchResults | null;
  isSearching: boolean;
  
  // Discovery feeds
  trendingPoems: Poem[];
  recentPoems: Poem[];
  featuredCollections: any[];
  
  // UI state
  searchView: 'grid' | 'list' | 'minimal';
  selectedPoem: Poem | null;
  
  // Actions
  setSearchFilters: (filters: Partial<SearchFilters>) => void;
  performSearch: (filters?: Partial<SearchFilters>) => Promise<void>;
  performSemanticSearch: (query: string) => Promise<SemanticMatch[]>;
  clearSearch: () => void;
  loadTrendingPoems: () => Promise<void>;
  loadRecentPoems: () => Promise<void>;
  loadFeaturedCollections: () => Promise<void>;
  likePoem: (poemId: string) => void;
  bookmarkPoem: (poemId: string) => void;
}

// Mock data for demonstration
const mockPoems: Poem[] = [
  {
    id: 'poem_1',
    title: 'Digital Solitude',
    content: `In the quiet hum of machines,
I find a different kind of silence,
Not the absence of sound,
But the presence of connection
Across digital divides.

My thoughts become electrons,
Dancing through fiber optic veins,
Reaching out to touch other souls
Who also stare at glowing rectangles
In the dark.`,
    excerpt: 'In the quiet hum of machines, I find a different kind of silence...',
    author: {
      id: 'user1',
      username: 'sarah_poet',
      avatarUrl: '/avatars/sarah.jpg',
      isVerified: true,
    },
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    views: 12457,
    likes: 423,
    comments: 67,
    bookmarks: 89,
    qualityScore: 85,
    tags: ['technology', 'loneliness', 'connection'],
    themes: ['technology', 'identity', 'society'],
    mood: 'contemplative',
    isCollaborative: false,
    isAnonymous: false,
    nftTokenId: 'nft_abc123',
    licenseType: 'all-rights-reserved',
    readingTime: 2,
  },
  {
    id: 'poem_2',
    title: 'Urban Echoes',
    content: `Concrete canyons whisper secrets,
Neon lights paint stories on wet pavement,
A million footsteps echo through time,
Each one a poem waiting to be heard.

The city breathes in rhythm,
A heartbeat of steel and dreams,
We are all just temporary residents
In this eternal urban stream.`,
    excerpt: 'Concrete canyons whisper secrets, Neon lights paint stories...',
    author: {
      id: 'user2',
      username: 'alex_verse',
      avatarUrl: '/avatars/alex.jpg',
      isVerified: false,
    },
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    views: 8567,
    likes: 287,
    comments: 34,
    bookmarks: 45,
    qualityScore: 78,
    tags: ['urban', 'city', 'modern'],
    themes: ['place', 'society', 'time'],
    mood: 'melancholic',
    isCollaborative: true,
    isAnonymous: false,
    nftTokenId: 'nft_def456',
    licenseType: 'cc-by',
    readingTime: 1,
  },
  {
    id: 'poem_3',
    title: 'The Emperor Has No Bytes',
    content: `Behind seven proxies and encrypted streams,
I pour my truth into digital dreams,
No name, no face, just words that burn,
Lessons that society needs to learn.

The blockchain bears my silent mark,
A revolution sparked in dark,
Ownership proved but identity veiled,
In zero-knowledge, my truth is hailed.`,
    excerpt: 'Behind seven proxies and encrypted streams, I pour my truth...',
    author: {
      id: 'anonymous_1',
      username: 'Anonymous',
      avatarUrl: '/avatars/anonymous.png',
      isVerified: false,
    },
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    views: 23489,
    likes: 892,
    comments: 156,
    bookmarks: 234,
    qualityScore: 92,
    tags: ['politics', 'anonymous', 'revolution'],
    themes: ['social-justice', 'technology', 'freedom'],
    mood: 'defiant',
    isCollaborative: false,
    isAnonymous: true,
    nftTokenId: 'nft_zk_789',
    licenseType: 'cc-by-sa',
    readingTime: 1,
  },
  {
    id: 'poem_4',
    title: 'Neon Dreams',
    content: `In circuits deep where neon bleeds,
We plant our digital seeds,
A symphony of light and code,
On this electric road we've strode.

The future hums in binary,
A world both near and visionary,
Where flesh and silicon combine,
To redefine the human design.`,
    excerpt: 'In circuits deep where neon bleeds, We plant our digital seeds...',
    author: {
      id: 'user3',
      username: 'maya_words',
      avatarUrl: '/avatars/maya.jpg',
      isVerified: true,
    },
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    views: 5678,
    likes: 234,
    comments: 45,
    bookmarks: 67,
    qualityScore: 88,
    tags: ['cyberpunk', 'future', 'technology'],
    themes: ['technology', 'future', 'identity'],
    mood: 'hopeful',
    isCollaborative: true,
    isAnonymous: false,
    nftTokenId: 'nft_ghi012',
    licenseType: 'all-rights-reserved',
    readingTime: 1,
  }
];

const availableTags = ['technology', 'love', 'nature', 'urban', 'political', 'emotional', 'experimental', 'traditional', 'modern', 'classic'];
const availableThemes = ['love', 'loss', 'nature', 'identity', 'social-justice', 'technology', 'existential', 'joy', 'memory', 'place'];
const availableMoods = ['melancholic', 'hopeful', 'angry', 'peaceful', 'anxious', 'joyful', 'contemplative', 'defiant'];

export const useDiscoveryStore = create<DiscoveryState>()(
  devtools((set, get) => ({
    // Initial State
    searchFilters: {
      query: '',
      semanticQuery: '',
      tags: [],
      themes: [],
      moods: [],
      minQualityScore: 0,
      maxQualityScore: 100,
      isCollaborative: null,
      hasNFT: null,
      licenseTypes: [],
      dateRange: {
        start: null,
        end: null,
      },
      sortBy: 'recent',
    },
    searchResults: null,
    isSearching: false,
    trendingPoems: [],
    recentPoems: [],
    featuredCollections: [],
    searchView: 'grid',
    selectedPoem: null,

    // Set search filters
    setSearchFilters: (filters) => {
      set((state) => ({
        searchFilters: { ...state.searchFilters, ...filters }
      }));
    },

    // Perform search
    performSearch: async (filters?: Partial<SearchFilters>) => {
      set({ isSearching: true });

      // Update filters if provided
      if (filters) {
        set((state) => ({
          searchFilters: { ...state.searchFilters, ...filters }
        }));
      }

      const { searchFilters } = get();

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Filter poems based on search criteria
      let filteredPoems = [...mockPoems];

      // Text search
      if (searchFilters.query) {
        const query = searchFilters.query.toLowerCase();
        filteredPoems = filteredPoems.filter(poem =>
          poem.title.toLowerCase().includes(query) ||
          poem.content.toLowerCase().includes(query) ||
          poem.tags.some(tag => tag.toLowerCase().includes(query)) ||
          poem.author.username.toLowerCase().includes(query)
        );
      }

      // Tag filter
      if (searchFilters.tags.length > 0) {
        filteredPoems = filteredPoems.filter(poem =>
          searchFilters.tags.some(tag => poem.tags.includes(tag))
        );
      }

      // Theme filter
      if (searchFilters.themes.length > 0) {
        filteredPoems = filteredPoems.filter(poem =>
          searchFilters.themes.some(theme => poem.themes.includes(theme))
        );
      }

      // Mood filter
      if (searchFilters.moods.length > 0) {
        filteredPoems = filteredPoems.filter(poem =>
          searchFilters.moods.includes(poem.mood)
        );
      }

      // Quality score filter
      filteredPoems = filteredPoems.filter(poem =>
        poem.qualityScore >= searchFilters.minQualityScore &&
        poem.qualityScore <= searchFilters.maxQualityScore
      );

      // Collaborative filter
      if (searchFilters.isCollaborative !== null) {
        filteredPoems = filteredPoems.filter(poem =>
          poem.isCollaborative === searchFilters.isCollaborative
        );
      }

      // NFT filter
      if (searchFilters.hasNFT !== null) {
        filteredPoems = filteredPoems.filter(poem =>
          searchFilters.hasNFT ? poem.nftTokenId !== null : poem.nftTokenId === null
        );
      }

      // License filter
      if (searchFilters.licenseTypes.length > 0) {
        filteredPoems = filteredPoems.filter(poem =>
          searchFilters.licenseTypes.includes(poem.licenseType)
        );
      }

      // Date range filter
      if (searchFilters.dateRange.start) {
        filteredPoems = filteredPoems.filter(poem =>
          poem.createdAt >= searchFilters.dateRange.start!
        );
      }
      if (searchFilters.dateRange.end) {
        filteredPoems = filteredPoems.filter(poem =>
          poem.createdAt <= searchFilters.dateRange.end!
        );
      }

      // Sort results
      filteredPoems.sort((a, b) => {
        switch (searchFilters.sortBy) {
          case 'recent':
            return b.createdAt.getTime() - a.createdAt.getTime();
          case 'popular':
            return (b.views + b.likes * 10 + b.comments * 5) - (a.views + a.likes * 10 + a.comments * 5);
          case 'quality':
            return b.qualityScore - a.qualityScore;
          case 'trending':
            const aTrending = (a.views * 0.1) + (a.likes * 0.3) + (a.comments * 0.2) + (a.qualityScore * 0.4);
            const bTrending = (b.views * 0.1) + (b.likes * 0.3) + (b.comments * 0.2) + (b.qualityScore * 0.4);
            return bTrending - aTrending;
          default:
            return b.createdAt.getTime() - a.createdAt.getTime();
        }
      });

      const searchResults: SearchResults = {
        poems: filteredPoems.slice(0, 20), // First page
        total: filteredPoems.length,
        page: 1,
        pageSize: 20,
        hasMore: filteredPoems.length > 20,
      };

      set({
        searchResults,
        isSearching: false,
      });
    },

    // Perform semantic search
    performSemanticSearch: async (query: string): Promise<SemanticMatch[]> => {
      // Simulate AI-powered semantic search
      await new Promise(resolve => setTimeout(resolve, 800));

      const semanticMatches: SemanticMatch[] = mockPoems
        .map(poem => ({
          poemId: poem.id,
          poem,
          similarityScore: Math.random() * 0.5 + 0.5, // 0.5-1.0
          matchedThemes: poem.themes.slice(0, 2),
        }))
        .sort((a, b) => b.similarityScore - a.similarityScore)
        .slice(0, 5);

      return semanticMatches;
    },

    // Clear search
    clearSearch: () => {
      set({
        searchFilters: {
          query: '',
          semanticQuery: '',
          tags: [],
          themes: [],
          moods: [],
          minQualityScore: 0,
          maxQualityScore: 100,
          isCollaborative: null,
          hasNFT: null,
          licenseTypes: [],
          dateRange: {
            start: null,
            end: null,
          },
          sortBy: 'recent',
        },
        searchResults: null,
      });
    },

    // Load trending poems
    loadTrendingPoems: async () => {
      await new Promise(resolve => setTimeout(resolve, 500));

      const trending = [...mockPoems]
        .sort((a, b) => {
          const aScore = (a.views * 0.2) + (a.likes * 0.4) + (a.comments * 0.2) + (a.qualityScore * 0.2);
          const bScore = (b.views * 0.2) + (b.likes * 0.4) + (b.comments * 0.2) + (b.qualityScore * 0.2);
          return bScore - aScore;
        })
        .slice(0, 6);

      set({ trendingPoems: trending });
    },

    // Load recent poems
    loadRecentPoems: async () => {
      await new Promise(resolve => setTimeout(resolve, 500));

      const recent = [...mockPoems]
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, 8);

      set({ recentPoems: recent });
    },

    // Load featured collections
    loadFeaturedCollections: async () => {
      await new Promise(resolve => setTimeout(resolve, 700));

      const featuredCollections = [
        {
          id: 'collection_1',
          title: 'Cyberpunk Dreams',
          description: 'Poems exploring technology and humanity',
          curator: 'tech_curator',
          poemCount: 24,
          coverImage: '/collections/cyberpunk.jpg',
        },
        {
          id: 'collection_2',
          title: 'Urban Echoes',
          description: 'City life and modern experiences',
          curator: 'city_poet',
          poemCount: 18,
          coverImage: '/collections/urban.jpg',
        },
        {
          id: 'collection_3',
          title: 'Anonymous Voices',
          description: 'Powerful poems from hidden authors',
          curator: 'shadow_curator',
          poemCount: 15,
          coverImage: '/collections/anonymous.jpg',
        },
      ];

      set({ featuredCollections });
    },

    // Like a poem
    likePoem: (poemId: string) => {
      const { searchResults, trendingPoems, recentPoems } = get();

      const updatePoemInArray = (poems: Poem[]) =>
        poems.map(poem =>
          poem.id === poemId ? { ...poem, likes: poem.likes + 1 } : poem
        );

      set({
        searchResults: searchResults ? {
          ...searchResults,
          poems: updatePoemInArray(searchResults.poems),
        } : null,
        trendingPoems: updatePoemInArray(trendingPoems),
        recentPoems: updatePoemInArray(recentPoems),
      });
    },

    // Bookmark a poem
    bookmarkPoem: (poemId: string) => {
      const { searchResults, trendingPoems, recentPoems } = get();

      const updatePoemInArray = (poems: Poem[]) =>
        poems.map(poem =>
          poem.id === poemId ? { ...poem, bookmarks: poem.bookmarks + 1 } : poem
        );

      set({
        searchResults: searchResults ? {
          ...searchResults,
          poems: updatePoemInArray(searchResults.poems),
        } : null,
        trendingPoems: updatePoemInArray(trendingPoems),
        recentPoems: updatePoemInArray(recentPoems),
      });
    },
  }), {
    name: 'discovery-store',
  })
);