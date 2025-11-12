// components/providers/AuthProvider.tsx
"use client";
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store/auth-store';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const [showLoading, setShowLoading] = useState(true);

  useEffect(() => {
    // Small delay to prevent flash
    const timer = setTimeout(() => {
      if (isInitialized) {
        setShowLoading(false);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [isInitialized]);

  // Show loading only if not initialized
  if (!isInitialized || showLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-135 from-purple-900 via-indigo-900 to-blue-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}