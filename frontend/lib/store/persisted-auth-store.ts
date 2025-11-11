import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { useAuthStore } from "./auth-store";

// Define the persisted state separately
interface PersistedAuthState {
  user: any | null;
  isAuthenticated: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  // Add any other state you want to persist
}

export const usePersistedAuthStore = create<PersistedAuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      accessToken: null,
      refreshToken: null,
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      // Only persist these specific fields
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    }
  )
);