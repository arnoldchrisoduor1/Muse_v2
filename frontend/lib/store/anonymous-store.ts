import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface ZKProof {
  commitment: string;
  nullifier: string;
  poemId: string;
  contentHash: string;
  timestamp: number;
  verified: boolean;
}

interface AnonymousPoem {
  id: string;
  content: string;
  title: string;
  createdAt: Date;
  publishedAt: Date | null;
  zkProof: ZKProof | null;
  nftTokenId: string | null;
  views: number;
  likes: number;
  earnings: number;
  isClaimed: boolean;
  claimedAt: Date | null;
}

interface AnonymousIdentity {
  id: string;
  publicKey: string;
  commitment: string;
  nullifierSeed: string;
  anonymousReputation: number;
  verifiedPoems: number;
  totalEarnings: number;
  createdAt: Date;
}

interface AnonymousState {
  // Current session
  currentPoem: Partial<AnonymousPoem>;
  generatedProof: ZKProof | null;
  isGeneratingProof: boolean;
  isPublishing: boolean;
  
  // User's anonymous identity
  anonymousIdentity: AnonymousIdentity | null;
  
  // Published poems (mock data for testing)
  publishedPoems: AnonymousPoem[];
  
  // Claiming state
  isClaiming: boolean;
  
  // Actions
  setCurrentPoem: (poem: Partial<AnonymousPoem>) => void;
  generateZKProof: (content: string, title: string) => Promise<ZKProof>;
  publishAnonymousPoem: (poem: AnonymousPoem) => Promise<void>;
  claimEarnings: (proof: ZKProof) => Promise<void>;
  verifyProof: (proof: ZKProof) => boolean;
  loadAnonymousIdentity: () => Promise<void>;
  clearCurrentPoem: () => void;
}

