// hooks/useAuth.ts
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store/auth-store';
import { usePersistedAuthStore } from '@/lib/store/persisted-auth-store';

export const useAuth = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const authStore = useAuthStore();

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        const persisted = usePersistedAuthStore.getState();
        
        console.log('🔧 Auth initialization started:', {
          hasPersistedUser: !!persisted?.user,
          persistedAuth: persisted?.isAuthenticated,
          currentUser: useAuthStore.getState().user
        });
        
        // Only initialize if we have persisted auth data
        if (persisted?.isAuthenticated && persisted?.user) {
          console.log('✅ Restoring auth from persisted store:', persisted.user.username);
          
          // CRITICAL: Set both user AND isAuthenticated together
          useAuthStore.setState({
            user: persisted.user,
            isAuthenticated: true, // Must set together with user
            isLoading: false,
            error: null,
          });

          // Verify the session is still valid
          try {
            await useAuthStore.getState().getCurrentUser();
            console.log('✅ Session validated successfully');
          } catch (error) {
            console.warn('⚠️ Session validation failed, attempting refresh:', error);
            
            // Try to refresh the token
            try {
              await useAuthStore.getState().refreshToken();
              // After refresh, try to get current user again
              await useAuthStore.getState().getCurrentUser();
              console.log('✅ Session refreshed successfully');
            } catch (refreshError) {
              console.error('❌ Token refresh failed, clearing auth state:', refreshError);
              // Only clear if both getCurrentUser AND refresh fail
              useAuthStore.getState().resetAuthState();
            }
          }
        } else {
          console.log('ℹ️ No persisted auth data found');
          // Make sure state is clean if no persisted data
          useAuthStore.setState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      } catch (error) {
        console.error('❌ Auth initialization error:', error);
      } finally {
        if (mounted) {
          setIsInitialized(true);
          console.log('🏁 Auth initialization complete');
        }
      }
    };

    initAuth();

    return () => {
      mounted = false;
    };
  }, []);

  // Subscribe to auth store changes to detect unexpected clears
  useEffect(() => {
  if (!isInitialized) return;

  // Small delay before checking auth consistency (wait for page load/hydration)
  const timeout = setTimeout(() => {
    const unsubscribe = useAuthStore.subscribe((state, prevState) => {
      // Detect if user was cleared but isAuthenticated is still true (INCONSISTENT STATE)
      if (
        state.isAuthenticated && 
        !state.user && 
        !state.isLoading
      ) {
        console.error('🚨 INCONSISTENT STATE DETECTED: isAuthenticated=true but user=undefined');
        
        const persisted = usePersistedAuthStore.getState();
        if (persisted?.isAuthenticated && persisted?.user) {
          console.log('🔄 Restoring consistent state from persisted store');
          useAuthStore.setState({
            user: persisted.user,
            isAuthenticated: true,
            error: null,
          });
        } else {
          console.log('🔄 Fixing inconsistent state by setting isAuthenticated=false');
          useAuthStore.setState({
            user: null,
            isAuthenticated: false,
          });
        }
      }
      
      // Detect if auth state was unexpectedly cleared (both user and isAuthenticated)
      if (
        prevState.isAuthenticated && 
        !state.isAuthenticated && 
        !state.isLoading
      ) {
        console.warn('⚠️ Auth state was cleared, checking persisted store...');
        
        const persisted = usePersistedAuthStore.getState();
        if (persisted?.isAuthenticated && persisted?.user) {
          console.log('🔄 Restoring from persisted store after unexpected clear');
          useAuthStore.setState({
            user: persisted.user,
            isAuthenticated: true,
          });
        }
      }
    });

    // Cleanup when unmounted or re-run
    return () => unsubscribe();
  }, 5000); // wait ~0.8s before subscribing

  // Cleanup timeout if component unmounts early
  return () => clearTimeout(timeout);
}, [isInitialized]);


  return {
    ...authStore,
    isInitialized,
  };
};