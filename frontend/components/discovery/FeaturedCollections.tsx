"use client";
import { motion } from 'framer-motion';
import { Library, Users, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface FeaturedCollectionsProps {
  collections: any[];
}

export function FeaturedCollections({ collections }: FeaturedCollectionsProps) {
  if (collections.length === 0) {
    return null;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Library className="text-warning" />
          Featured Collections
        </h2>
        <Button variant="outline" size="sm" icon={ArrowRight}>
          View All
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {collections.map((collection, index) => (
          <motion.div
            key={collection.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="p-6 hover:bg-white/10 transition-all duration-300 cursor-pointer group h-full">
              {/* Collection Image/Icon */}
              <div className="w-12 h-12 bg-gradient-90 from-warning to-accent rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Library size={24} className="text-white" />
              </div>
              
              <h3 className="text-lg font-semibold mb-2 group-hover:text-warning transition-colors">
                {collection.title}
              </h3>
              
              <p className="text-text-secondary text-sm mb-4 line-clamp-2">
                {collection.description}
              </p>
              
              <div className="flex items-center justify-between text-sm text-text-muted">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Users size={14} />
                    <span>by {collection.curator}</span>
                  </div>
                  <span>{collection.poemCount} poems</span>
                </div>
                
                <Button variant="outline" size="sm">
                  Explore
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}