import { create } from "zustand";
import { devtools } from "zustand/middleware";
import axios, { AxiosError, AxiosResponse, CancelTokenSource } from "axios";

// API Configuration
const API_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

// Constants
const REQUEST_TIMEOUT = 10000;
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 1000;
const TOKEN_REFRESH_BUFFER = 60000; // 1 minute before expiry

// Types
interface Tokens {
  accessToken: string;
  refreshToken: string;
  expiresAt?: number; // Timestamp when token expires
}

interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn?: number; // Seconds until expiry
}

interface ErrorResponse {
  message: string;
  error?: string;
  code?: string;
}

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
  // SINGLE SOURCE OF TRUTH - all auth data together
  user: User | null;
  isAuthenticated: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  tokenExpiresAt: number | null;
  
  // UI state
  isLoading: boolean;
  isSigningIn: boolean;
  isSigningUp: boolean;
  isSigningInWithGoogle: boolean;
  isCreatingAnonymous: boolean;
  error: string | null;
  
  // Internal flags
  isRefreshing: boolean; // Prevent concurrent refresh calls
  isInitialized: boolean;

  // Actions
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  createAnonymousSession: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshTokens: () => Promise<void>;
  initialize: () => Promise<void>;
  clearError: () => void;
}

// Create axios instance
const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api/v1/auth`,
  withCredentials: true,
  timeout: REQUEST_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
});

// Helper functions
const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return (
      axiosError.response?.data?.message ||
      axiosError.response?.data?.error ||
      axiosError.message ||
      "An unexpected error occurred"
    );
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "An unexpected error occurred";
};

const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

// Retry logic with exponential backoff
const executeWithRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = MAX_RETRY_ATTEMPTS
): Promise<T> => {
  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;

      // Don't retry on auth errors
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        if (status && [400, 401, 403, 404].includes(status)) {
          throw error;
        }
      }

      if (attempt < maxRetries) {
        const delayMs = RETRY_DELAY * Math.pow(2, attempt);
        await delay(delayMs);
      }
    }
  }
  throw lastError!;
};

// Calculate token expiry timestamp
const calculateExpiresAt = (expiresIn?: number): number | null => {
  if (!expiresIn) return null;
  return Date.now() + expiresIn * 1000;
};

// Check if token is expired or will expire soon
const isTokenExpired = (expiresAt: number | null): boolean => {
  if (!expiresAt) return false;
  return Date.now() >= expiresAt - TOKEN_REFRESH_BUFFER;
};

// Token refresh timeout
let refreshTimeout: NodeJS.Timeout | null = null;

// Schedule automatic token refresh
const scheduleTokenRefresh = (expiresAt: number | null): void => {
  if (refreshTimeout) {
    clearTimeout(refreshTimeout);
    refreshTimeout = null;
  }

  if (!expiresAt) return;

  const timeUntilRefresh = Math.max(
    expiresAt - Date.now() - TOKEN_REFRESH_BUFFER,
    30000 // Minimum 30 seconds
  );

  refreshTimeout = setTimeout(async () => {
    try {
      await useAuthStore.getState().refreshTokens();
    } catch (error) {
      console.error("Scheduled token refresh failed:", error);
      // Don't clear state here - let the user's next action trigger refresh
    }
  }, timeUntilRefresh);
};

// Request interceptor - Add token to requests
apiClient.interceptors.request.use(
  (config) => {
    const state = useAuthStore.getState();
    
    // Check if token is expired before making request
    if (state.accessToken && state.tokenExpiresAt) {
      if (isTokenExpired(state.tokenExpiresAt)) {
        // Token expired - trigger refresh before request
        console.log("Token expired, refreshing before request");
        return state.refreshTokens().then(() => {
          const newState = useAuthStore.getState();
          if (newState.accessToken) {
            config.headers.Authorization = `Bearer ${newState.accessToken}`;
          }
          return config;
        }).catch(() => {
          // Refresh failed - proceed with expired token (will get 401)
          return config;
        });
      }
    }
    
    if (state.accessToken && !config.headers["Authorization"]) {
      config.headers.Authorization = `Bearer ${state.accessToken}`;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Handle 401 with token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    // Handle 401 errors with token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const state = useAuthStore.getState();
      
      // Only attempt refresh if we have a refresh token
      if (state.refreshToken) {
        try {
          await state.refreshTokens();
          
          // Get new token and retry request
          const newState = useAuthStore.getState();
          if (newState.accessToken) {
            originalRequest.headers.Authorization = `Bearer ${newState.accessToken}`;
            return apiClient(originalRequest);
          }
        } catch (refreshError) {
          // Refresh failed - clear auth and reject
          console.error("Token refresh failed in interceptor:", refreshError);
          state.signOut();
          return Promise.reject(refreshError);
        }
      } else {
        // No refresh token - clear auth state
        state.signOut();
      }
    }

    return Promise.reject(error);
  }
);

export const useAuthStore = create<AuthState>()(
  devtools(
    (set, get) => ({
      // Initial State - ALL auth data starts as null
      user: null,
      isAuthenticated: false,
      accessToken: null,
      refreshToken: null,
      tokenExpiresAt: null,
      isLoading: false,
      isSigningIn: false,
      isSigningUp: false,
      isSigningInWithGoogle: false,
      isCreatingAnonymous: false,
      error: null,
      isRefreshing: false,
      isInitialized: false,

      // Initialize auth from persisted storage
      initialize: async () => {
        // Prevent multiple simultaneous initializations
        if (get().isInitialized || get().isLoading) {
          return;
        }

        set({ isLoading: true });

        try {
          // Try to load from localStorage
          const storedAuth = localStorage.getItem("auth_state");
          
          if (storedAuth) {
            const parsed = JSON.parse(storedAuth);
            
            // Validate we have required data
            if (parsed.user && parsed.refreshToken) {
              // Check if token is expired
              if (parsed.tokenExpiresAt && isTokenExpired(parsed.tokenExpiresAt)) {
                console.log("Stored token expired, refreshing...");
                
                // Set minimal state to enable refresh
                set({
                  refreshToken: parsed.refreshToken,
                  isAuthenticated: false,
                  user: null,
                });
                
                // Try to refresh
                try {
                  await get().refreshTokens();
                  // Success - state updated by refreshTokens
                } catch (error) {
                  console.error("Token refresh failed during init:", error);
                  // Clear invalid state
                  localStorage.removeItem("auth_state");
                  set({
                    user: null,
                    isAuthenticated: false,
                    accessToken: null,
                    refreshToken: null,
                    tokenExpiresAt: null,
                  });
                }
              } else {
                // Token still valid - restore full state
                set({
                  user: parsed.user,
                  isAuthenticated: true,
                  accessToken: parsed.accessToken,
                  refreshToken: parsed.refreshToken,
                  tokenExpiresAt: parsed.tokenExpiresAt,
                });
                
                // Schedule next refresh
                scheduleTokenRefresh(parsed.tokenExpiresAt);
              }
            } else {
              // Invalid stored data - clear it
              localStorage.removeItem("auth_state");
            }
          }
        } catch (error) {
          console.error("Auth initialization error:", error);
          localStorage.removeItem("auth_state");
        } finally {
          set({ isLoading: false, isInitialized: true });
        }
      },

      // Sign Up
      signUp: async (email: string, password: string, username: string) => {
        return executeWithRetry(async () => {
          set({ isSigningUp: true, error: null });

          try {
            const response: AxiosResponse<AuthResponse> = await apiClient.post(
              "/register",
              { email, password, username }
            );

            const { user, accessToken, refreshToken, expiresIn } = response.data;
            const tokenExpiresAt = calculateExpiresAt(expiresIn);

            // ATOMIC UPDATE - all auth data together
            const authState = {
              user,
              isAuthenticated: true,
              accessToken,
              refreshToken,
              tokenExpiresAt,
              isSigningUp: false,
              error: null,
            };

            set(authState);

            // Persist to localStorage
            localStorage.setItem("auth_state", JSON.stringify(authState));

            // Schedule token refresh
            scheduleTokenRefresh(tokenExpiresAt);

            // Redirect
            if (typeof window !== "undefined") {
              window.location.href = "/explore";
            }
          } catch (error) {
            const errorMsg = getErrorMessage(error);
            set({ error: errorMsg, isSigningUp: false });
            throw error;
          }
        });
      },

      // Sign In
      signIn: async (email: string, password: string) => {
        return executeWithRetry(async () => {
          set({ isSigningIn: true, error: null });

          try {
            const response: AxiosResponse<AuthResponse> = await apiClient.post(
              "/login",
              { email, password }
            );

            const { user, accessToken, refreshToken, expiresIn } = response.data;
            const tokenExpiresAt = calculateExpiresAt(expiresIn);

            // ATOMIC UPDATE
            const authState = {
              user,
              isAuthenticated: true,
              accessToken,
              refreshToken,
              tokenExpiresAt,
              isSigningIn: false,
              error: null,
            };

            set(authState);
            localStorage.setItem("auth_state", JSON.stringify(authState));
            scheduleTokenRefresh(tokenExpiresAt);

            if (typeof window !== "undefined") {
              window.location.href = "/explore";
            }
          } catch (error) {
            const errorMsg = getErrorMessage(error);
            set({ error: errorMsg, isSigningIn: false });
            throw error;
          }
        });
      },

      // Sign In with Google
      signInWithGoogle: async () => {
        return executeWithRetry(async () => {
          set({ isSigningInWithGoogle: true, error: null });

          try {
            const response: AxiosResponse<AuthResponse> = await apiClient.post(
              "/google",
              {}
            );

            const { user, accessToken, refreshToken, expiresIn } = response.data;
            const tokenExpiresAt = calculateExpiresAt(expiresIn);

            const authState = {
              user,
              isAuthenticated: true,
              accessToken,
              refreshToken,
              tokenExpiresAt,
              isSigningInWithGoogle: false,
              error: null,
            };

            set(authState);
            localStorage.setItem("auth_state", JSON.stringify(authState));
            scheduleTokenRefresh(tokenExpiresAt);
          } catch (error) {
            const errorMsg = getErrorMessage(error);
            set({ error: errorMsg, isSigningInWithGoogle: false });
            throw error;
          }
        });
      },

      // Create Anonymous Session
      createAnonymousSession: async () => {
        return executeWithRetry(async () => {
          set({ isCreatingAnonymous: true, error: null });

          try {
            const response: AxiosResponse<AuthResponse> = await apiClient.post(
              "/anonymous",
              {}
            );

            const { user, accessToken, refreshToken, expiresIn } = response.data;
            const tokenExpiresAt = calculateExpiresAt(expiresIn);

            const authState = {
              user,
              isAuthenticated: true,
              accessToken,
              refreshToken,
              tokenExpiresAt,
              isCreatingAnonymous: false,
              error: null,
            };

            set(authState);
            localStorage.setItem("auth_state", JSON.stringify(authState));
            scheduleTokenRefresh(tokenExpiresAt);
          } catch (error) {
            const errorMsg = getErrorMessage(error);
            set({ error: errorMsg, isCreatingAnonymous: false });
            throw error;
          }
        });
      },

      // Refresh Tokens
      refreshTokens: async () => {
        const state = get();
        
        // Prevent concurrent refresh calls
        if (state.isRefreshing) {
          console.log("Refresh already in progress, waiting...");
          // Wait for the ongoing refresh to complete
          return new Promise<void>((resolve, reject) => {
            const checkInterval = setInterval(() => {
              const currentState = get();
              if (!currentState.isRefreshing) {
                clearInterval(checkInterval);
                if (currentState.accessToken) {
                  resolve();
                } else {
                  reject(new Error("Refresh completed but no token available"));
                }
              }
            }, 100);
            
            // Timeout after 10 seconds
            setTimeout(() => {
              clearInterval(checkInterval);
              reject(new Error("Refresh timeout"));
            }, 10000);
          });
        }

        if (!state.refreshToken) {
          throw new Error("No refresh token available");
        }

        set({ isRefreshing: true });

        try {
          const response: AxiosResponse<{
            accessToken: string;
            refreshToken: string;
            expiresIn?: number;
          }> = await apiClient.post("/refresh", {
            refreshToken: state.refreshToken,
          });

          const { accessToken, refreshToken, expiresIn } = response.data;
          const tokenExpiresAt = calculateExpiresAt(expiresIn);

          // ATOMIC UPDATE - preserve user data
          const authState = {
            user: state.user,
            isAuthenticated: true,
            accessToken,
            refreshToken,
            tokenExpiresAt,
            isRefreshing: false,
            error: null,
          };

          set(authState);
          localStorage.setItem("auth_state", JSON.stringify(authState));
          scheduleTokenRefresh(tokenExpiresAt);

          console.log("Token refreshed successfully");
        } catch (error) {
          console.error("Token refresh failed:", error);
          
          // Clear auth state on refresh failure
          set({
            user: null,
            isAuthenticated: false,
            accessToken: null,
            refreshToken: null,
            tokenExpiresAt: null,
            isRefreshing: false,
            error: "Session expired. Please log in again.",
          });
          
          localStorage.removeItem("auth_state");
          
          if (refreshTimeout) {
            clearTimeout(refreshTimeout);
            refreshTimeout = null;
          }
          
          throw error;
        }
      },

      // Sign Out
      signOut: async () => {
        set({ isLoading: true });

        try {
          // Try to notify backend
          await apiClient.post("/logout").catch(() => {
            // Ignore backend errors on logout
          });
        } finally {
          // Always clear local state
          set({
            user: null,
            isAuthenticated: false,
            accessToken: null,
            refreshToken: null,
            tokenExpiresAt: null,
            isLoading: false,
            error: null,
          });

          localStorage.removeItem("auth_state");

          if (refreshTimeout) {
            clearTimeout(refreshTimeout);
            refreshTimeout = null;
          }

          // Redirect to login
          if (typeof window !== "undefined") {
            window.location.href = "/login";
          }
        }
      },

      // Clear errors
      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: "auth-store",
    }
  )
);

// Initialize auth on app load - SINGLE initialization point
if (typeof window !== "undefined") {
  useAuthStore.getState().initialize();
}