// Helper to generate mock cryptographic hashes
const generateHexHash = (length: number = 64): string => {
  return '0x' + Array.from({ length }, () => 
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
};

const generateContentHash = (content: string): string => {
  // Simulate content hashing
  return generateHexHash(64);
};

export const useAnonymousStore = create<AnonymousState>()(
  devtools((set, get) => ({
    // Initial State
    currentPoem: {},
    generatedProof: null,
    isGeneratingProof: false,
    isPublishing: false,
    anonymousIdentity: null,
    publishedPoems: [],
    isClaiming: false,

    // Set current poem
    setCurrentPoem: (poem) => {
      set((state) => ({
        currentPoem: { ...state.currentPoem, ...poem }
      }));
    },

    // Generate ZK Proof (simulated)
    generateZKProof: async (content: string, title: string): Promise<ZKProof> => {
      set({ isGeneratingProof: true });

      // Simulate complex ZK proof generation
      await new Promise(resolve => setTimeout(resolve, 2000));

      const poemId = `anonymous_${Date.now()}`;
      const contentHash = generateContentHash(content);
      
      const proof: ZKProof = {
        commitment: generateHexHash(64),
        nullifier: generateHexHash(64),
        poemId,
        contentHash,
        timestamp: Date.now(),
        verified: true,
      };

      set({ 
        generatedProof: proof,
        isGeneratingProof: false,
        currentPoem: {
          id: poemId,
          content,
          title,
          contentHash,
        }
      });

      return proof;
    },

    // Publish anonymous poem
    publishAnonymousPoem: async (poem: AnonymousPoem) => {
      set({ isPublishing: true });

      // Simulate blockchain publication
      await new Promise(resolve => setTimeout(resolve, 3000));

      const publishedPoem: AnonymousPoem = {
        ...poem,
        publishedAt: new Date(),
        nftTokenId: `zk_nft_${Math.random().toString(36).substr(2, 12)}`,
        views: 0,
        likes: 0,
        earnings: 0,
        isClaimed: false,
        claimedAt: null,
      };

      // Add to published poems (in real app, this would be on blockchain)
      set((state) => ({
        publishedPoems: [publishedPoem, ...state.publishedPoems],
        isPublishing: false,
        currentPoem: {},
        generatedProof: null,
      }));

      // Simulate poem going viral and earning money
      setTimeout(() => {
        set((state) => ({
          publishedPoems: state.publishedPoems.map(p => 
            p.id === publishedPoem.id 
              ? { 
                  ...p, 
                  views: Math.floor(Math.random() * 10000) + 5000,
                  likes: Math.floor(Math.random() * 500) + 100,
                  earnings: Math.random() * 10 + 2 // $2-12
                }
              : p
          )
        }));
      }, 5000);
    },

    // Claim earnings for anonymous poem
    claimEarnings: async (proof: ZKProof) => {
      set({ isClaiming: true });

      // Simulate blockchain claim process
      await new Promise(resolve => setTimeout(resolve, 2000));

      const { publishedPoems, anonymousIdentity } = get();
      
      const poemToClaim = publishedPoems.find(p => p.id === proof.poemId);
      if (poemToClaim && !poemToClaim.isClaimed) {
        const updatedPoems = publishedPoems.map(p =>
          p.id === proof.poemId
            ? { ...p, isClaimed: true, claimedAt: new Date() }
            : p
        );

        const updatedIdentity = anonymousIdentity ? {
          ...anonymousIdentity,
          totalEarnings: anonymousIdentity.totalEarnings + poemToClaim.earnings,
          verifiedPoems: anonymousIdentity.verifiedPoems + 1,
        } : null;

        set({
          publishedPoems: updatedPoems,
          anonymousIdentity: updatedIdentity,
          isClaiming: false,
        });
      }
    },

    // Verify ZK proof (simulated)
    verifyProof: (proof: ZKProof): boolean => {
      // Simulate proof verification
      return proof.commitment.startsWith('0x') && 
             proof.nullifier.startsWith('0x') &&
             proof.commitment.length === 66 &&
             proof.nullifier.length === 66;
    },

    // Load anonymous identity (simulated)
    loadAnonymousIdentity: async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockIdentity: AnonymousIdentity = {
        id: 'anon_123',
        publicKey: generateHexHash(64),
        commitment: generateHexHash(64),
        nullifierSeed: generateHexHash(32),
        anonymousReputation: 85,
        verifiedPoems: 3,
        totalEarnings: 24.67,
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      };

      // Mock published poems
      const mockPoems: AnonymousPoem[] = [
        {
          id: 'anon_poem_1',
          content: `Behind seven proxies and encrypted streams,
I pour my truth into digital dreams,
No name, no face, just words that burn,
Lessons that society needs to learn.

The blockchain bears my silent mark,
A revolution sparked in dark,
Ownership proved but identity veiled,
In zero-knowledge, my truth is hailed.`,
          title: 'The Emperor Has No Bytes',
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          zkProof: {
            commitment: generateHexHash(64),
            nullifier: generateHexHash(64),
            poemId: 'anon_poem_1',
            contentHash: generateContentHash('content1'),
            timestamp: Date.now() - 7 * 24 * 60 * 60 * 1000,
            verified: true,
          },
          nftTokenId: 'zk_nft_abc123',
          views: 12457,
          likes: 423,
          earnings: 8.45,
          isClaimed: true,
          claimedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        },
        {
          id: 'anon_poem_2',
          content: `In the silence of encrypted channels,
Where dissent flows like digital annals,
I plant my flag in cryptographic soil,
My identity the only thing I foil.

The state may watch with thousand eyes,
But cannot trace my poetic disguise,
For in this math, my safety lies,
Where only truth, not face, applies.`,
          title: 'Digital Dissident',
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          zkProof: {
            commitment: generateHexHash(64),
            nullifier: generateHexHash(64),
            poemId: 'anon_poem_2',
            contentHash: generateContentHash('content2'),
            timestamp: Date.now() - 3 * 24 * 60 * 60 * 1000,
            verified: true,
          },
          nftTokenId: 'zk_nft_def456',
          views: 8567,
          likes: 287,
          earnings: 5.23,
          isClaimed: false,
          claimedAt: null,
        }
      ];

      set({
        anonymousIdentity: mockIdentity,
        publishedPoems: mockPoems,
      });
    },

    // Clear current poem
    clearCurrentPoem: () => {
      set({ currentPoem: {}, generatedProof: null });
    },
  }), {
    name: 'anonymous-store',
  })
);