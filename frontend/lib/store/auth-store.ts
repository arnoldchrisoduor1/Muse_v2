import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface User {
  id: string;
  email: string;
  username: string;
  walletAddress?: string;
  avatarUrl?: string;
  isAnonymous: boolean;
  createdAt: Date;
}

interface AuthState {
  // Current user state
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Auth methods state
  isSigningIn: boolean;
  isSigningUp: boolean;
  isSigningInWithGoogle: boolean;
  isCreatingAnonymous: boolean;
  
  // Errors
  error: string | null;
  
  // Actions
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  createAnonymousSession: () => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
  resetAuthState: () => void;
}

export const useAuthStore = create<AuthState>()(
  devtools((set, get) => ({
    // Initial State
    user: null,
    isAuthenticated: false,
    isLoading: false,
    isSigningIn: false,
    isSigningUp: false,
    isSigningInWithGoogle: false,
    isCreatingAnonymous: false,
    error: null,

    // Sign Up with Email/Password
    signUp: async (email: string, password: string, username: string) => {
      set({ isSigningUp: true, error: null });
      
      try {
        // Mock API call - replace with real backend
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Simulate validation
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters');
        }
        
        if (username.length < 3) {
          throw new Error('Username must be at least 3 characters');
        }
        
        const newUser: User = {
          id: `user_${Date.now()}`,
          email,
          username,
          isAnonymous: false,
          createdAt: new Date(),
        };
        
        set({ 
          user: newUser,
          isAuthenticated: true,
          isSigningUp: false,
          error: null
        });
        
        // Simulate redirect or token storage
        console.log('User signed up:', newUser);
        
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : 'Sign up failed',
          isSigningUp: false 
        });
      }
    },

    // Sign In with Email/Password
    signIn: async (email: string, password: string) => {
      set({ isSigningIn: true, error: null });
      
      try {
        // Mock API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Simulate authentication
        if (email === 'demo@collectivepoetry.xyz' && password === 'demo123') {
          const user: User = {
            id: 'user_demo',
            email,
            username: 'demo_poet',
            isAnonymous: false,
            createdAt: new Date(),
          };
          
          set({ 
            user,
            isAuthenticated: true,
            isSigningIn: false,
            error: null
          });
        } else {
          throw new Error('Invalid email or password');
        }
        
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : 'Sign in failed',
          isSigningIn: false 
        });
      }
    },

    // Sign In with Google
    signInWithGoogle: async () => {
      set({ isSigningInWithGoogle: true, error: null });
      
      try {
        // Mock Google OAuth flow
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const user: User = {
          id: `user_google_${Date.now()}`,
          email: 'googleuser@collectivepoetry.xyz',
          username: 'google_poet',
          isAnonymous: false,
          createdAt: new Date(),
        };
        
        set({ 
          user,
          isAuthenticated: true,
          isSigningInWithGoogle: false,
          error: null
        });
        
      } catch (error) {
        set({ 
          error: 'Google sign in failed',
          isSigningInWithGoogle: false 
        });
      }
    },

    // Create Anonymous Session
    createAnonymousSession: async () => {
      set({ isCreatingAnonymous: true, error: null });
      
      try {
        // Mock anonymous session creation
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Generate random anonymous user data
        const randomId = Math.random().toString(36).substring(7);
        const anonymousUser: User = {
          id: `anon_${randomId}`,
          email: `anon_${randomId}@session.collectivepoetry.xyz`,
          username: `anonymous_${randomId.substring(0, 6)}`,
          isAnonymous: true,
          createdAt: new Date(),
        };
        
        set({ 
          user: anonymousUser,
          isAuthenticated: true,
          isCreatingAnonymous: false,
          error: null
        });
        
        console.log('Anonymous session created:', anonymousUser);
        
      } catch (error) {
        set({ 
          error: 'Failed to create anonymous session',
          isCreatingAnonymous: false 
        });
      }
    },

    // Sign Out
    signOut: async () => {
      set({ isLoading: true });
      
      try {
        // Mock sign out process
        await new Promise(resolve => setTimeout(resolve, 500));
        
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null
        });
        
      } catch (error) {
        set({ 
          error: 'Sign out failed',
          isLoading: false 
        });
      }
    },

    // Clear errors
    clearError: () => {
      set({ error: null });
    },

    // Reset auth state
    resetAuthState: () => {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        isSigningIn: false,
        isSigningUp: false,
        isSigningInWithGoogle: false,
        isCreatingAnonymous: false,
        error: null,
      });
    },
  }), {
    name: 'auth-store',
  })
);