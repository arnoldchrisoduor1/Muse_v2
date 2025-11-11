import { create } from "zustand";
import { devtools } from "zustand/middleware";
import axios, { AxiosError, AxiosResponse, CancelTokenSource } from "axios";
import { usePersistedAuthStore } from './persisted-auth-store';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000/api/v1/auth';

// Constants
const TOKEN_REFRESH_INTERVAL = 10 * 60 * 1000; // 10 minutes
const REQUEST_TIMEOUT = 10000;
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 1000;

// Types for token management
interface Tokens {
  accessToken?: string;
  refreshToken?: string;
}

interface AuthResponse {
  user: User;
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number;
}

interface ErrorResponse {
  message: string;
  error?: string;
  code?: string;
}

interface PendingRequest {
  url: string;
  method: string;
  data?: any;
  resolve: (value: any) => void;
  reject: (error: any) => void;
  retryCount: number;
}


// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Use HTTP-only cookies
  timeout: REQUEST_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request cancellation
const cancelTokenSources = new Map<string, CancelTokenSource>();

// Offline queue
let isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
const pendingRequests: PendingRequest[] = [];

// Network status listener
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    isOnline = true;
    processPendingRequests();
  });
  window.addEventListener('offline', () => {
    isOnline = false;
  });
}

// Token refresh
let refreshTimeout: NodeJS.Timeout | null = null;

// User interface
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
  
  // System state
  isOnline: boolean;
  error: string | null;
  
  // Actions
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  createAnonymousSession: () => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
  resetAuthState: () => void;
  refreshToken: () => Promise<void>;
  getCurrentUser: () => Promise<void>;
  cancelRequest: (requestId: string) => void;
  setOnlineStatus: (status: boolean) => void;
  handleSuccessfulAuth: (user: User, tokens?: { accessToken?: string; refreshToken?: string }) => void;
}

// Helper functions
const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return axiosError.response?.data?.message || 
           axiosError.response?.data?.error || 
           axiosError.message || 
           'An unexpected error occurred';
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unexpected error occurred';
};

// Sync function between stores
const syncAuthState = (user: User | null, isAuthenticated: boolean, tokens?: { accessToken?: string; refreshToken?: string }) => {
  usePersistedAuthStore.setState({
    user,
    isAuthenticated,
    accessToken: tokens?.accessToken || null,
    refreshToken: tokens?.refreshToken || null,
  });
};


const delay = (ms: number): Promise<void> => 
  new Promise(resolve => setTimeout(resolve, ms));

