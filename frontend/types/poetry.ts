// Base User Interface
export interface User {
  id: string;
  username: string;
  address: string;
  avatar?: string;
  joinedAt: Date;
}

// Base Poem Interface
export interface PoemBase {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt?: Date;
  title?: string;
  tags?: string[];
  language?: string;
}

// Extended Poem Interface with all properties
export interface Poem extends PoemBase {
  author: User | string; // string for anonymous authors
  nftId?: string;
  isAnonymous?: boolean;
  parentId?: string; // For derivative works
  inspirationChain?: string[]; // Array of poem IDs that inspired this one
}

// Collective Consciousness Specific Types
export interface CollectivePoem extends Poem {
  query: string;
  trainingDataCount: number;
  treasuryContribution: number;
  modelVersion: string;
  confidenceScore: number;
}

// Collaborative Poem Specific Types
export interface Collaborator {
  userId: string;
  username: string;
  share: number;
  contributionType?: 'writing' | 'editing' | 'concept' | 'structure';
  joinedAt: Date;
}

export interface CollaborativePoem extends Poem {
  collaborators: Collaborator[];
  totalRevenue: number;
  revenueDistributed: boolean;
  derivativeWorks?: string[]; // Array of derivative poem IDs
  licenseType?: 'CC-BY' | 'CC-BY-SA' | 'Commercial';
}

// Anonymous Poem Specific Types
export interface ZKProof {
  commitment: string;
  nullifier: string;
  verified: boolean;
  poemId: string;
  generatedAt: Date;
  circuitId?: string; // Which ZK circuit was used
}

export interface AnonymousPoem extends Poem {
  author: 'Anonymous';
  isAnonymous: true;
  zkProof: ZKProof;
  canReveal?: boolean; // Whether author can reveal identity later
  revealDeadline?: Date; // Deadline for identity revelation
}

// Poem Statistics
export interface PoemStats {
  wordCount: number;
  lineCount: number;
  characterCount: number;
  sentiment: 'joy' | 'sadness' | 'anger' | 'fear' | 'surprise' | 'love' | 'contemplative' | 'neutral';
  theme: string[];
  readabilityScore?: number;
  emotionalIntensity?: number;
}

// Extended Poem with Stats
export interface PoemWithStats extends Poem {
  stats: PoemStats;
}

// Platform State Types
export interface PoetryPlatformState {
  activeTab: 'collective' | 'fractional' | 'anonymous';
  generatedPoem: CollectivePoem | null;
  collaborators: Collaborator[];
  zkProof: ZKProof | null;
  isLoading: boolean;
  anonymousPoems: AnonymousPoem[];
  userPoems: Poem[];
  collectiveStats: CollectiveStats;
}

export interface CollectiveStats {
  totalPoems: number;
  totalQueries: number;
  treasuryBalance: number;
  activeUsers: number;
  modelAccuracy: number;
  poemsToday: number;
}

// API Request/Response Types
export interface QueryCollectiveRequest {
  query: string;
  creativity?: number; // 0-1 scale
  style?: 'traditional' | 'modern' | 'experimental';
  length?: 'short' | 'medium' | 'long';
}

export interface QueryCollectiveResponse {
  poem: CollectivePoem;
  similarPoems?: Poem[];
  suggestedQueries?: string[];
}

export interface CreateCollaborativeRequest {
  content: string;
  collaborators: Omit<Collaborator, 'joinedAt'>[]; // joinedAt is set server-side
  title?: string;
  tags?: string[];
  licenseType?: CollaborativePoem['licenseType'];
}

export interface CreateCollaborativeResponse {
  poem: CollaborativePoem;
  transactionHash?: string;
  gasUsed?: number;
}

export interface CreateAnonymousRequest {
  content: string;
  title?: string;
  tags?: string[];
  canReveal?: boolean;
  revealDeadline?: Date;
}

export interface CreateAnonymousResponse {
  poem: AnonymousPoem;
  proof: ZKProof;
  warning?: string; // e.g., "Remember to save your proof securely"
}

// ZK Proof Operations
export interface ZKProofOperations {
  generateProof(poemId: string, privateKey: string): Promise<ZKProof>;
  verifyProof(proof: ZKProof): Promise<boolean>;
  revealIdentity(proof: ZKProof, privateKey: string): Promise<User>;
  claimRoyalties(proof: ZKProof): Promise<{ success: boolean; amount: number }>;
}

// NFT and Blockchain Types
export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes: {
    trait_type: string;
    value: string | number;
  }[];
  external_url?: string;
  animation_url?: string;
}

export interface BlockchainTransaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  gasUsed: number;
  status: 'pending' | 'success' | 'failed';
  timestamp: Date;
  blockNumber?: number;
}

// Revenue and Royalty Types
export interface RevenueDistribution {
  poemId: string;
  totalRevenue: number;
  distributions: {
    userId: string;
    username: string;
    share: number;
    amount: number;
    paid: boolean;
    paymentTxHash?: string;
  }[];
  distributionDate: Date;
}

export interface RoyaltyClaim {
  proof: ZKProof;
  poemId: string;
  amount: number;
  claimedAt: Date;
  transactionHash?: string;
}

// DAO and Governance Types
export interface DAOProposal {
  id: string;
  title: string;
  description: string;
  proposer: User;
  createdAt: Date;
  votingDeadline: Date;
  votes: {
    for: number;
    against: number;
    abstain: number;
  };
  status: 'active' | 'passed' | 'rejected' | 'executed';
  type: 'funding' | 'parameter' | 'upgrade' | 'community';
}

export interface GrantApplication {
  id: string;
  applicant: User;
  title: string;
  description: string;
  requestedAmount: number;
  poemSamples?: Poem[];
  status: 'pending' | 'approved' | 'rejected' | 'funded';
  createdAt: Date;
}

// Search and Filter Types
export interface PoemFilters {
  author?: string;
  tags?: string[];
  dateRange?: {
    from: Date;
    to: Date;
  };
  minWords?: number;
  maxWords?: number;
  sentiment?: PoemStats['sentiment'][];
  theme?: string[];
  isAnonymous?: boolean;
  hasDerivatives?: boolean;
}

export interface SearchResults {
  poems: Poem[];
  total: number;
  page: number;
  totalPages: number;
  filters: PoemFilters;
}

// Event Types
export interface PoemEvent {
  type: 'created' | 'updated' | 'derived' | 'purchased' | 'liked' | 'shared';
  poemId: string;
  userId?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface PlatformAnalytics {
  dailyActiveUsers: number;
  poemsCreated: number;
  revenueGenerated: number;
  popularThemes: string[];
  userRetention: number;
}

// Store Action Types
export interface CreateAnonymousPoemOptions {
  simulateError?: boolean;
  delay?: number;
  customProof?: Partial<ZKProof>;
  canReveal?: boolean;
  revealDeadline?: Date;
}

export interface CreateAnonymousPoemResult {
  success: boolean;
  poem?: AnonymousPoem;
  proof?: ZKProof;
  error?: string;
  warning?: string;
}

// Form Validation Types
export interface PoemValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  stats?: PoemStats;
}

// Export all types
export type {
  // Re-export for convenience
  User as Poet,
  Poem as Poetry,
  CollectivePoem as AIGeneratedPoem,
  CollaborativePoem as SharedPoem,
  AnonymousPoem as PrivatePoem,
};