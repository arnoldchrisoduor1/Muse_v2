import { Poem, CollectivePoem, CollaborativePoem, AnonymousPoem, PoemFilters } from './poetry';

// Type guards
export const isCollectivePoem = (poem: Poem): poem is CollectivePoem => {
  return 'query' in poem && 'trainingDataCount' in poem;
};

export const isCollaborativePoem = (poem: Poem): poem is CollaborativePoem => {
  return 'collaborators' in poem && Array.isArray((poem as CollaborativePoem).collaborators);
};

export const isAnonymousPoem = (poem: Poem): poem is AnonymousPoem => {
  return poem.isAnonymous === true && 'zkProof' in poem;
};

// Type predicates for filtering
export const filterCollectivePoems = (poems: Poem[]): CollectivePoem[] => {
  return poems.filter(isCollectivePoem);
};

export const filterCollaborativePoems = (poems: Poem[]): CollaborativePoem[] => {
  return poems.filter(isCollaborativePoem);
};

export const filterAnonymousPoems = (poems: Poem[]): AnonymousPoem[] => {
  return poems.filter(isAnonymousPoem);
};

// Helper types for component props
export type PoemType = 'collective' | 'collaborative' | 'anonymous' | 'standard';

export interface PoemCardProps {
  poem: Poem;
  showAuthor?: boolean;
  showStats?: boolean;
  interactive?: boolean;
  onSelect?: (poem: Poem) => void;
  onDerive?: (poem: Poem) => void;
}

export interface PoemListProps {
  poems: Poem[];
  loading?: boolean;
  emptyMessage?: string;
  filters?: Partial<PoemFilters>;
  onFiltersChange?: (filters: PoemFilters) => void;
}

// API response wrapper
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: Date;
}

// Pagination types
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}