"use client";
import { motion } from 'framer-motion';
import { Heart, Eye } from 'lucide-react';
import { Card } from '@/components/ui/Card';

interface Poem {
  id: string;
  title: string;
  author: string;
  excerpt: string;
  likes: number;
  views: number;
  isCollective?: boolean;
  isCollaborative?: boolean;
  isAnonymous?: boolean;
  collaborators?: number;
  qualityScore?: number;
}

interface PoemCardProps {
  poem: Poem;
}

export function PoemCard({ poem }: PoemCardProps) {
  return (
    <Card className="p-4 hover:bg-white/10 transition-all duration-300 cursor-pointer group h-full">
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-text-primary group-hover:text-primary transition-colors line-clamp-2">
          {poem.title}
        </h3>
        <div className="flex gap-1 flex-shrink-0 ml-2">
          {poem.isCollective && (
            <span className="text-xs bg-secondary/20 text-secondary px-2 py-1 rounded-full">
              Collective
            </span>
          )}
          {poem.isCollaborative && (
            <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
              Collab
            </span>
          )}
          {poem.isAnonymous && (
            <span className="text-xs bg-accent/20 text-accent px-2 py-1 rounded-full">
              Anonymous
            </span>
          )}
        </div>
      </div>
      
      <p className="text-text-secondary text-sm mb-4 line-clamp-3 flex-grow">
        {poem.excerpt}
      </p>
      
      <div className="flex items-center justify-between text-xs text-text-muted">
        <span className="truncate">by {poem.author}</span>
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="flex items-center gap-1">
            <Heart size={12} />
            <span>{poem.likes}</span>
          </div>
          <div className="flex items-center gap-1">
            <Eye size={12} />
            <span>{(poem.views / 1000).toFixed(1)}k</span>
          </div>
        </div>
      </div>
    </Card>
  );
}