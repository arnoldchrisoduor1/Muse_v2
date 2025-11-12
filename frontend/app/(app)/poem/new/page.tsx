// app/poem/new/page.tsx
"use client";
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { PoemEditor } from '@/components/poem/PoemEditor';
import { useSoloPoetStore } from '@/lib/store/solo-poet-store';
import { Button } from '@/components/ui/Button';

export default function NewPoemPage() {
  const { createNewDraft, currentDraft, saveDraft, isPublishing } = useSoloPoetStore();
  const [ loading, setLoading ] = useState(false);

  useEffect(() => {
    // Create new draft when page loads
    if (!currentDraft) {
      createNewDraft();
    }
  }, [createNewDraft, currentDraft]);

  const handleSaveDraft = async () => {
    try {
      setLoading(true);
      await saveDraft();
      setLoading(false);
    } catch (error) {
      console.log("Error saving draft: ", error);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <div className="flex items-center gap-4">
          <Link href="/create">
            <Button variant="outline" size="sm" icon={ArrowLeft}>
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold gradient-text">Create New Poem</h1>
            <p className="text-text-secondary">
              Write your masterpiece. AI suggestions will help improve quality.
            </p>
          </div>
        </div>
        
        <Button 
          variant="outline" 
          icon={Save}
          onClick={handleSaveDraft}
          disabled={!currentDraft?.content.trim()}
        >
          { loading ? 'Saving...' : 'Save Draft' }
        </Button>
      </motion.div>

      {/* Editor */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <PoemEditor />
      </motion.div>

      {/* Publishing Overlay */}
      {isPublishing && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-8 text-center max-w-md"
          >
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Publishing Your Poem</h3>
            <p className="text-text-secondary mb-4">
              Minting NFT and adding to blockchain...
            </p>
            <div className="space-y-2 text-sm text-text-muted">
              <p>✓ Creating semantic embedding</p>
              <p>✓ Generating quality assessment</p>
              <p>⏳ Minting NFT on blockchain</p>
              <p>○ Adding to discovery feed</p>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}