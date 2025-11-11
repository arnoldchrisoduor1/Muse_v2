"use client";
import { useEffect } from 'react';

import { useAuth } from '@/app/hooks/useAuth';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isInitialized } = useAuth();

  // Optional: You can add a global loading state here
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-135 from-purple-900 via-indigo-900 to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Authenticating...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}