import { create } from "zustand";
import { devtools } from "zustand/middleware";
import {
  PoetryPlatformState,
  Collaborator,
  CollectivePoem,
  ZKProof,
  Poem,
  AnonymousPoem,
  AIFeedbackResponse,
} from "@/types/poetry";
import axios,  { AxiosResponse } from "axios";
import { SquareArrowOutUpRight } from "lucide-react";
import { useAuthStore } from "./auth-store";

const POEMS_API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'

// ill now create an axios pattern.
const poemsApiClient = axios.create({
  baseURL: `{POEMS_API_URL}/api/v1/poems`,
  withCredentials: true,
  timeout: 1000,
  headers: {
    'Content-Type' : 'application/json',
  }
})

// to get the access token from te persistent store.
const getAccessToken = () => {
  const { accessToken } = useAuthStore();
  return accessToken;
}

interface PoetryStore extends PoetryPlatformState {

  draftAIFeedback: AIFeedbackResponse | null;
  anonymousPoems: AnonymousPoem[];
  
  // The actions
  setActiveTab: (tab: PoetryPlatformState["activeTab"]) => void;
  setGeneratedPoem: (poem: CollectivePoem | null) => void;
  setCollaborators: (collaborators: Collaborator[]) => void;
  updateCollaboratorShare: (userId: string, share: number) => void;
  setZkProof: (proof: ZKProof | null) => void;
  setIsLoading: (loading: boolean) => void;

  // Async Actions.
  queryCollective: (query: string) => Promise<void>;
  createCollaborativePoem: (content: string) => Promise<void>;
  createAnonymousePoem: (content: string) => Promise<void>;
  getDraftAIFeedback: (title: string, content: string) => Promise<AIFeedbackResponse | null>;
  clearDraftAIFeedback: () => void;

  
  // Enhanced Actions
  createAnonymousPoem: (content: string, options?: {
    simulateError?: boolean;
    delay?: number;
    customProof?: Partial<ZKProof>;
  }) => Promise<{
    success: boolean;
    poem?: Poem;
    proof?: ZKProof;
    error?: string;
  }>;
  
  // Test utilities
  generateTestAnonymousPoems: (count: number) => Promise<void>;
  clearAnonymousPoems: () => void;
  validateZKProof: (proof: ZKProof) => boolean;
}

const generateMockZKProof = (poemId: string): ZKProof => {
  const generateHex = (length: number) => 
    '0x' + Array(length).fill(0).map(() => 
      Math.floor(Math.random() * 16).toString(16)).join('');
  
  return {
    commitment: generateHex(64),
    nullifier: generateHex(64),
    verified: true,
    poemId,
    generatedAt: new Date(),
  };
};

const generateMockPoemContent = (): string => {
  const poems = [
    `In shadows deep where secrets sleep,
A voice emerges, promises to keep,
No name, no face, just words that flow,
In digital streams where truths can grow.

The blockchain bears my silent mark,
A spark of light within the dark,
Ownership proved but identity veiled,
In zero-knowledge, my truth is hailed.`,

    `Anonymous ink on digital scroll,
A hidden author, a secret soul,
Through circuits deep my verses race,
Leaving no fingerprint, no trace.

Yet in the math, my claim is sound,
On distributed ground my rights are bound,
A ghostly presence, forever free,
My poetry lives, though none see me.`,

    `Behind the mask of cryptography,
I weave my words for all to see,
No reputation, no past to bind,
Just pure expression of the mind.

The nullifier guards my single claim,
While ZK-proofs protect my name,
In this digital sanctuary,
My voice rings loud, yet I stay free.`,

    `Whispers etched in blockchain stone,
A poem born, yet left alone,
No author's pride, no ego's stain,
Just beauty rising from the pain.

The commitment hash my only key,
To prove what secretly belongs to me,
In this anonymous design,
Both ownership and privacy align.`
  ];
  
  return poems[Math.floor(Math.random() * poems.length)];
};

const generateMockPoemStats = () => ({
  wordCount: Math.floor(Math.random() * 100) + 50,
  lineCount: Math.floor(Math.random() * 20) + 8,
  sentiment: ['contemplative', 'emotional', 'revolutionary', 'personal', 'philosophical'][Math.floor(Math.random() * 5)],
  theme: ['identity', 'freedom', 'technology', 'love', 'society'][Math.floor(Math.random() * 5)],
});


