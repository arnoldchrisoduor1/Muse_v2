export function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Header Skeleton */}
      <div className="relative">
        {/* Cover Skeleton */}
        <div className="h-48 sm:h-64 bg-white/10 animate-pulse" />
        
        {/* Profile Info Skeleton */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 pb-6">
            {/* Avatar Skeleton */}
            <div className="w-32 h-32 rounded-full bg-white/10 animate-pulse border-4 border-bg-primary" />
            
            <div className="flex-1 text-center sm:text-left space-y-3">
              <div className="h-8 w-64 bg-white/10 animate-pulse rounded mx-auto sm:mx-0" />
              <div className="h-4 w-48 bg-white/10 animate-pulse rounded mx-auto sm:mx-0" />
              <div className="flex gap-4 justify-center sm:justify-start">
                <div className="h-6 w-20 bg-white/10 animate-pulse rounded" />
                <div className="h-6 w-20 bg-white/10 animate-pulse rounded" />
                <div className="h-6 w-20 bg-white/10 animate-pulse rounded" />
              </div>
            </div>
            
            {/* Action Buttons Skeleton */}
            <div className="flex gap-3">
              <div className="h-10 w-24 bg-white/10 animate-pulse rounded-lg" />
              <div className="h-10 w-24 bg-white/10 animate-pulse rounded-lg" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
          {/* Sidebar Skeleton */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Info Card Skeleton */}
            <div className="glass-card p-6 space-y-4">
              <div className="space-y-3">
                <div className="h-4 w-20 bg-white/10 animate-pulse rounded" />
                <div className="h-12 bg-white/10 animate-pulse rounded" />
              </div>
              <div className="space-y-2">
                <div className="h-4 w-24 bg-white/10 animate-pulse rounded" />
                <div className="h-8 bg-white/10 animate-pulse rounded" />
              </div>
              <div className="space-y-2">
                <div className="h-4 w-16 bg-white/10 animate-pulse rounded" />
                <div className="h-6 bg-white/10 animate-pulse rounded" />
              </div>
            </div>

            {/* Badges Skeleton */}
            <div className="glass-card p-6">
              <div className="h-5 w-20 bg-white/10 animate-pulse rounded mb-4" />
              <div className="grid grid-cols-3 gap-2">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="aspect-square bg-white/10 animate-pulse rounded" />
                ))}
              </div>
            </div>

            {/* Stats Skeleton */}
            <div className="glass-card p-6">
              <div className="h-5 w-16 bg-white/10 animate-pulse rounded mb-4" />
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <div className="h-4 w-20 bg-white/10 animate-pulse rounded" />
                    <div className="h-4 w-8 bg-white/10 animate-pulse rounded" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content Skeleton */}
          <div className="lg:col-span-3 space-y-6">
            {/* Tabs Skeleton */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-10 w-24 bg-white/10 animate-pulse rounded-lg" />
                ))}
              </div>
              <div className="flex gap-3 w-full sm:w-auto">
                <div className="h-10 flex-1 sm:flex-none sm:w-32 bg-white/10 animate-pulse rounded-lg" />
                <div className="h-10 flex-1 sm:flex-none sm:w-32 bg-white/10 animate-pulse rounded-lg" />
              </div>
            </div>

            {/* Content Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="glass-card p-6 space-y-3">
                  <div className="h-6 w-3/4 bg-white/10 animate-pulse rounded" />
                  <div className="h-4 w-full bg-white/10 animate-pulse rounded" />
                  <div className="h-4 w-2/3 bg-white/10 animate-pulse rounded" />
                  <div className="flex justify-between pt-2">
                    <div className="h-4 w-16 bg-white/10 animate-pulse rounded" />
                    <div className="h-4 w-12 bg-white/10 animate-pulse rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}