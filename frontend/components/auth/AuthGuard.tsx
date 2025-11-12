"use client";
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';

const PUBLIC_PATHS = ['/signup', '/login', '/'];

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Only check routes once initialization is complete
    if (!isInitialized) {
      return;
    }

    const isPublicPath = PUBLIC_PATHS.some(path => 
      pathname === path
    );

    if (!isAuthenticated && !isPublicPath) {
      // Not authenticated, trying to access protected route
      console.log('Redirecting to /login - not authenticated');
      router.replace('/login');
      return;
    }

    if (isAuthenticated && isPublicPath && pathname !== '/') {
      // Authenticated, trying to access login/signup
      console.log('Redirecting to /explore - already authenticated');
      router.replace('/explore');
      return;
    }

    // All checks passed - allow render
    setIsChecking(false);
  }, [isAuthenticated, isInitialized, pathname, router]);

  // Don't render until initialization is complete
  if (!isInitialized) {
    return null;
  }

  // Don't render until route check is complete
  if (isChecking) {
    return null;
  }

  return <>{children}</>;
}