const generateRequestId = (): string => 
  `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Token management with fallback to localStorage (for refresh token)
const TokenManager = {
  setTokens: (tokens: Tokens): void => {
    if (tokens.accessToken) {
      // For access token, we'll rely on HTTP-only cookies primarily
      // But we can store in localStorage as fallback for certain scenarios
      localStorage.setItem('accessToken', tokens.accessToken);
    }
    if (tokens.refreshToken) {
      localStorage.setItem('refreshToken', tokens.refreshToken);
    }
  },

  getAccessToken: (): string | null => 
    localStorage.getItem('accessToken'),

  getRefreshToken: (): string | null => 
    localStorage.getItem('refreshToken'),

  clearTokens: (): void => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },

  hasTokens: (): boolean => 
    !!(localStorage.getItem('accessToken') || localStorage.getItem('refreshToken')),
};

// Retry logic with exponential backoff
const executeWithRetry = async <T>(
  operation: () => Promise<T>,
  operationName: string,
  maxRetries: number = MAX_RETRY_ATTEMPTS
): Promise<T> => {
  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry on certain errors
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        if (status && [400, 401, 403, 404].includes(status)) {
          throw error;
        }
      }
      
      if (attempt < maxRetries) {
        const delayMs = RETRY_DELAY * Math.pow(2, attempt);
        console.warn(`Retrying ${operationName}, attempt ${attempt + 1} after ${delayMs}ms`);
        await delay(delayMs);
      }
    }
  }
  
  throw lastError!;
};

// Offline queue processing
const processPendingRequests = async (): Promise<void> => {
  while (pendingRequests.length > 0 && isOnline) {
    const request = pendingRequests.shift();
    if (request) {
      try {
        const response = await apiClient({
          url: request.url,
          method: request.method as any,
          data: request.data,
        });
        request.resolve(response.data);
      } catch (error) {
        request.reject(error);
      }
    }
  }
};

// Queue request for offline processing
const queueRequest = (request: Omit<PendingRequest, 'resolve' | 'reject' | 'retryCount'>): Promise<any> => {
  return new Promise((resolve, reject) => {
    pendingRequests.push({
      ...request,
      resolve,
      reject,
      retryCount: 0,
    });
  });
};

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = TokenManager.getAccessToken();
    if (token && !config.headers['Authorization']) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add request ID for cancellation
    const requestId = generateRequestId();
    config.headers['X-Request-ID'] = requestId;
    
    const source = axios.CancelToken.source();
    cancelTokenSources.set(requestId, source);
    config.cancelToken = source.token;
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor with token refresh logic
apiClient.interceptors.response.use(
  (response) => {
    // Clean up cancellation token
    const requestId = response.config.headers?.['X-Request-ID'];
    if (requestId) {
      cancelTokenSources.delete(requestId);
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as any;
    
    // Clean up cancellation token
    const requestId = originalRequest?.headers?.['X-Request-ID'];
    if (requestId) {
      cancelTokenSources.delete(requestId);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        await useAuthStore.getState().refreshToken();
        
        // Retry the original request with new token
        const token = TokenManager.getAccessToken();
        if (token) {
          originalRequest.headers.Authorization = `Bearer ${token}`;
        }
        
        return apiClient(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().resetAuthState();
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// Token refresh scheduler
const scheduleTokenRefresh = (expiresIn?: number): void => {
  if (refreshTimeout) {
    clearTimeout(refreshTimeout);
  }

  const refreshTime = expiresIn 
    ? Math.max(expiresIn * 1000 - 60000, 30000) // 1 minute before expiry or 30s minimum
    : TOKEN_REFRESH_INTERVAL;

  refreshTimeout = setTimeout(async () => {
    try {
      await useAuthStore.getState().refreshToken();
    } catch (error) {
      console.error('Token refresh failed:', error);
      // Retry after shorter interval on failure
      setTimeout(() => {
        useAuthStore.getState().refreshToken().catch(console.error);
      }, 30000);
    }
  }, refreshTime);
};

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
   handleSuccessfulAuth: (user: User, tokens?: { accessToken?: string; refreshToken?: string }) => {
  set({ 
    user,
    isAuthenticated: true,
    isLoading: false,
    isSigningUp: false,
    isSigningIn: false,
    isSigningInWithGoogle: false,
    isCreatingAnonymous: false,
    error: null
  });

  // Sync with persisted store
  syncAuthState(user, true, tokens);

  // Redirect to explore page
  if (typeof window !== 'undefined') {
    window.location.href = '/explore';
  }
},
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    error: null,

    // Sign Up with Email/Password
    signUp: async (email: string, password: string, username: string) => {
      const requestId = generateRequestId();
      
      return executeWithRetry(async () => {
        set({ isSigningUp: true, error: null });
        
        try {
          if (!get().isOnline) {
            throw new Error('Network offline. Please check your connection.');
          }

          const response: AxiosResponse<AuthResponse> = await apiClient.post('/register', {
            email,
            password,
            username,
          });

          const { user, accessToken, refreshToken, expiresIn } = response.data;

          // Store tokens
          TokenManager.setTokens({ accessToken, refreshToken });

          // Schedule token refresh
          if (expiresIn || accessToken) {
            scheduleTokenRefresh(expiresIn);
          }

         get().handleSuccessfulAuth(user, { accessToken, refreshToken });
          
        } catch (error) {
          set({ 
            error: getErrorMessage(error),
            isSigningUp: false 
          });
          throw error;
        }
      }, `signUp-${requestId}`);
    },

    // Sign In with Email/Password
    signIn: async (email: string, password: string) => {
      const requestId = generateRequestId();
      
      return executeWithRetry(async () => {
        set({ isSigningIn: true, error: null });
        
        try {
          if (!get().isOnline) {
            return queueRequest({
              url: '/login',
              method: 'POST',
              data: { email, password }
            });
          }

          const response: AxiosResponse<AuthResponse> = await apiClient.post('/login', {
            email,
            password,
          });

          const { user, accessToken, refreshToken, expiresIn } = response.data;

          TokenManager.setTokens({ accessToken, refreshToken });

          if (expiresIn || accessToken) {
            scheduleTokenRefresh(expiresIn);
          }

          get().handleSuccessfulAuth(user, { accessToken, refreshToken });
          
        } catch (error) {
          set({ 
            error: getErrorMessage(error),
            isSigningIn: false 
          });
          throw error;
        }
      }, `signIn-${requestId}`);
    },

    // Sign In with Google
    signInWithGoogle: async () => {
      const requestId = generateRequestId();
      
      return executeWithRetry(async () => {
        set({ isSigningInWithGoogle: true, error: null });
        
        try {
          if (!get().isOnline) {
            throw new Error('Network offline. Please check your connection.');
          }

          // This would typically redirect to backend OAuth endpoint
          // For direct API call, adjust based on your backend implementation
          const response: AxiosResponse<AuthResponse> = await apiClient.post('/google', {});
          
          const { user, accessToken, refreshToken, expiresIn } = response.data;

          TokenManager.setTokens({ accessToken, refreshToken });

          if (expiresIn || accessToken) {
            scheduleTokenRefresh(expiresIn);
          }

          set({ 
            user,
            isAuthenticated: true,
            isSigningInWithGoogle: false,
            error: null
          });
          
        } catch (error) {
          set({ 
            error: getErrorMessage(error),
            isSigningInWithGoogle: false 
          });
          throw error;
        }
      }, `signInWithGoogle-${requestId}`);
    },

    // Create Anonymous Session
    createAnonymousSession: async () => {
      const requestId = generateRequestId();
      
      return executeWithRetry(async () => {
        set({ isCreatingAnonymous: true, error: null });
        
        try {
          if (!get().isOnline) {
            return queueRequest({
              url: '/anonymous',
              method: 'POST',
              data: {}
            });
          }

          const response: AxiosResponse<AuthResponse> = await apiClient.post('/anonymous', {});

          const { user, accessToken, refreshToken, expiresIn } = response.data;

          TokenManager.setTokens({ accessToken, refreshToken });

          if (expiresIn || accessToken) {
            scheduleTokenRefresh(expiresIn);
          }

          set({ 
            user,
            isAuthenticated: true,
            isCreatingAnonymous: false,
            error: null
          });
          
        } catch (error) {
          set({ 
            error: getErrorMessage(error),
            isCreatingAnonymous: false 
          });
          throw error;
        }
      }, `createAnonymousSession-${requestId}`);
    },

    // Sign Out
    signOut: async () => {
      const requestId = generateRequestId();
      
      return executeWithRetry(async () => {
        set({ isLoading: true });
        
        try {
          if (get().isOnline) {
            await apiClient.post('/logout');
          }
          
          // Clear local storage and state regardless of API call success
          TokenManager.clearTokens();
          
          if (refreshTimeout) {
            clearTimeout(refreshTimeout);
            refreshTimeout = null;
          }

          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null
          });
          
        } catch (error) {
          // Even if API call fails, clear local state
          TokenManager.clearTokens();
          
          if (refreshTimeout) {
            clearTimeout(refreshTimeout);
            refreshTimeout = null;
          }

          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: getErrorMessage(error)
          });
        }
      }, `signOut-${requestId}`);
    },

    // Refresh Token
    refreshToken: async () => {
      const requestId = generateRequestId();
      
      return executeWithRetry(async () => {
        try {
          const refreshToken = TokenManager.getRefreshToken();
          if (!refreshToken) {
            throw new Error('No refresh token available');
          }

          const response: AxiosResponse<{ 
            accessToken: string; 
            refreshToken?: string;
            expiresIn?: number;
          }> = await apiClient.post('/refresh', {
            refreshToken,
          });

          TokenManager.setTokens({
            accessToken: response.data.accessToken,
            refreshToken: response.data.refreshToken,
          });

          // Reschedule next refresh
          scheduleTokenRefresh(response.data.expiresIn);

          return response.data.accessToken;
          
        } catch (error) {
          TokenManager.clearTokens();
          set({ 
            user: null,
            isAuthenticated: false,
            error: getErrorMessage(error)
          });
          throw error;
        }
      }, `refreshToken-${requestId}`);
    },

    // Get Current User
    getCurrentUser: async () => {
      const requestId = generateRequestId();
      
      return executeWithRetry(async () => {
        set({ isLoading: true, error: null });
        
        try {
          if (!get().isOnline && TokenManager.hasTokens()) {
            // If offline but have tokens, assume user is authenticated
            set({ isLoading: false });
            return;
          }

          const response: AxiosResponse<{ user: User }> = await apiClient.get('/me');
          
          set({ 
            user: response.data.user,
            isAuthenticated: true,
            isLoading: false,
            error: null
          });
          
        } catch (error) {
          TokenManager.clearTokens();
          set({ 
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: getErrorMessage(error)
          });
          throw error;
        }
      }, `getCurrentUser-${requestId}`);
    },

    // Cancel specific request
    cancelRequest: (requestId: string) => {
      const source = cancelTokenSources.get(requestId);
      if (source) {
        source.cancel('Request cancelled by user');
        cancelTokenSources.delete(requestId);
      }
    },

    // Set online status
    setOnlineStatus: (status: boolean) => {
      set({ isOnline: status });
      if (status) {
        processPendingRequests();
      }
    },

    // Clear errors
    clearError: () => {
      set({ error: null });
    },

    // Reset auth state
    resetAuthState: () => {
  TokenManager.clearTokens();
  
  if (refreshTimeout) {
    clearTimeout(refreshTimeout);
    refreshTimeout = null;
  }

  // Clear persisted store
  usePersistedAuthStore.setState({
    user: null,
    isAuthenticated: false,
    accessToken: null,
    refreshToken: null,
  });

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

// Initialize token refresh on app start if tokens exist
if (typeof window !== 'undefined' && TokenManager.hasTokens()) {
  // Schedule initial token refresh
  setTimeout(() => {
    useAuthStore.getState().refreshToken().catch(console.error);
  }, 1000);
  
  // Try to get current user
  useAuthStore.getState().getCurrentUser().catch(console.error);
}