export interface User {
    id: string;
    username: string;
    address: string;
}

export interface Collaborator {
    userId: string;
    username: string;
    share: number;
}

export interface Poem {
    id: string;
    content: string;
    author: User | string;
    createdAt: Date;
    nftId?: string;
    isAnonymous?: boolean;
}

export interface CollectivePoem extends Poem {
    query: string;
    trainDataCount: number;
    treasuryContribution: number;
}

export interface CollaborativePoem extends Poem {
    collaborators: Collaborator[];
    totalRevenue: number;
}

export interface ZKProof {
    commitment: string;
    nullifier: string;
    verified: boolean;
    peomId: string;
}

export interface PoetryPlatformState {
  activeTab: 'collective' | 'fractional' | 'anonymous';
  generatedPoem: CollectivePoem | null;
  collaborators: Collaborator[];
  zkProof: ZKProof | null;
  isLoading: boolean;
}