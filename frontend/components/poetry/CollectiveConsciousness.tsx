import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { usePoetryStore } from '@/lib/store/poetry-store';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export const CollectiveConsciousness: React.FC = () => {
  const [query, setQuery] = useState('');
  const { generatedPoem, isLoading, queryCollective } = usePoetryStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    await queryCollective(query);
  };

  return (
    <div className="space-y-6">
      <Card glow className="p-6">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Sparkles className="text-secondary" />
          Query the Collective Consciousness
        </h2>
        
        <p className="text-text-secondary mb-6">
          Ask the community's collective poetic voice anything. Each response is generated
          from the combined essence of thousands of poems and minted as an NFT owned by the DAO.
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              What would you like to ask the collective?
            </label>
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g., 'What does loneliness feel like in the digital age?'"
              className="input-field"
              rows={3}
            />
          </div>
          
          <Button
            type="submit"
            loading={isLoading}
            disabled={!query.trim()}
            className="w-full"
            icon={Sparkles}
          >
            {isLoading ? 'Channeling the Collective...' : 'Generate Poem'}
          </Button>
        </form>
        
        <AnimatePresence>
          {generatedPoem && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6"
            >
              <Card className="p-6 border border-secondary/30">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-secondary">
                    The Collective Responds:
                  </h3>
                  <span className="text-xs text-text-muted">
                    NFT #{generatedPoem.nftId} • Owned by DAO Treasury
                  </span>
                </div>
                
                <pre className="whitespace-pre-wrap font-serif text-lg leading-relaxed text-text-primary">
                  {generatedPoem.content}
                </pre>
                
                <div className="mt-4 flex gap-4 text-sm text-text-muted">
                  <span>🔥 Generated from {generatedPoem.trainingDataCount.toLocaleString()} community poems</span>
                  <span>💎 {generatedPoem.treasuryContribution} ETH to DAO treasury</span>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
      
      <StatsSection />
    </div>
  );
};

const StatsSection: React.FC = () => {
  const stats = [
    { value: '2,847', label: 'Poems in Collective' },
    { value: '1,293', label: 'Queries Processed' },
    { value: '34.2 ETH', label: 'DAO Treasury' },
  ];

  return (
    <div className="grid grid-cols-3 gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="p-4 text-center">
            <div className="text-3xl font-bold text-secondary">{stat.value}</div>
            <div className="text-sm text-text-muted">{stat.label}</div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};