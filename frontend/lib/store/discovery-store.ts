import { create } from "zustand";
import { devtools } from "zustand/middleware";
import axios from "axios";
import { useSoloPoetStore } from "./solo-poet-store";
import { useAuthStore } from "./auth-store";

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
  sortBy: "recent" | "popular" | "quality" | "trending" | "semantic";
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
  isLoading: boolean;

  // Discovery feeds
  trendingPoems: Poem[];
  recentPoems: Poem[];
  featuredCollections: any[];

  // UI state
  searchView: "grid" | "list" | "minimal";
  selectedPoem: Poem | null;

  // Actions
  setSearchFilters: (filters: Partial<SearchFilters>) => void;
  performSearch: (filters?: Partial<SearchFilters>) => Promise<void>;
  performSemanticSearch: (query: string) => Promise<SemanticMatch[]>;
  clearSearch: () => void;
  getPoem: (poemId: string) => void;
  loadTrendingPoems: () => Promise<void>;
  loadRecentPoems: () => Promise<void>;
  loadFeaturedCollections: () => Promise<void>;
  likePoem: (poemId: string) => void;
  unlikePoem: (poemId: string) => void;
  bookmarkPoem: (poemId: string) => void;
  unbookmarkPoem: (poemId: string) => void;
  checkIfBookmarked: (poemId: string) => void;
  checkIfLiked: (poemId: string) => void;
  addComment: (poemId: string, content: string) => void;
  getComments: (poemId: string) => void;
  deleteComment: (poemId: string, commentId: string) => void;
  voteOnComment: (poemId: string, voteType: string) => void;
  removeCommentVote: (poemId: string) => void;
  getCommentVote: (commentId: string) => void;
  incrementViews: (poemId: string) => void;
}

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

