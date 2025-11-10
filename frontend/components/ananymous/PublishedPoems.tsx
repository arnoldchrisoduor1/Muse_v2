"use client";
import { motion } from 'framer-motion';
import { Eye, Heart, DollarSign, Check, Clock } from 'lucide-react';
import { useAnonymousStore } from '@/lib/store/anonymous-store';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export function PublishedPoems() {
  const { publishedPoems, claimEarnings, isClaiming } = useAnonymousStore();

  const handleClaimEarnings = async (poemId: string, proof: any) => {
    await claimEarnings(proof);
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Eye className="text-accent" />
          Your Anonymous Publications
        </h2>
        <span className="text-text-muted text-sm">
          {publishedPoems.length} poems published
        </span>
      </div>

      <div className="space-y-4">
        {publishedPoems.map((poem, index) => (
          <motion.div
            key={poem.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-4 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-text-primary mb-1">
                  {poem.title}
                </h3>
                <p className="text-text-secondary text-sm line-clamp-2">
                  {poem.content}
                </p>
              </div>
              <div className={`px-2 py-1 rounded-full text-xs font-medium ml-4 shrink-0 ${
                poem.isClaimed 
                  ? 'bg-accent/20 text-accent border border-accent/30' 
                  : 'bg-warning/20 text-warning border border-warning/30'
              }`}>
                {poem.isClaimed ? 'Claimed' : 'Unclaimed'}
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-4 text-sm text-text-muted">
                <div className="flex items-center gap-1">
                  <Eye size={14} />
                  <span>{poem.views.toLocaleString()} views</span>
                </div>
                <div className="flex items-center gap-1">
                  <Heart size={14} />
                  <span>{poem.likes} likes</span>
                </div>
                <div className="flex items-center gap-1">
                  <DollarSign size={14} />
                  <span>${poem.earnings.toFixed(2)}</span>
                </div>
              </div>
              
              <div className="text-xs text-text-muted">
                {new Date(poem.publishedAt!).toLocaleDateString()}
              </div>
            </div>

            {/* Claim Button */}
            {!poem.isClaimed && (
              <div className="flex items-center justify-between pt-3 border-t border-white/10">
                <div className="text-sm text-text-secondary">
                  Ready to claim earnings
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  loading={isClaiming}
                  onClick={() => handleClaimEarnings(poem.id, poem.zkProof)}
                  icon={DollarSign}
                >
                  Claim ${poem.earnings.toFixed(2)}
                </Button>
              </div>
            )}

            {/* Claimed Info */}
            {poem.isClaimed && poem.claimedAt && (
              <div className="flex items-center gap-2 pt-3 border-t border-white/10 text-sm text-accent">
                <Check size={16} />
                <span>Claimed {new Date(poem.claimedAt).toLocaleDateString()}</span>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {publishedPoems.length === 0 && (
        <div className="text-center py-8">
          <Eye size={48} className="text-text-muted mx-auto mb-4" />
          <p className="text-text-secondary mb-2">No anonymous publications yet</p>
          <p className="text-text-muted text-sm">
            Your anonymously published poems will appear here
          </p>
        </div>
      )}
    </Card>
  );
}