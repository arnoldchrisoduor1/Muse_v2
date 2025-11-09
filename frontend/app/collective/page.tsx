"use client";
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, History, TrendingUp, Users } from 'lucide-react';
import { CollectiveQueryInterface } from '@/components/collective/CollectiveQueryInterface';
import { CollectiveStats } from '@/components/collective/CollectiveStats';
import { QueryHistory } from '@/components/collective/QueryHistory';
import { useCollectiveStore } from '@/lib/store/collective-store';
import { Card } from '@/components/ui/Card';

export default function CollectivePage() {
  const { loadQueryHistory, collectiveStats } = useCollectiveStore();

  useEffect(() => {
    loadQueryHistory();
  }, [loadQueryHistory]);

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold gradient-text mb-4">
          Collective Consciousness
        </h1>
        <p className="text-text-secondary text-lg max-w-2xl mx-auto">
          Query the combined wisdom of {collectiveStats.poemsInTraining.toLocaleString()} community poems. 
          Each response is a unique AI-generated poem minted as a DAO-owned NFT.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Query Interface */}
        <div className="lg:col-span-2 space-y-8">
          <CollectiveQueryInterface />
          <QueryHistory />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <CollectiveStats />
          
          {/* How It Works */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Sparkles className="text-secondary" size={20} />
              How It Works
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-primary text-xs font-bold">1</span>
                </div>
                <p className="text-text-secondary">
                  Ask any question about life, emotions, or creativity
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-primary text-xs font-bold">2</span>
                </div>
                <p className="text-text-secondary">
                  AI generates a poem using {collectiveStats.poemsInTraining.toLocaleString()} community poems as training data
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-primary text-xs font-bold">3</span>
                </div>
                <p className="text-text-secondary">
                  Response is minted as NFT, owned by DAO treasury
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-primary text-xs font-bold">4</span>
                </div>
                <p className="text-text-secondary">
                  Revenue funds poetry grants and platform development
                </p>
              </div>
            </div>
          </Card>

          {/* Quick Stats */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="text-accent" size={20} />
              Community Impact
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-text-secondary">Poets Contributed</span>
                <span className="text-text-primary font-medium">892</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Total Royalties Paid</span>
                <span className="text-text-primary font-medium">12.4 ETH</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Grants Funded</span>
                <span className="text-text-primary font-medium">24</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Avg. Response Quality</span>
                <span className="text-accent font-medium">4.2/5</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}