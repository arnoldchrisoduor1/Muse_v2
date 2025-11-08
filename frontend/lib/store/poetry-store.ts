import { create } from "zustand";
import { devtools } from "zustand/middleware";
import {
  PoetryPlatformState,
  Collaborator,
  CollectivePoem,
  ZKProof,
} from "@/types/poetry";

interface PoetryStore extends PoetryPlatformState {
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
}

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
    createAnonymousPoem: async (content: string) => {
        set({ isLoading: true });
        
        // Simulating ZK proof generation
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const mockProof: ZKProof = {
          commitment: '0x' + Array(64).fill(0).map(() => 
            Math.floor(Math.random() * 16).toString(16)).join(''),
          nullifier: '0x' + Array(64).fill(0).map(() => 
            Math.floor(Math.random() * 16).toString(16)).join(''),
          verified: true,
          poemId: Date.now().toString(),
        };

        set({ zkProof: mockProof, isLoading: false });
      },
  }))
);
