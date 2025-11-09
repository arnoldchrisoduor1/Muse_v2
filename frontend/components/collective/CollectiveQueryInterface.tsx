"use client";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Heart, Bookmark, Share2 } from 'lucide-react';
import { useCollectiveStore } from '@/lib/store/collective-store';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export function CollectiveQueryInterface() {
  const [query, setQuery] = useState('');
  const { 
    currentQuery, 
    generatedResponse, 
    isGenerating, 
    queryCollective, 
    likeResponse,
    saveToCollection 
  } = useCollectiveStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    await queryCollective(query);
  };

  const exampleQueries = [
    "What does hope feel like after disappointment?",
    "How do we find stillness in a noisy world?",
    "What is the sound of growing older?",
    "How does technology change how we love?",
    "What color is loneliness in the digital age?"
  ];

  return (
    <div className="space-y-6">
      {/* Query Input */}
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Sparkles className="text-secondary" />
          Ask the Collective
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-text-primary">
              What would you like to ask the collective poetic consciousness?
            </label>
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask about emotions, life experiences, creativity, or anything that inspires you..."
              className="input-field min-h-[120px] resize-none"
              disabled={isGenerating}
            />
          </div>
          
          {/* Example Queries */}
          <div className="space-y-2">
            <p className="text-sm text-text-muted">Try asking:</p>
            <div className="flex flex-wrap gap-2">
              {exampleQueries.map((example, index) => (
                <motion.button
                  key={index}
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setQuery(example)}
                  className="text-xs bg-white/5 hover:bg-white/10 border border-white/10 rounded-full px-3 py-1.5 transition-colors text-text-secondary hover:text-text-primary"
                  disabled={isGenerating}
                >
                  {example}
                </motion.button>
              ))}
            </div>
          </div>
          
          <Button
            type="submit"
            loading={isGenerating}
            disabled={!query.trim() || isGenerating}
            className="w-full"
            icon={Sparkles}
          >
            {isGenerating ? 'Channeling the Collective...' : 'Generate Collective Response'}
          </Button>
        </form>
      </Card>

      {/* Generated Response */}
      <AnimatePresence>
        {generatedResponse && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="p-6 border border-secondary/30">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-secondary">
                  The Collective Responds:
                </h3>
                <span className="text-xs text-text-muted bg-secondary/20 px-2 py-1 rounded-full">
                  NFT #{generatedResponse.nftTokenId?.substring(0, 8)}...
                </span>
              </div>
              
              {/* Question */}
              <div className="mb-4 p-3 bg-white/5 rounded-lg">
                <p className="text-sm text-text-muted mb-1">Your question:</p>
                <p className="text-text-primary italic">"{generatedResponse.question}"</p>
              </div>
              
              {/* Poem Response */}
              <pre className="whitespace-pre-wrap font-serif text-lg leading-relaxed text-text-primary mb-6">
                {generatedResponse.response}
              </pre>
              
              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => likeResponse(generatedResponse.id)}
                    className="flex items-center gap-2 text-text-muted hover:text-secondary transition-colors"
                  >
                    <Heart size={18} />
                    <span>{generatedResponse.likes}</span>
                  </button>
                  
                  <button
                    onClick={() => saveToCollection(generatedResponse.id)}
                    className="flex items-center gap-2 text-text-muted hover:text-primary transition-colors"
                  >
                    <Bookmark size={18} />
                    <span>Save</span>
                  </button>
                  
                  <button className="flex items-center gap-2 text-text-muted hover:text-accent transition-colors">
                    <Share2 size={18} />
                    <span>Share</span>
                  </button>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-text-muted">
                  <span className="flex items-center gap-1">
                    ⭐ {generatedResponse.qualityRating}/5
                  </span>
                  <span>•</span>
                  <span>DAO Owned</span>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Generating Animation */}
      <AnimatePresence>
        {isGenerating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Card className="p-8 text-center">
              <motion.div
                animate={{ 
                  rotate: 360,
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                  scale: { duration: 1.5, repeat: Infinity }
                }}
                className="w-16 h-16 bg-gradient-90 from-secondary to-primary rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <Sparkles size={24} className="text-white" />
              </motion.div>
              
              <h3 className="text-xl font-bold mb-2">Channeling the Collective</h3>
              <p className="text-text-secondary mb-4">
                Weaving together voices from {useCollectiveStore.getState().collectiveStats.poemsInTraining.toLocaleString()} poems...
              </p>
              
              <div className="space-y-2 text-sm text-text-muted max-w-md mx-auto">
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  ✓ Analyzing semantic patterns
                </motion.p>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                >
                  ✓ Generating poetic structure
                </motion.p>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.5 }}
                >
                  ⏳ Finalizing unique response
                </motion.p>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}