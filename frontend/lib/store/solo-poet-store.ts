import { create } from "zustand";
import { devtools } from "zustand/middleware";
import axios, { AxiosResponse } from "axios";
import { usePersistedAuthStore } from "./persisted-auth-store";

// --- INTERFACES ---

interface AISuggestion {
  id: string;
  type: 'word_choice' | 'rhythm' | 'imagery' | 'structure' | 'metaphor';
  original: string;
  suggestion: string;
  reasoning: string;
  applied: boolean;
}

interface PoemDraft {
  id: string;
  title: string;
  content: string;
  tags: string[];
  themes: string[];
  mood: string | null;
  licenseType: string;
  qualityScore: number | null;
  aiSuggestions: AISuggestion[];
  createdAt: Date;
  updatedAt: Date;
}

interface SoloPoetState {
  // Draft Management
  currentDraft: PoemDraft | null;
  drafts: PoemDraft[];

  // AI Features
  isGeneratingFeedback: boolean;
  aiSuggestions: AISuggestion[];
  qualityScore: number | null;

  // Publishing
  isPublishing: boolean;
  publishedPoem: any | null;

  // Actions
  createNewDraft: () => void;
  updateDraft: (updates: Partial<PoemDraft>) => void;
  saveDraft: () => Promise<void>;
  generateAIFeedback: () => Promise<void>; // CHANGED: No longer accepts 'content' argument
  publishPoem: (draft: PoemDraft) => Promise<void>;
  loadDrafts: () => Promise<void>;
  deleteDraft: (id: string) => void;
}

// --- API SETUP ---

// Use correct template literal syntax for environment variable
const POEMS_API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'

