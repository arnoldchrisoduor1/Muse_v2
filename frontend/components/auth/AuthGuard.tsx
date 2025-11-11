"use client";
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/app/hooks/useAuth';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isInitialized } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Only run the check once the auth state has been loaded from storage
    if (isInitialized) {
      const isPublicPath = pathname.startsWith('/signup') || pathname.startsWith('/login');

      if (!isAuthenticated && !isPublicPath) {
        // Not authenticated AND trying to access a protected page
        console.log('Redirecting to /login because user is not authenticated.');
        router.replace('/login');
      } else if (isAuthenticated && isPublicPath) {
        // Authenticated AND trying to access a public page (login/signup)
        console.log('Redirecting to /explore because user is already authenticated.');
        router.replace('/explore');
      }
    }
  }, [isAuthenticated, isInitialized, router, pathname]);

  // Block rendering of children until we know the true auth state
  if (!isInitialized) {
    // This is the global loading state (as seen in AuthProvider)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-white">Checking authentication...</p>
      </div>
    );
  }

  // Once initialized, render children. If unauthenticated, the useEffect will handle the redirect.
  return <>{children}</>;
}