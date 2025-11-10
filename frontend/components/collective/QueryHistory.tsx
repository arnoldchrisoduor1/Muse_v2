"use client";
import { motion } from 'framer-motion';
import { History, Heart, Bookmark, Eye, EyeOff } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useCollectiveStore } from '@/lib/store/collective-store';

export function QueryHistory() {
  const { queryHistory, isGenerating, likeResponse, saveToCollection } = useCollectiveStore();

  if (isGenerating && queryHistory.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <History className="text-primary" size={20} />
          <h3 className="font-semibold">Recent Queries</h3>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((item) => (
            <div key={item} className="animate-pulse">
              <div className="h-4 bg-white/10 rounded mb-2 w-3/4" />
              <div className="h-3 bg-white/5 rounded w-1/2" />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (queryHistory.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <History className="text-primary" size={20} />
          <h3 className="font-semibold">Recent Queries</h3>
        </div>
        <div className="text-center py-8">
          <History size={48} className="text-text-muted mx-auto mb-4" />
          <p className="text-text-secondary mb-2">No query history yet</p>
          <p className="text-text-muted text-sm">
            Your collective queries will appear here
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <History className="text-primary" size={20} />
          <h3 className="font-semibold">Recent Queries</h3>
          <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
            {queryHistory.length}
          </span>
        </div>
        <Button variant="outline" size="sm">
          View All
        </Button>
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto no-scrollbar">
        {queryHistory.map((query, index) => (
          <motion.div
            key={query.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-4 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-text-muted mb-1">Question:</p>
                <p className="text-text-primary font-medium truncate">
                  "{query.question}"
                </p>
              </div>
              <div className="flex items-center gap-1 text-xs text-text-muted ml-2 shrink-0">
                <span>⭐ {query.qualityRating}/5</span>
              </div>
            </div>
            
            <div className="mb-3">
              <p className="text-sm text-text-muted mb-1">Response:</p>
              <p className="text-text-secondary text-sm line-clamp-2">
                {query.response}
              </p>
            </div>
            
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-4 text-text-muted">
                <button
                  onClick={() => likeResponse(query.id)}
                  className="flex items-center gap-1 hover:text-secondary transition-colors"
                >
                  <Heart size={14} />
                  <span>{query.likes}</span>
                </button>
                
                <button
                  onClick={() => saveToCollection(query.id)}
                  className="flex items-center gap-1 hover:text-primary transition-colors"
                >
                  <Bookmark size={14} />
                  <span>Save</span>
                </button>
                
                <div className="flex items-center gap-1">
                  {query.isPublic ? (
                    <>
                      <Eye size={14} />
                      <span>Public</span>
                    </>
                  ) : (
                    <>
                      <EyeOff size={14} />
                      <span>Private</span>
                    </>
                  )}
                </div>
              </div>
              
              <span className="text-text-muted">
                {new Date(query.createdAt).toLocaleDateString()}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </Card>
  );
}