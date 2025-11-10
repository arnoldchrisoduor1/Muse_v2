// lib/store/solo-poet-store.ts
import { create } from "zustand";
import { devtools } from "zustand/middleware";

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
  generateAIFeedback: (content: string) => Promise<void>;
  publishPoem: (draft: PoemDraft) => Promise<void>;
  loadDrafts: () => Promise<void>;
  deleteDraft: (id: string) => void;
}

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

    // Save draft
    saveDraft: async () => {
      const { currentDraft, drafts } = get();
      if (!currentDraft) return;

      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const existingIndex = drafts.findIndex(d => d.id === currentDraft.id);
      const updatedDrafts = existingIndex >= 0 
        ? drafts.map((d, i) => i === existingIndex ? currentDraft : d)
        : [...drafts, currentDraft];

      set({ drafts: updatedDrafts });
    },

    // Generate AI Feedback
    generateAIFeedback: async (content: string) => {
      set({ isGeneratingFeedback: true });
      
      // Mock AI API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockSuggestions: AISuggestion[] = [
        {
          id: '1',
          type: 'imagery',
          original: content.slice(0, 50) + '...',
          suggestion: 'Consider adding sensory details to strengthen the imagery',
          reasoning: 'Stronger imagery can make the poem more immersive',
          applied: false,
        },
        {
          id: '2',
          type: 'rhythm',
          original: content.slice(50, 100) + '...',
          suggestion: 'Try varying line lengths for better rhythm',
          reasoning: 'Rhythmic variation can enhance emotional impact',
          applied: false,
        }
      ];

      const mockScore = Math.floor(Math.random() * 30) + 60; // 60-90

      set({ 
        aiSuggestions: mockSuggestions,
        qualityScore: mockScore,
        isGeneratingFeedback: false,
      });

      // Update current draft if exists
      const { currentDraft } = get();
      if (currentDraft) {
        set({
          currentDraft: {
            ...currentDraft,
            qualityScore: mockScore,
            aiSuggestions: mockSuggestions,
          }
        });
      }
    },

    // Publish Poem
    publishPoem: async (draft: PoemDraft) => {
      set({ isPublishing: true });
      
      // Mock publishing process
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const publishedPoem = {
        // id: `poem_${Date.now()}`,
        ...draft,
        publishedAt: new Date(),
        nftTokenId: `nft_${Math.random().toString(36).substr(2, 9)}`,
        views: 0,
        likes: 0,
        comments: 0,
      };

      // Remove from drafts
      const { drafts } = get();
      const updatedDrafts = drafts.filter(d => d.id !== draft.id);
      
      set({
        publishedPoem,
        drafts: updatedDrafts,
        currentDraft: null,
        isPublishing: false,
      });
    },

    // Load drafts (mock)
    loadDrafts: async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
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
      
      set({ drafts: mockDrafts });
    },

    // Delete draft
    deleteDraft: (id: string) => {
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