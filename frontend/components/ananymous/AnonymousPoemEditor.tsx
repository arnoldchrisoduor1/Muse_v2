"use client";
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Eye, EyeOff, FileText } from 'lucide-react';
import { useAnonymousStore } from '@/lib/store/anonymous-store';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export function AnonymousPoemEditor() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [showSecurityInfo, setShowSecurityInfo] = useState(true);
  
  const {
    isGeneratingProof,
    isPublishing,
    generatedProof,
    generateZKProof,
    publishAnonymousPoem,
    setCurrentPoem,
  } = useAnonymousStore();

  const handleGenerateProof = async () => {
    if (!content.trim() || !title.trim()) return;
    
    const proof = await generateZKProof(content, title);
    console.log('Generated ZK Proof:', proof);
  };

  const handlePublish = async () => {
    if (!generatedProof || !content.trim() || !title.trim()) return;
    
    const poem = {
      id: generatedProof.poemId,
      title,
      content,
      createdAt: new Date(),
      publishedAt: null,
      zkProof: generatedProof,
      nftTokenId: null,
      views: 0,
      likes: 0,
      earnings: 0,
      isClaimed: false,
      claimedAt: null,
    };

    await publishAnonymousPoem(poem as any);
    
    // Reset form
    setTitle('');
    setContent('');
  };

  const canGenerateProof = title.trim().length > 0 && content.trim().length >= 50;
  const canPublish = generatedProof && content.trim().length > 0;

  return (
    <div className="space-y-6">
      {/* Security Alert */}
      {showSecurityInfo && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card border border-accent/30 bg-accent/10 p-4 rounded-lg"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <Shield className="text-accent mt-0.5 flex-shrink-0" size={20} />
              <div>
                <h3 className="font-semibold text-accent mb-1">Complete Anonymity Guaranteed</h3>
                <p className="text-text-secondary text-sm">
                  Your identity is protected by zero-knowledge proofs. Even we cannot determine who you are. 
                  Save your proof securely to claim royalties later.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowSecurityInfo(false)}
              className="text-text-muted hover:text-text-primary transition-colors"
            >
              <EyeOff size={16} />
            </button>
          </div>
        </motion.div>
      )}

      {/* Editor Card */}
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Shield className="text-accent" />
          Create Anonymous Poem
        </h2>

        {/* Title Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2 text-text-primary">
            Poem Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Give your anonymous poem a title..."
            className="input-field"
            disabled={isGeneratingProof || isPublishing}
          />
        </div>

        {/* Content Editor */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-text-primary">
              Your Poem
            </label>
            <div className="text-sm text-text-muted">
              {content.length} characters
              {content.length < 50 && ` (minimum 50 required)`}
            </div>
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your poem here... Your words will be published completely anonymously. No one will ever know you wrote this, but you'll be able to prove ownership to claim royalties."
            className="input-field min-h-[300px] resize-none font-serif text-lg leading-relaxed placeholder:text-text-muted/50"
            disabled={isGeneratingProof || isPublishing}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4">
          <Button
            variant="primary"
            icon={Shield}
            loading={isGeneratingProof}
            onClick={handleGenerateProof}
            disabled={!canGenerateProof || isGeneratingProof}
          >
            {isGeneratingProof ? 'Generating ZK Proof...' : 'Generate Anonymous Proof'}
          </Button>

          <Button
            variant="primary"
            icon={FileText}
            loading={isPublishing}
            onClick={handlePublish}
            disabled={!canPublish || isPublishing}
          >
            {isPublishing ? 'Publishing Anonymously...' : 'Publish Anonymously'}
          </Button>
        </div>

        {/* Requirements */}
        <div className="mt-4 p-3 bg-white/5 rounded-lg border border-white/10">
          <h4 className="text-sm font-medium mb-2 text-text-primary">Requirements:</h4>
          <ul className="text-sm text-text-secondary space-y-1">
            <li className={`flex items-center gap-2 ${title.trim().length > 0 ? 'text-accent' : ''}`}>
              • Title must not be empty
            </li>
            <li className={`flex items-center gap-2 ${content.length >= 50 ? 'text-accent' : ''}`}>
              • Poem must be at least 50 characters
            </li>
            <li className="flex items-center gap-2">
              • ZK proof must be generated before publishing
            </li>
          </ul>
        </div>
      </Card>

      {/* Generating Proof Animation */}
      {isGeneratingProof && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card p-6 text-center"
        >
          <motion.div
            animate={{ 
              rotate: 360,
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              rotate: { duration: 2, repeat: Infinity, ease: "linear" },
              scale: { duration: 1.5, repeat: Infinity }
            }}
            className="w-16 h-16 bg-gradient-90 from-accent to-primary rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <Shield size={24} className="text-white" />
          </motion.div>
          
          <h3 className="text-xl font-bold mb-2">Generating Zero-Knowledge Proof</h3>
          <p className="text-text-secondary mb-4">
            Creating cryptographic proof of authorship without revealing your identity...
          </p>
          
          <div className="space-y-2 text-sm text-text-muted max-w-md mx-auto">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              ✓ Hashing poem content
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              ✓ Generating commitment signature
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
            >
              ⏳ Creating nullifier proof
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2 }}
            >
              ○ Finalizing ZK-SNARK
            </motion.p>
          </div>
        </motion.div>
      )}
    </div>
  );
}