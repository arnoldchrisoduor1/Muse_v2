// app/collections/page.tsx
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Library, ArrowLeft, Plus } from "lucide-react";
import { FeaturedCollections } from "@/components/discovery/FeaturedCollections";
import { Button } from "@/components/ui/Button";
import { useDiscoveryStore } from "@/lib/store/discovery-store";

export default function CollectionsPage() {
  const router = useRouter();
  const { featuredCollections, loadFeaturedCollections, isLoading } = useDiscoveryStore();

  useEffect(() => {
    loadFeaturedCollections();
  }, [loadFeaturedCollections]);

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              icon={ArrowLeft}
              onClick={() => router.push('/explore')}
            >
              Back
            </Button>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Library className="text-warning" />
              Poetry Collections
            </h1>
          </div>
          
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => router.push('/collections/create')}
          >
            Create Collection
          </Button>
        </div>
        <p className="text-text-secondary text-lg">
          Curated collections of poems around themes, moods, and topics
        </p>
      </motion.div>

      {/* Collections */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        {isLoading ? (
          <div className="grid grid-cols-1 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-32 bg-white/10 rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : (
          <FeaturedCollections collections={featuredCollections} />
        )}
      </motion.div>

      {/* Empty State */}
      {!isLoading && featuredCollections.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-12"
        >
          <Library size={64} className="text-text-muted mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No collections yet</h3>
          <p className="text-text-secondary mb-6">
            Create the first collection to organize amazing poems
          </p>
          <Button variant="primary" onClick={() => router.push('/collections/create')}>
            Create First Collection
          </Button>
        </motion.div>
      )}
    </div>
  );
}