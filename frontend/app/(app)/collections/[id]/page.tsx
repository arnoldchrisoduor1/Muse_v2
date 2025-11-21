// app/collection/[id]/page.tsx
"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Library, Users, ArrowLeft, Calendar, Eye } from "lucide-react";
import { PoemGrid } from "@/components/poem/PoemGrid";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface Comment {
  id: string;
  content: string;
  author: {
    id: string;
    username: string;
    avatarUrl: string;
    isVerified: boolean;
  };
  createdAt: Date;
  likes: number;
}

export default function CollectionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const collectionId = params.id as string;
  
  const [collection, setCollection] = useState<any>(null);
  const [poems, setPoems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCollectionData();
  }, [collectionId]);

  const loadCollectionData = async () => {
    setIsLoading(true);
    try {
      // In a real app, fetch collection and its poems from API
      // For now, we'll simulate with mock data
      const mockCollection = {
        id: collectionId,
        title: "Modern Love Poems",
        description: "A collection of contemporary love poetry that explores relationships in the digital age.",
        curator: "Poetry Enthusiast",
        poemCount: 12,
        views: 1250,
        createdAt: new Date('2024-01-15'),
        tags: ["love", "modern", "relationships", "digital"]
      };

      const mockPoems = [
        // Your poem data here...
      ];

      setCollection(mockCollection);
      setPoems(mockPoems);
    } catch (error) {
      console.error('Failed to load collection:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-white/10 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-white/10 rounded w-1/2 mb-8"></div>
          <div className="space-y-3">
            <div className="h-4 bg-white/10 rounded"></div>
            <div className="h-4 bg-white/10 rounded"></div>
            <div className="h-4 bg-white/10 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Collection Not Found</h1>
        <Button onClick={() => router.push('/collections')}>
          Back to Collections
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Navigation */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <Button
          variant="outline"
          icon={ArrowLeft}
          onClick={() => router.push('/collections')}
          className="mb-4"
        >
          Back to Collections
        </Button>
      </motion.div>

      {/* Collection Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="p-8 mb-8">
          <div className="flex items-start gap-6 mb-6">
            <div className="w-20 h-20 bg-gradient-90 from-warning to-accent rounded-lg flex items-center justify-center flex-shrink-0">
              <Library size={32} className="text-white" />
            </div>
            
            <div className="flex-1">
              <h1 className="text-4xl font-bold gradient-text mb-4">
                {collection.title}
              </h1>
              
              <p className="text-text-secondary text-lg mb-4">
                {collection.description}
              </p>

              <div className="flex items-center gap-6 text-text-secondary">
                <div className="flex items-center gap-2">
                  <Users size={18} />
                  <span>Curated by {collection.curator}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Library size={18} />
                  <span>{collection.poemCount} poems</span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye size={18} />
                  <span>{collection.views?.toLocaleString()} views</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={18} />
                  <span>Created {new Date(collection.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {collection.tags?.map((tag: string) => (
              <span
                key={tag}
                className="px-3 py-1 bg-warning/20 text-warning rounded-full text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Poems in Collection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-2xl font-bold mb-6">Poems in this Collection</h2>
        <PoemGrid poems={poems} />
      </motion.div>

      {/* Empty State for Poems */}
      {!isLoading && poems.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-12"
        >
          <Library size={64} className="text-text-muted mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No poems in this collection</h3>
          <p className="text-text-secondary">
            This collection doesn't have any poems yet.
          </p>
        </motion.div>
      )}
    </div>
  );
}