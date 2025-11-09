"use client";
import { motion } from 'framer-motion';
import { Heart, Bookmark, Eye, Users, Shield, Sparkles } from 'lucide-react';
import { useDiscoveryStore } from '@/lib/store/discovery-store';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface PoemGridProps {
  poems: any[];
  viewMode?: 'grid' | 'list' | 'minimal';
}

export function PoemGrid({ poems, viewMode = 'grid' }: PoemGridProps) {
  const { likePoem, bookmarkPoem } = useDiscoveryStore();

  if (poems.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Sparkles size={48} className="text-text-muted mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No poems found</h3>
        <p className="text-text-secondary">
          Try adjusting your search criteria or explore trending poems.
        </p>
      </Card>
    );
  }

  if (viewMode === 'list') {
    return (
      <div className="space-y-4">
        {poems.map((poem, index) => (
          <PoemListItem
            key={poem.id}
            poem={poem}
            index={index}
            onLike={likePoem}
            onBookmark={bookmarkPoem}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {poems.map((poem, index) => (
        <PoemCard
          key={poem.id}
          poem={poem}
          index={index}
          onLike={likePoem}
          onBookmark={bookmarkPoem}
        />
      ))}
    </div>
  );
}

function PoemCard({ poem, index, onLike, onBookmark }: { 
  poem: any; 
  index: number;
  onLike: (id: string) => void;
  onBookmark: (id: string) => void;
}) {
  const getQualityColor = (score: number) => {
    if (score >= 85) return 'text-accent';
    if (score >= 70) return 'text-primary';
    if (score >= 60) return 'text-warning';
    return 'text-text-muted';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="p-6 hover:bg-white/10 transition-all duration-300 cursor-pointer group">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors line-clamp-2">
              {poem.title}
            </h3>
            <div className="flex items-center gap-2 text-sm text-text-muted">
              <span>by {poem.author.username}</span>
              {poem.author.isVerified && (
                <Sparkles size={12} className="text-primary" />
              )}
            </div>
          </div>
          
          {/* Quality Badge */}
          <div className={`text-xs font-bold ${getQualityColor(poem.qualityScore)} bg-white/10 px-2 py-1 rounded-full flex-shrink-0 ml-2`}>
            {poem.qualityScore}%
          </div>
        </div>

        {/* Content Excerpt */}
        <p className="text-text-secondary text-sm mb-4 line-clamp-3">
          {poem.excerpt}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-4">
          {poem.tags.slice(0, 3).map((tag: string) => (
            <span
              key={tag}
              className="text-xs bg-white/5 text-text-muted px-2 py-1 rounded-full"
            >
              {tag}
            </span>
          ))}
          {poem.tags.length > 3 && (
            <span className="text-xs text-text-muted px-2 py-1">
              +{poem.tags.length - 3}
            </span>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-text-muted">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Eye size={14} />
              <span>{poem.views.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <Heart size={14} />
              <span>{poem.likes}</span>
            </div>
            <div className="flex items-center gap-1">
              <Bookmark size={14} />
              <span>{poem.bookmarks}</span>
            </div>
          </div>

          {/* Special Badges */}
          <div className="flex items-center gap-1">
            {poem.isCollaborative && (
              <Users size={14} className="text-primary" title="Collaborative" />
            )}
            {poem.isAnonymous && (
              <Shield size={14} className="text-accent" title="Anonymous" />
            )}
            {poem.nftTokenId && (
              <Sparkles size={14} className="text-secondary" title="NFT" />
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-4 pt-4 border-t border-white/10">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            icon={Heart}
            onClick={() => onLike(poem.id)}
          >
            Like
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            icon={Bookmark}
            onClick={() => onBookmark(poem.id)}
          >
            Save
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}

function PoemListItem({ poem, index, onLike, onBookmark }: { 
  poem: any; 
  index: number;
  onLike: (id: string) => void;
  onBookmark: (id: string) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className="p-4 hover:bg-white/10 transition-all duration-300 cursor-pointer group">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                {poem.title}
              </h3>
              <div className="flex items-center gap-2 text-sm text-text-muted">
                <span>by {poem.author.username}</span>
                {poem.author.isVerified && (
                  <Sparkles size={12} className="text-primary" />
                )}
              </div>
            </div>
            
            <p className="text-text-secondary text-sm mb-3 line-clamp-2">
              {poem.excerpt}
            </p>

            <div className="flex items-center gap-4 text-sm text-text-muted">
              <div className="flex items-center gap-1">
                <Eye size={14} />
                <span>{poem.views.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <Heart size={14} />
                <span>{poem.likes}</span>
              </div>
              <div className="flex items-center gap-1">
                <Bookmark size={14} />
                <span>{poem.bookmarks}</span>
              </div>
              <span>{poem.readingTime} min read</span>
            </div>
          </div>

          <div className="flex items-center gap-2 ml-4">
            <Button
              variant="outline"
              size="sm"
              icon={Heart}
              onClick={() => onLike(poem.id)}
            >
              {poem.likes}
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={Bookmark}
              onClick={() => onBookmark(poem.id)}
            >
              Save
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}