const poemsApiClient = axios.create({
  // FIX: Use template literal for base URL
  baseURL: `${POEMS_API_URL}/api/v1/poems`, 
  withCredentials: true,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Helper to get the access token from the persistent store
const getAccessToken = () => {
  const { accessToken } = usePersistedAuthStore.getState();
  return accessToken;
}

// Helper to set the Authorization header before an API call
const setAuthHeader = (token: string | null) => {
  if (token) {
    poemsApiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete poemsApiClient.defaults.headers.common['Authorization'];
  }
};

// --- MOCK DATA ---

const mockDrafts: PoemDraft[] = [
  {
    id: 'draft_1',
    title: 'Urban Echoes',
    content: 'The city breathes in neon sighs,\nConcrete canyons touch the skies,\nA million stories walk these streets,\nIn rhythm with a thousand beats.',
    tags: ['urban', 'modern', 'city'],
    themes: ['technology', 'society'],
    mood: 'contemplative',
    licenseType: 'all-rights-reserved',
    qualityScore: 72,
    aiSuggestions: [],
    createdAt: new Date(Date.now() - 86400000),
    updatedAt: new Date(Date.now() - 3600000),
  }
];


// --- ZUSTAND STORE IMPLEMENTATION ---

export const useSoloPoetStore = create<SoloPoetState>()(
  devtools((set, get) => ({
    // Initial State
    currentDraft: null,
    drafts: [],
    isGeneratingFeedback: false,
    aiSuggestions: [],
    qualityScore: null,
    isPublishing: false,
    publishedPoem: null,

    // Create new draft
    createNewDraft: () => {
      const newDraft: PoemDraft = {
        id: `draft_${Date.now()}`,
        title: '',
        content: '',
        tags: [],
        themes: [],
        mood: null,
        licenseType: 'all-rights-reserved',
        qualityScore: null,
        aiSuggestions: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      set({ currentDraft: newDraft });
    },

    // Update draft
    updateDraft: (updates) => {
      const { currentDraft } = get();
      if (currentDraft) {
        set({
          currentDraft: {
            ...currentDraft,
            ...updates,
            updatedAt: new Date(),
          }
        });
      }
    },

    // Save draft (Uses mock network delay and local update logic)
    saveDraft: async () => {
      const { currentDraft, drafts } = get();
      if (!currentDraft) return;

      setAuthHeader(getAccessToken());

      try {
        // --- Mock API Call (Replace with real API endpoint later) ---
        // const response = await poemsApiClient.post('/drafts/save', currentDraft);
        await new Promise(resolve => setTimeout(resolve, 500));
        // -----------------------------------------------------------

        const existingIndex = drafts.findIndex(d => d.id === currentDraft.id);
        const updatedDrafts = existingIndex >= 0
          ? drafts.map((d, i) => i === existingIndex ? currentDraft : d)
          : [...drafts, currentDraft];

        set({ drafts: updatedDrafts });
      } catch (error) {
        console.error("Failed to save draft:", error);
        // Handle error state if necessary
      }
    },

    // Generate AI Feedback (Now connected to real API)
    generateAIFeedback: async () => {
      const { currentDraft } = get();

      console.log("Making AI request with: ", currentDraft);

      if (!currentDraft || !currentDraft.content.trim()) {
        console.warn("Cannot generate feedback: current draft content is empty or missing.");
        set({ isGeneratingFeedback: false }); 
        return;
      }

      set({ isGeneratingFeedback: true });
      setAuthHeader(getAccessToken());

      try {
        // Prepare the DTO payload as required by the backend controller
        const payload = {
          title: currentDraft.title || 'Untitled Draft',
          content: currentDraft.content,
        };

        // --- Real API Call to /ai/feedback ---
        const response: AxiosResponse<any> = await poemsApiClient.post(
          '/feedback',
          payload
        );
        // -------------------------------------

        const apiData = response.data;

        console.log("response from AI feedback: ", apiData);
        
        // Map the backend suggestions array (apiData.suggestions) to the frontend AISuggestion interface
        const newSuggestions: AISuggestion[] = apiData.suggestions
          // Ensure we only process items that look like valid suggestions
          .filter((s: any) => s && s.suggestion) 
          .map((s: any, index: number) => ({
            id: s.id || `ai_sug_${currentDraft.id}_${index}`,
            type: s.type || 'word_choice', // Use backend type or default
            original: s.original || '',
            suggestion: s.suggestion || '',
            reasoning: s.reasoning || 'AI analysis provided this suggestion.',
            applied: false,
          }));

        const newScore = apiData.qualityScore;

        set({
          aiSuggestions: newSuggestions,
          qualityScore: newScore,
          isGeneratingFeedback: false,
        });

        // Update current draft
        set({
          currentDraft: {
            ...currentDraft,
            qualityScore: newScore,
            aiSuggestions: newSuggestions,
          }
        });
      } catch (error) {
        console.error("Failed to generate AI feedback:", axios.isAxiosError(error) ? error.response?.data : error);
        set({ isGeneratingFeedback: false });
      }
    },

    // Publish Poem (Uses mock network delay and local state update)
    publishPoem: async (draft: PoemDraft) => {
      set({ isPublishing: true });

      setAuthHeader(getAccessToken());

      try {
        // --- Mock API Call (Replace with real API endpoint later) ---
        // const response = await poemsApiClient.post('/publish', draft);
        await new Promise(resolve => setTimeout(resolve, 3000));
        // const publishedPoem = response.data.poem;
        // -----------------------------------------------------------

        const publishedPoem = {
          ...draft,
          publishedAt: new Date(),
          nftTokenId: `nft_${Math.random().toString(36).substr(2, 9)}`,
          views: 0,
          likes: 0,
          comments: 0,
        };

        // Remove from drafts locally
        const { drafts } = get();
        const updatedDrafts = drafts.filter(d => d.id !== draft.id);

        set({
          publishedPoem,
          drafts: updatedDrafts,
          currentDraft: null,
          isPublishing: false,
        });
      } catch (error) {
        console.error("Failed to publish poem:", error);
        set({ isPublishing: false });
      }
    },

    // Load drafts (Uses mock network delay and data)
    loadDrafts: async () => {
      setAuthHeader(getAccessToken());

      try {
        // --- Mock API Call (Replace with real API endpoint later) ---
        // const response = await poemsApiClient.get('/drafts');
        await new Promise(resolve => setTimeout(resolve, 1000));
        const mockResponse: PoemDraft[] = mockDrafts;
        // -----------------------------------------------------------

        set({ drafts: mockResponse });
      } catch (error) {
        console.error("Failed to load drafts:", error);
      }
    },

    // Delete draft (local only)
    deleteDraft: (id: string) => {
      // For a real app, you'd add an API call here:
      // poemsApiClient.delete(`/drafts/${id}`); 

      const { drafts, currentDraft } = get();
      const updatedDrafts = drafts.filter(d => d.id !== id);

      set({
        drafts: updatedDrafts,
        currentDraft: currentDraft?.id === id ? null : currentDraft,
      });
    },
  }), {
    name: 'solo-poet-store',
  })
);