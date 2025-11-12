import { useAuthStore } from '@/lib/store/auth-store';

/**
 * Simplified auth hook - just passes through the store
 * No redundant initialization or monitoring logic
 */
export const useAuth = () => {
  return useAuthStore();
};