const apiClient = axios.create({
  baseURL: `${API_URL}/api/v1`,
  withCredentials: true,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// helper function to get the auth token.
const getAccessToken = () => {
  return useAuthStore.getState().accessToken ?? null;
};

const setAuthHeader = (token: string | null) => {
  if (token) {
    apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common["Authorization"];
  }
};

// Mock data for demonstration
const mockPoems: Poem[] = [
  {
    id: "poem_1",
    title: "Digital Solitude",
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
    excerpt:
      "In the quiet hum of machines, I find a different kind of silence...",
    author: {
      id: "user1",
      username: "sarah_poet",
      avatarUrl: "/avatars/sarah.jpg",
      isVerified: true,
    },
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    views: 12457,
    likes: 423,
    comments: 67,
    bookmarks: 89,
    qualityScore: 85,
    tags: ["technology", "loneliness", "connection"],
    themes: ["technology", "identity", "society"],
    mood: "contemplative",
    isCollaborative: false,
    isAnonymous: false,
    nftTokenId: "nft_abc123",
    licenseType: "all-rights-reserved",
    readingTime: 2,
  },
  {
    id: "poem_2",
    title: "Urban Echoes",
    content: `Concrete canyons whisper secrets,
Neon lights paint stories on wet pavement,
A million footsteps echo through time,
Each one a poem waiting to be heard.

The city breathes in rhythm,
A heartbeat of steel and dreams,
We are all just temporary residents
In this eternal urban stream.`,
    excerpt: "Concrete canyons whisper secrets, Neon lights paint stories...",
    author: {
      id: "user2",
      username: "alex_verse",
      avatarUrl: "/avatars/alex.jpg",
      isVerified: false,
    },
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    views: 8567,
    likes: 287,
    comments: 34,
    bookmarks: 45,
    qualityScore: 78,
    tags: ["urban", "city", "modern"],
    themes: ["place", "society", "time"],
    mood: "melancholic",
    isCollaborative: true,
    isAnonymous: false,
    nftTokenId: "nft_def456",
    licenseType: "cc-by",
    readingTime: 1,
  },
  {
    id: "poem_3",
    title: "The Emperor Has No Bytes",
    content: `Behind seven proxies and encrypted streams,
I pour my truth into digital dreams,
No name, no face, just words that burn,
Lessons that society needs to learn.

The blockchain bears my silent mark,
A revolution sparked in dark,
Ownership proved but identity veiled,
In zero-knowledge, my truth is hailed.`,
    excerpt: "Behind seven proxies and encrypted streams, I pour my truth...",
    author: {
      id: "anonymous_1",
      username: "Anonymous",
      avatarUrl: "/avatars/anonymous.png",
      isVerified: false,
    },
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    views: 23489,
    likes: 892,
    comments: 156,
    bookmarks: 234,
    qualityScore: 92,
    tags: ["politics", "anonymous", "revolution"],
    themes: ["social-justice", "technology", "freedom"],
    mood: "defiant",
    isCollaborative: false,
    isAnonymous: true,
    nftTokenId: "nft_zk_789",
    licenseType: "cc-by-sa",
    readingTime: 1,
  },
  {
    id: "poem_4",
    title: "Neon Dreams",
    content: `In circuits deep where neon bleeds,
We plant our digital seeds,
A symphony of light and code,
On this electric road we've strode.

The future hums in binary,
A world both near and visionary,
Where flesh and silicon combine,
To redefine the human design.`,
    excerpt:
      "In circuits deep where neon bleeds, We plant our digital seeds...",
    author: {
      id: "user3",
      username: "maya_words",
      avatarUrl: "/avatars/maya.jpg",
      isVerified: true,
    },
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    views: 5678,
    likes: 234,
    comments: 45,
    bookmarks: 67,
    qualityScore: 88,
    tags: ["cyberpunk", "future", "technology"],
    themes: ["technology", "future", "identity"],
    mood: "hopeful",
    isCollaborative: true,
    isAnonymous: false,
    nftTokenId: "nft_ghi012",
    licenseType: "all-rights-reserved",
    readingTime: 1,
  },
];

const availableTags = [
  "technology",
  "love",
  "nature",
  "urban",
  "political",
  "emotional",
  "experimental",
  "traditional",
  "modern",
  "classic",
];
const availableThemes = [
  "love",
  "loss",
  "nature",
  "identity",
  "social-justice",
  "technology",
  "existential",
  "joy",
  "memory",
  "place",
];
const availableMoods = [
  "melancholic",
  "hopeful",
  "angry",
  "peaceful",
  "anxious",
  "joyful",
  "contemplative",
  "defiant",
];

export const useDiscoveryStore = create<DiscoveryState>()(
  devtools(
    (set, get) => ({
      // Initial State
      searchFilters: {
        query: "",
        semanticQuery: "",
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
        sortBy: "recent",
      },
      searchResults: null,
      isLoading: false,
      isSearching: false,
      trendingPoems: [],
      recentPoems: [],
      featuredCollections: [],
      searchView: "grid",
      selectedPoem: null,

      // Set search filters
      setSearchFilters: (filters) => {
        set((state) => ({
          searchFilters: { ...state.searchFilters, ...filters },
        }));
      },

      // Perform search
      // Perform search - Updated to handle response object
      performSearch: async (filters?: Partial<SearchFilters>) => {
        set({ isSearching: true });

        if (filters) {
          set((state) => ({
            searchFilters: { ...state.searchFilters, ...filters },
          }));
        }

        const { searchFilters } = get();

        try {
          setAuthHeader(getAccessToken());

          const response = await apiClient.get("/poems/search", {
            params: {
              query: searchFilters.query,
              tags: searchFilters.tags.join(","),
              themes: searchFilters.themes.join(","),
              moods: searchFilters.moods.join(","),
              minQualityScore: searchFilters.minQualityScore,
              maxQualityScore: searchFilters.maxQualityScore,
              isCollaborative: searchFilters.isCollaborative,
              hasNFT: searchFilters.hasNFT,
              licenseTypes: searchFilters.licenseTypes.join(","),
              sortBy: searchFilters.sortBy,
              page: 1,
              limit: 20,
            },
          });

          // Extract poems array and pagination data
          const poems = response.data.items || response.data.poems || [];
          const total = response.data.total || poems.length;

          const searchResults: SearchResults = {
            poems: Array.isArray(poems) ? poems : [],
            total,
            page: response.data.page || 1,
            pageSize: response.data.limit || response.data.pageSize || 20,
            hasMore: response.data.hasNext || response.data.hasMore || false,
          };

          set({
            searchResults,
            isSearching: false,
          });
        } catch (error) {
          console.error("Search failed:", error);
          set({ isSearching: false });
        }
      },

      // Perform semantic search
      performSemanticSearch: async (
        query: string
      ): Promise<SemanticMatch[]> => {
        try {
          setAuthHeader(getAccessToken());

          const response = await apiClient.post("/poems/semantic-search", {
            query,
            limit: 5,
          });

          return response.data.matches || response.data;
        } catch (error) {
          console.error("Semantic search failed:", error);
          return [];
        }
      },

      // Clear search
      clearSearch: () => {
        set({
          searchFilters: {
            query: "",
            semanticQuery: "",
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
            sortBy: "recent",
          },
          searchResults: null,
        });
      },

      getPoem: async (poemId: string) => {
      try {
        setAuthHeader(getAccessToken());
        const response = await apiClient.get(`/poems/${poemId}`);
        return response.data;
      } catch (error) {
        console.error('Failed to get poem:', error);
        
        // Fallback to solo poet store
        const { allPoems } = useSoloPoetStore.getState();
        return allPoems.find(poem => poem.id === poemId) || null;
      }
    },

      // Load trending poems - Updated to use real API
      loadTrendingPoems: async () => {
        try {
          setAuthHeader(getAccessToken());

          const response = await apiClient.get("/poems/trending", {
            params: { limit: 6 },
          });

          const poems =
            response.data.items || response.data.poems || response.data;

          const trendingPoems = Array.isArray(poems) ? poems : [];
          set({ trendingPoems });
        } catch (error) {
          console.error("Failed to load trending poems:", error);
          // Fallback to solo poet store
          const { allPoems } = useSoloPoetStore.getState();
          const trending = [...allPoems]
            .sort((a, b) => (b.likes || 0) - (a.likes || 0))
            .slice(0, 6);
          set({ trendingPoems: trending });
        }
      },

      // Load recent poems - Updated to use real API
      loadRecentPoems: async () => {
        try {
          setAuthHeader(getAccessToken());

          const response = await apiClient.get("/poems/recent", {
            params: { limit: 8 },
          });

          // Extract poems array from response
          const poems =
            response.data.items || response.data.poems || response.data;

          // Ensure it's an array
          const recentPoems = Array.isArray(poems) ? poems : [];

          set({ recentPoems });
        } catch (error) {
          console.error("Failed to load recent poems:", error);
          // Fallback to solo poet store
          const { allPoems } = useSoloPoetStore.getState();
          const recent = [...allPoems]
            .sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
            )
            .slice(0, 8);
          set({ recentPoems: recent });
        }
      },

      // Load featured collections (keep your existing mock implementation for now)
      loadFeaturedCollections: async () => {
        await new Promise((resolve) => setTimeout(resolve, 700));

        const featuredCollections = [
          {
            id: "collection_1",
            title: "Cyberpunk Dreams",
            description: "Poems exploring technology and humanity",
            curator: "tech_curator",
            poemCount: 24,
            coverImage: "/collections/cyberpunk.jpg",
          },
          {
            id: "collection_2",
            title: "Urban Echoes",
            description: "City life and modern experiences",
            curator: "city_poet",
            poemCount: 18,
            coverImage: "/collections/urban.jpg",
          },
          {
            id: "collection_3",
            title: "Anonymous Voices",
            description: "Powerful poems from hidden authors",
            curator: "shadow_curator",
            poemCount: 15,
            coverImage: "/collections/anonymous.jpg",
          },
        ];

        set({ featuredCollections });
      },

      // Like a poem - Updated to use real API
      likePoem: async (poemId: string) => {
        const { user } = useAuthStore.getState();
        if (!user) {
          // Redirect to login or show auth modal
          console.log("User not authenticated");
          return;
        }

        try {
          setAuthHeader(getAccessToken());
          await apiClient.post(`/poems/${poemId}/likes`);

          // Update local state optimistically
          const { searchResults, trendingPoems, recentPoems } = get();

          const updatePoemInArray = (poems: Poem[]) =>
            poems.map((poem) =>
              poem.id === poemId
                ? { ...poem, likes: (poem.likes || 0) + 1 }
                : poem
            );

          set({
            searchResults: searchResults
              ? {
                  ...searchResults,
                  poems: updatePoemInArray(searchResults.poems),
                }
              : null,
            trendingPoems: updatePoemInArray(trendingPoems),
            recentPoems: updatePoemInArray(recentPoems),
          });

          console.log("Poem liked successfully");
        } catch (error) {
          console.error("Failed to like poem:", error);
        }
      },

      // Unlike a poem - New method
      unlikePoem: async (poemId: string) => {
        const { user } = useAuthStore.getState();
        if (!user) return;

        try {
          setAuthHeader(getAccessToken());
          await apiClient.delete(`/poems/${poemId}/likes`);

          // Update local state optimistically
          const { searchResults, trendingPoems, recentPoems } = get();

          const updatePoemInArray = (poems: Poem[]) =>
            poems.map((poem) =>
              poem.id === poemId
                ? { ...poem, likes: Math.max(0, (poem.likes || 0) - 1) }
                : poem
            );

          set({
            searchResults: searchResults
              ? {
                  ...searchResults,
                  poems: updatePoemInArray(searchResults.poems),
                }
              : null,
            trendingPoems: updatePoemInArray(trendingPoems),
            recentPoems: updatePoemInArray(recentPoems),
          });

          console.log("Poem unliked successfully");
        } catch (error) {
          console.error("Failed to unlike poem:", error);
        }
      },

      // Bookmark a poem - Updated to use real API
      bookmarkPoem: async (poemId: string) => {
        const { user } = useAuthStore.getState();
        if (!user) {
          console.log("User not authenticated");
          return;
        }

        try {
          setAuthHeader(getAccessToken());
          await apiClient.post(`/poems/${poemId}/bookmarks`);

          // Update local state optimistically
          const { searchResults, trendingPoems, recentPoems } = get();

          const updatePoemInArray = (poems: Poem[]) =>
            poems.map((poem) =>
              poem.id === poemId
                ? { ...poem, bookmarks: (poem.bookmarks || 0) + 1 }
                : poem
            );

          set({
            searchResults: searchResults
              ? {
                  ...searchResults,
                  poems: updatePoemInArray(searchResults.poems),
                }
              : null,
            trendingPoems: updatePoemInArray(trendingPoems),
            recentPoems: updatePoemInArray(recentPoems),
          });

          console.log("Poem bookmarked successfully");
        } catch (error) {
          console.error("Failed to bookmark poem:", error);
        }
      },

      // Unbookmark a poem - New method
      unbookmarkPoem: async (poemId: string) => {
        const { user } = useAuthStore.getState();
        if (!user) return;

        try {
          setAuthHeader(getAccessToken());
          await apiClient.delete(`/poems/${poemId}/bookmarks`);

          // Update local state optimistically
          const { searchResults, trendingPoems, recentPoems } = get();

          const updatePoemInArray = (poems: Poem[]) =>
            poems.map((poem) =>
              poem.id === poemId
                ? { ...poem, bookmarks: Math.max(0, (poem.bookmarks || 0) - 1) }
                : poem
            );

          set({
            searchResults: searchResults
              ? {
                  ...searchResults,
                  poems: updatePoemInArray(searchResults.poems),
                }
              : null,
            trendingPoems: updatePoemInArray(trendingPoems),
            recentPoems: updatePoemInArray(recentPoems),
          });

          console.log("Poem unbookmarked successfully");
        } catch (error) {
          console.error("Failed to unbookmark poem:", error);
        }
      },

      // Check if user has liked a poem - New method
      checkIfLiked: async (poemId: string): Promise<boolean> => {
        const { user } = useAuthStore.getState();
        if (!user) return false;

        try {
          setAuthHeader(getAccessToken());
          const response = await apiClient.get(`/poems/${poemId}/likes/check`);
          return response.data.hasLiked || false;
        } catch (error) {
          console.error("Failed to check like status:", error);
          return false;
        }
      },

      // Check if user has bookmarked a poem - New method
      checkIfBookmarked: async (poemId: string): Promise<boolean> => {
        const { user } = useAuthStore.getState();
        if (!user) return false;

        try {
          setAuthHeader(getAccessToken());
          const response = await apiClient.get(
            `/poems/${poemId}/bookmarks/check`
          );
          return response.data.hasBookmarked || false;
        } catch (error) {
          console.error("Failed to check bookmark status:", error);
          return false;
        }
      },

      // Add comment to poem - New method
      addComment: async (poemId: string, content: string) => {
        const { user } = useAuthStore.getState();
        if (!user) {
          console.log("User not authenticated");
          return null;
        }

        try {
          setAuthHeader(getAccessToken());
          const response = await apiClient.post(`/poems/${poemId}/comments`, {
            content,
          });

          // Update local state optimistically
          const { searchResults, trendingPoems, recentPoems } = get();

          const updatePoemInArray = (poems: Poem[]) =>
            poems.map((poem) =>
              poem.id === poemId
                ? { ...poem, comments: (poem.comments || 0) + 1 }
                : poem
            );

          set({
            searchResults: searchResults
              ? {
                  ...searchResults,
                  poems: updatePoemInArray(searchResults.poems),
                }
              : null,
            trendingPoems: updatePoemInArray(trendingPoems),
            recentPoems: updatePoemInArray(recentPoems),
          });

          console.log("Comment added successfully", response.data);
          return response.data;
        } catch (error) {
          console.error("Failed to add comment:", error);
          return null;
        }
      },

      // Get comments for poem
      getComments: async (
        poemId: string,
        page: number = 1,
        limit: number = 20
      ) => {
        try {
          setAuthHeader(getAccessToken());
          const response = await apiClient.get(`/poems/${poemId}/comments`, {
            params: { page, limit },
          });
          return response.data;
        } catch (error) {
          console.error("Failed to get comments:", error);
          return { items: [], total: 0, page: 1, hasMore: false };
        }
      },
      voteOnComment: async (commentId: string, voteType: 'UP' | 'DOWN') => {
  const { user } = useAuthStore.getState();
  if (!user) {
    console.log('User not authenticated');
    return null;
  }

  try {
    setAuthHeader(getAccessToken());
    const endpoint = voteType === 'UP' ? 'up' : 'down';
    const response = await apiClient.post(`/comments/${commentId}/votes/${endpoint}`);
    
    console.log(`Comment ${voteType}voted successfully`);
    return response.data;
  } catch (error) {
    console.error('Failed to vote on comment:', error);
    return null;
  }
},

// Remove vote from comment
removeCommentVote: async (commentId: string) => {
  const { user } = useAuthStore.getState();
  if (!user) return;

  try {
    setAuthHeader(getAccessToken());
    await apiClient.delete(`/comments/${commentId}/votes`);
    
    console.log('Comment vote removed successfully');
  } catch (error) {
    console.error('Failed to remove comment vote:', error);
  }
},

// Get user's vote on comment
getCommentVote: async (commentId: string) => {
  const { user } = useAuthStore.getState();
  if (!user) return null;

  try {
    setAuthHeader(getAccessToken());
    const response = await apiClient.get(`/comments/${commentId}/votes/my-vote`);
    return response.data.voteType;
  } catch (error) {
    console.error('Failed to get comment vote:', error);
    return null;
  }
},

      // Delete comment
      deleteComment: async (commentId: string, poemId: string) => {
        const { user } = useAuthStore.getState();
        if (!user) return;

        try {
          setAuthHeader(getAccessToken());
          await apiClient.delete(`/poems/${poemId}/comments/${commentId}`);

          // Update local state optimistically
          const { searchResults, trendingPoems, recentPoems } = get();

          const updatePoemInArray = (poems: Poem[]) =>
            poems.map((poem) =>
              poem.id === poemId
                ? { ...poem, comments: Math.max(0, (poem.comments || 0) - 1) }
                : poem
            );

          set({
            searchResults: searchResults
              ? {
                  ...searchResults,
                  poems: updatePoemInArray(searchResults.poems),
                }
              : null,
            trendingPoems: updatePoemInArray(trendingPoems),
            recentPoems: updatePoemInArray(recentPoems),
          });

          console.log("Comment deleted successfully");
        } catch (error) {
          console.error("Failed to delete comment:", error);
        }
      },

      // Increment poem views - New method
      incrementViews: async (poemId: string) => {
        try {
          setAuthHeader(getAccessToken());
          await apiClient.post(`/poems/${poemId}/views`);

          // Update local state optimistically
          const { searchResults, trendingPoems, recentPoems } = get();

          const updatePoemInArray = (poems: Poem[]) =>
            poems.map((poem) =>
              poem.id === poemId
                ? { ...poem, views: (poem.views || 0) + 1 }
                : poem
            );

          set({
            searchResults: searchResults
              ? {
                  ...searchResults,
                  poems: updatePoemInArray(searchResults.poems),
                }
              : null,
            trendingPoems: updatePoemInArray(trendingPoems),
            recentPoems: updatePoemInArray(recentPoems),
          });
        } catch (error) {
          console.error("Failed to increment views:", error);
        }
      },
    }),
    {
      name: "discovery-store",
    }
  )
);
