import { 
  PoetryPlatformState, 
  Poem, 
  CollectivePoem, 
  CollaborativePoem, 
  AnonymousPoem,
  ZKProof,
  Collaborator,
  CreateAnonymousPoemOptions,
  CreateAnonymousPoemResult 
} from '@/types/poetry';

export interface PoetryStoreActions {
  // Tab Management
  setActiveTab: (tab: PoetryPlatformState['activeTab']) => void;
  
  // Collective Consciousness
  queryCollective: (query: string, options?: Partial<{
    creativity: number;
    style: string;
    length: string;
  }>) => Promise<void>;
  clearGeneratedPoem: () => void;
  
  // Fractional Ownership
  setCollaborators: (collaborators: Collaborator[]) => void;
  updateCollaboratorShare: (userId: string, share: number) => void;
  addCollaborator: (collaborator: Omit<Collaborator, 'joinedAt'>) => void;
  removeCollaborator: (userId: string) => void;
  createCollaborativePoem: (content: string, title?: string) => Promise<void>;
  
  // Anonymous Proof
  createAnonymousPoem: (
    content: string, 
    options?: CreateAnonymousPoemOptions
  ) => Promise<CreateAnonymousPoemResult>;
  validateZKProof: (proof: ZKProof) => boolean;
  clearZKProof: () => void;
  
  // Test Utilities
  generateTestAnonymousPoems: (count: number) => Promise<void>;
  clearAnonymousPoems: () => void;
  clearAllTestData: () => void;
  
  // General
  setIsLoading: (loading: boolean) => void;
  resetStore: () => void;
}

export type PoetryStore = PoetryPlatformState & PoetryStoreActions;

// Selector types for optimized re-renders
export interface PoetryStoreSelectors {
  useActiveTab: () => PoetryPlatformState['activeTab'];
  useGeneratedPoem: () => CollectivePoem | null;
  useCollaborators: () => Collaborator[];
  useZKProof: () => ZKProof | null;
  useIsLoading: () => boolean;
  useAnonymousPoems: () => AnonymousPoem[];
  useCollectiveStats: () => PoetryPlatformState['collectiveStats'];
}

// Middleware types
export interface StoreMiddleware {
  onPoemCreated?: (poem: Poem) => void;
  onError?: (error: Error, context: string) => void;
  onTabChange?: (from: string, to: string) => void;
}