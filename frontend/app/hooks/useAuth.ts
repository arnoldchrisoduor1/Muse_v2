import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store/auth-store';
import { usePersistedAuthStore } from '@/lib/store/persisted-auth-store';

export const useAuth = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const authStore = useAuthStore();
  const persistedStore = usePersistedAuthStore();

  useEffect(() => {
    // Sync persisted state to auth store on mount
    if (!isInitialized && persistedStore.isAuthenticated) {
      useAuthStore.setState({
        user: persistedStore.user,
        isAuthenticated: persistedStore.isAuthenticated,
      });
    }
    setIsInitialized(true);
  }, [isInitialized, persistedStore]);

  return {
    ...authStore,
    isInitialized,
  };
};