export const usePoetryStore = create<PoetryStore>()(
  devtools((set, get) => ({
    // the initial state
    activeTab: "collective",
    generatedPoem: null,
    collaborators: [
      { userId: "1", username: "poet_alice", share: 60 },
      { userId: "2", username: "poet_bob", share: 30 },
      { userId: "3", username: "poet_carol", share: 10 },
    ],
    zkProof: null,
    isLoading: false,

    // nthe synchronous actions.
    setActiveTab: (tab) => set({ activeTab: tab }),
    setGeneratedPoem: (poem) => set({ generatedPoem: poem }),
    setCollaborators: (collaborators) => set({ collaborators }),
    setZkProof: (proof) => set({ zkProof: proof }),
    setIsLoading: (isLoading) => set({ isLoading }),

    updateCollaboratorShare: (userId, share) => {
      const { collaborators } = get();
      const updated = collaborators.map((collab) =>
        collab.userId == userId ? { ...collab, share } : collab
      );
      set({ collaborators: updated });
    },

    // Async actions.
    queryCollective: async (query: string) => {
      set({ isLoading: true, generatedPoem: null });

      // simulating the api call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const mockPoem: CollectivePoem = {
        id: Date.now().toString(),
        content: `In circuits deep where voices blend,
A thousand hearts that poems send,
We are the whisper, we are the cry,
The collective soul that cannot die.

Through screens of light and threads of code,
We carry each other's heaviest load,
In verses shared, in rhythms found,
We are the silence, we are the sound.`,
        author: "Collective Consciousness",
        createdAt: new Date(),
        query,
        trainingDataCount: 2847,
        treasuryContribution: 0.05,
        nftId: "12847",
        modelVersion: "v1.0.0",
        confidenceScore: 0.98,
      };
      set({ generatedPoem: mockPoem, isLoading: false });
    },

    createCollaborativePoem: async (content: string) => {
        const { collaborators } = get();
        const totalShare = collaborators.reduce((sum, c) => sum + c.share, 0);

        if (totalShare != 100) {
            throw new Error('Total share must equal 100%');
        }

        // TODO: CALL THE SMART CONTRACT.
        console.log('Creating fractional NFT with:', { content, collaborators });
        set ({ isLoading: false });
    },
     createAnonymousPoem: async (content: string, options = {}) => {
        const {
          simulateError = false,
          delay = 1500,
          customProof
        } = options;

        set({ isLoading: true, zkProof: null });

        try {
          // Simulate API call delay
          await new Promise(resolve => setTimeout(resolve, delay));

          // Simulate random errors for testing
          if (simulateError) {
            const errors = [
              'ZK proof generation failed: Insufficient entropy',
              'Nullifier collision detected',
              'Commitment verification timeout',
              'Blockchain network congestion',
              'Gas estimation failed'
            ];
            throw new Error(errors[Math.floor(Math.random() * errors.length)]);
          }

          // Validate content
          if (!content.trim()) {
            throw new Error('Poem content cannot be empty');
          }

          if (content.length < 50) {
            throw new Error('Poem must be at least 50 characters long');
          }

          if (content.length > 5000) {
            throw new Error('Poem cannot exceed 5000 characters');
          }

          const poemId = `anonymous_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          
          // Generate mock ZK proof
          const proof = customProof ? 
            { ...generateMockZKProof(poemId), ...customProof } : 
            generateMockZKProof(poemId);

          // Create anonymous poem record
          const anonymousPoem: AnonymousPoem = {
            id: poemId,
            content: content.trim(),
            author: 'Anonymous',
            createdAt: new Date(),
            isAnonymous: true,
            nftId: `zk_${Math.random().toString(36).substr(2, 16)}`,
            zkProof: proof,
            ...generateMockPoemStats()
          };

          // Update state
          set(state => ({
            zkProof: proof,
            isLoading: false,
            anonymousPoems: [anonymousPoem, ...state.anonymousPoems]
          }));

          return {
            success: true,
            poem: anonymousPoem,
            proof
          };

        } catch (error) {
          console.error('Anonymous poem creation failed:', error);
          set({ isLoading: false, zkProof: null });
          
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
          };
        }
      },

      // Test utility to generate multiple poems
      // Test utility to generate multiple poems
generateTestAnonymousPoems: async (count: number) => {
  set({ isLoading: true });

  const promises = Array.from({ length: count }, async (_, index) => {
    await new Promise(resolve => setTimeout(resolve, index * 200)); // Stagger requests

    const poemId = `test_${Date.now()}_${index}`;
    const proof = generateMockZKProof(poemId);

    // Build an AnonymousPoem to match types/poetry.AnonymousPoem
    const poem: AnonymousPoem = {
      id: poemId,
      content: generateMockPoemContent(),
      title: undefined,
      createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      updatedAt: undefined,
      author: 'Anonymous',
      isAnonymous: true,
      zkProof: proof,
      nftId: `test_zk_${Math.random().toString(36).substr(2, 16)}`,
      // optional fields from your AnonymousPoem shape — adapt if your type requires different keys
      canReveal: false,
      revealDeadline: undefined,
      // If your AnonymousPoem expects stats/metrics, include reasonable defaults or your generator
      // (remove or adjust the next line if those keys are not part of your AnonymousPoem interface)
      ...generateMockPoemStats()
    };

    return { poem, proof };
  });

  try {
    const results = await Promise.all(promises); // results: Array<{poem: AnonymousPoem, proof: ZKProof}>

    set(state => ({
      // set zkProof to the last generated proof (or null if none)
      zkProof: results.length ? results[results.length - 1].proof : null,
      isLoading: false,
      // prepend the generated poems to existing anonymousPoems
      anonymousPoems: [...results.map(r => r.poem), ...state.anonymousPoems]
    }));
  } catch (error) {
    console.error('Test poem generation failed:', error);
    set({ isLoading: false });
  }
},


      // Utility to clear test poems
      clearAnonymousPoems: () => set({ anonymousPoems: [] }),

      // Mock ZK proof validation
      validateZKProof: (proof: ZKProof) => {
        // Simulate ZK proof validation logic
        const isValid = 
          proof.commitment.startsWith('0x') && 
          proof.commitment.length === 66 && // 0x + 64 hex chars
          proof.nullifier.startsWith('0x') && 
          proof.nullifier.length === 66 &&
          proof.verified === true;

        return isValid;
      },
  }),
  {
    name: 'poetry-platform-state',
  }
)
);
