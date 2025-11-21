// app/explore/trending/page.tsx
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { TrendingUp, ArrowLeft } from "lucide-react";
import { PoemGrid } from "@/components/poem/PoemGrid";
import { Button } from "@/components/ui/Button";
import { useDiscoveryStore } from "@/lib/store/discovery-store";

export default function TrendingPoemsPage() {
  const router = useRouter();
  const { trendingPoems, loadTrendingPoems, isLoading } = useDiscoveryStore();

  useEffect(() => {
    loadTrendingPoems();
  }, [loadTrendingPoems]);

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            icon={ArrowLeft}
            onClick={() => router.push('/explore')}
          >
            Back
          </Button>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <TrendingUp className="text-secondary" />
            Trending Poems
          </h1>
        </div>
        <p className="text-text-secondary text-lg">
          Discover what's popular in the poetry community right now
        </p>
      </motion.div>

      {/* Poems Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        {isLoading ? (
          <div className="grid grid-cols-1 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-32 bg-white/10 rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : (
          <PoemGrid poems={trendingPoems} />
        )}
      </motion.div>

      {/* Empty State */}
      {!isLoading && trendingPoems.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-12"
        >
          <TrendingUp size={64} className="text-text-muted mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No trending poems yet</h3>
          <p className="text-text-secondary mb-6">
            Be the first to create engaging content that captures attention!
          </p>
          <Button variant="primary" onClick={() => router.push('/create')}>
            Create Your First Poem
          </Button>
        </motion.div>
      )}
    </div>
  );
}