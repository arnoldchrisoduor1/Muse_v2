import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface CollectiveQuery {
  id: string;
  question: string;
  response: string;
  createdAt: Date;
  nftTokenId: string | null;
  likes: number;
  qualityRating: number;
  isPublic: boolean;
  queriedBy: string | null;
}

interface CollectiveState {
  // Current query state
  currentQuery: string;
  generatedResponse: CollectiveQuery | null;
  isGenerating: boolean;
  
  // History and stats
  queryHistory: CollectiveQuery[];
  collectiveStats: {
    totalQueries: number;
    poemsInTraining: number;
    daoTreasury: number;
    modelVersion: string;
    trainingProgress: number;
  };
  
  // Actions
  setCurrentQuery: (query: string) => void;
  queryCollective: (question: string) => Promise<void>;
  likeResponse: (queryId: string) => void;
  saveToCollection: (queryId: string) => Promise<void>;
  loadQueryHistory: () => Promise<void>;
  clearHistory: () => void;
}

export const useCollectiveStore = create<CollectiveState>()(
  devtools((set, get) => ({
    // Initial State
    currentQuery: '',
    generatedResponse: null,
    isGenerating: false,
    queryHistory: [],
    collectiveStats: {
      totalQueries: 1283,
      poemsInTraining: 2847,
      daoTreasury: 34.2,
      modelVersion: 'v2.1.4',
      trainingProgress: 87,
    },

    // Set current query
    setCurrentQuery: (query) => {
      set({ currentQuery: query });
    },

    // Query the collective
    queryCollective: async (question: string) => {
      set({ isGenerating: true, generatedResponse: null });

      // Mock API call to collective consciousness
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Mock responses based on query theme
      const responses = {
        love: `In the quiet spaces between heartbeats,
We find the echoes of a thousand loves,
Each poem a fingerprint of affection,
Written in the ink of shared experience.

The collective whispers of first glances,
Of hands that almost touched,
Of words that hung in silent air,
And the courage it takes to say "I care."`,

        hope: `Hope is the stubborn leaf in winter's grasp,
The single star that refuses to fade,
The collective breath held in anticipation,
Of dawn after the longest night.

We are the sum of all our maybes,
The architects of possible tomorrows,
Each poem a brick in the bridge
Between what is and what could be.`,

        technology: `In the humming silence of machines,
We search for the ghost in the machine,
The collective memory of analog warmth,
Digitized but never replaced.

Our poems are the human error codes,
The glitches in perfect systems,
Reminding the algorithms that somewhere,
A heart still beats in binary.`,

        default: `The collective breathes in metaphor,
Exhales in rhythm and in rhyme,
A thousand voices woven into one,
Across the tapestry of space and time.

We are the echoes in the digital canyon,
The whispers in the blockchain's heart,
Each poem a unique configuration,
Of the same eternal, human art.`
      };

      // Determine response type based on query
      let responseType: keyof typeof responses = 'default';
      const lowerQuestion = question.toLowerCase();
      
      if (lowerQuestion.includes('love') || lowerQuestion.includes('heart')) responseType = 'love';
      else if (lowerQuestion.includes('hope') || lowerQuestion.includes('future')) responseType = 'hope';
      else if (lowerQuestion.includes('tech') || lowerQuestion.includes('digital') || lowerQuestion.includes('machine')) responseType = 'technology';

      const newResponse: CollectiveQuery = {
        id: `collective_${Date.now()}`,
        question,
        response: responses[responseType],
        createdAt: new Date(),
        nftTokenId: `nft_collective_${Math.random().toString(36).substr(2, 9)}`,
        likes: Math.floor(Math.random() * 50),
        qualityRating: Math.floor(Math.random() * 2) + 4, // 4-5 stars
        isPublic: true,
        queriedBy: 'current_user', // Would be actual user ID
      };

      // Add to history
      const { queryHistory } = get();
      const updatedHistory = [newResponse, ...queryHistory.slice(0, 49)]; // Keep last 50

      set({
        generatedResponse: newResponse,
        queryHistory: updatedHistory,
        isGenerating: false,
        currentQuery: '',
      });
    },

    // Like a response
    likeResponse: (queryId: string) => {
      const { queryHistory, generatedResponse } = get();
      
      // Update in history
      const updatedHistory = queryHistory.map(query =>
        query.id === queryId ? { ...query, likes: query.likes + 1 } : query
      );
      
      // Update current response if it's the one being liked
      let updatedResponse = generatedResponse;
      if (generatedResponse?.id === queryId) {
        updatedResponse = { ...generatedResponse, likes: generatedResponse.likes + 1 };
      }

      set({
        queryHistory: updatedHistory,
        generatedResponse: updatedResponse,
      });
    },

    // Save to personal collection
    saveToCollection: async (queryId: string) => {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, this would add to user's collection
      console.log(`Saved collective response ${queryId} to collection`);
    },

    // Load query history
    loadQueryHistory: async () => {
      set({ isGenerating: true });
      
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      const mockHistory: CollectiveQuery[] = [
        {
          id: 'collective_1',
          question: 'What does silence sound like?',
          response: `Silence is the space between notes,
The breath before the word,
The collective hush of a thousand poets
Listening to the universe.`,
          createdAt: new Date(Date.now() - 86400000),
          nftTokenId: 'nft_abc123',
          likes: 23,
          qualityRating: 5,
          isPublic: true,
          queriedBy: 'user123',
        },
        {
          id: 'collective_2',
          question: 'How do we find beauty in chaos?',
          response: `Chaos is just pattern waiting to be read,
Beauty the unexpected symmetry,
The collective eye finding constellations
In the scattered stars of experience.`,
          createdAt: new Date(Date.now() - 172800000),
          nftTokenId: 'nft_def456',
          likes: 45,
          qualityRating: 4,
          isPublic: true,
          queriedBy: 'user456',
        }
      ];

      set({
        queryHistory: mockHistory,
        isGenerating: false,
      });
    },

    // Clear history
    clearHistory: () => {
      set({ queryHistory: [] });
    },
  }), {
    name: 'collective-store',
  })
);