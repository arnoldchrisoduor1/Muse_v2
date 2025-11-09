// components/studio/ContentPerformance.tsx
"use client";
import { motion } from 'framer-motion';
import { TrendingUp, Eye, Heart, MessageSquare, Bookmark, DollarSign, BarChart3 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface ContentPerformanceProps {
  performance: any[];
  view: 'compact' | 'detailed';
}

export function ContentPerformance({ performance, view }: ContentPerformanceProps) {
  if (!performance || performance.length === 0) {
    return (
      <Card className="p-8 text-center">
        <BarChart3 size={48} className="text-text-muted mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No content data</h3>
        <p className="text-text-secondary">Start publishing to see performance analytics.</p>
      </Card>
    );
  }

  const isCompact = view === 'compact';

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold flex items-center gap-2">
          <TrendingUp className="text-primary" size={20} />
          {isCompact ? 'Top Performing Content' : 'Content Performance'}
        </h3>
        {isCompact && (
          <Button variant="outline" size="sm">
            View All
          </Button>
        )}
      </div>

      {/* Table Header */}
      <div className={`grid gap-4 mb-4 text-sm font-medium text-text-muted ${
        isCompact ? 'grid-cols-4' : 'grid-cols-7'
      }`}>
        <div>Poem</div>
        <div className="text-center">Views</div>
        <div className="text-center">Engagement</div>
        {!isCompact && (
          <>
            <div className="text-center">Likes</div>
            <div className="text-center">Comments</div>
            <div className="text-center">Quality</div>
          </>
        )}
        <div className="text-center">Earnings</div>
      </div>

      {/* Content List */}
      <div className="space-y-3">
        {performance.map((poem, index) => (
          <motion.div
            key={poem.poemId}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`grid gap-4 items-center p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors ${
              isCompact ? 'grid-cols-4' : 'grid-cols-7'
            }`}
          >
            {/* Poem Title */}
            <div className="min-w-0">
              <div className="font-medium text-text-primary truncate">
                {poem.title}
              </div>
              <div className="text-xs text-text-muted">
                {poem.publishedAt.toLocaleDateString()}
              </div>
            </div>

            {/* Views */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-sm">
                <Eye size={14} className="text-blue-400" />
                <span className="font-medium">{poem.views.toLocaleString()}</span>
              </div>
            </div>

            {/* Engagement Rate */}
            <div className="text-center">
              <div className="text-sm font-medium">
                {poem.engagementRate}%
              </div>
              <div className="text-xs text-text-muted">
                Engagement
              </div>
            </div>

            {/* Detailed Metrics */}
            {!isCompact && (
              <>
                {/* Likes */}
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-sm">
                    <Heart size={14} className="text-pink-400" />
                    <span className="font-medium">{poem.likes}</span>
                  </div>
                </div>

                {/* Comments */}
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-sm">
                    <MessageSquare size={14} className="text-green-400" />
                    <span className="font-medium">{poem.comments}</span>
                  </div>
                </div>

                {/* Quality Score */}
                <div className="text-center">
                  <div className={`text-sm font-medium ${
                    poem.qualityScore >= 85 ? 'text-accent' :
                    poem.qualityScore >= 70 ? 'text-primary' :
                    'text-warning'
                  }`}>
                    {poem.qualityScore}
                  </div>
                  <div className="text-xs text-text-muted">
                    Quality
                  </div>
                </div>
              </>
            )}

            {/* Earnings */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-sm">
                <DollarSign size={14} className="text-accent" />
                <span className="font-medium text-accent">
                  {poem.earnings.toFixed(2)}
                </span>
              </div>
              <div className="text-xs text-text-muted">
                Earned
              </div>
            </div>