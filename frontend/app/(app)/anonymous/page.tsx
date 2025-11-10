"use client";
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Eye, EyeOff, Download, Copy } from 'lucide-react';
import { AnonymousPoemEditor } from '@/components/ananymous/AnonymousPoemEditor';
import { ZKProofDisplay } from '@/components/ananymous/ZKProofDisplay';
import { AnonymousIdentity } from '@/components/ananymous/AnonymousIdentity';
import { PublishedPoems } from '@/components/ananymous/PublishedPoems';
import { useAnonymousStore } from '@/lib/store/anonymous-store';
import { Card } from '@/components/ui/Card';

export default function AnonymousPage() {
  const { 
    generatedProof, 
    loadAnonymousIdentity, 
    anonymousIdentity,
    publishedPoems 
  } = useAnonymousStore();

  useEffect(() => {
    loadAnonymousIdentity();
  }, [loadAnonymousIdentity]);

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold gradient-text mb-4">
          Anonymous Publishing
        </h1>
        <p className="text-text-secondary text-lg max-w-2xl mx-auto">
          Share controversial or personal poetry without revealing your identity. 
          Zero-knowledge proofs protect your authorship while enabling royalty collection.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Editor Area */}
        <div className="lg:col-span-2 space-y-8">
          <AnonymousPoemEditor />
          
          {/* Proof Display */}
          {generatedProof && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <ZKProofDisplay />
            </motion.div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <AnonymousIdentity />
          
          {/* How It Works */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Shield className="text-accent" size={20} />
              How ZK-Proofs Protect You
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-accent/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <EyeOff size={12} className="text-accent" />
                </div>
                <p className="text-text-secondary">
                  Your identity is never stored or revealed
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-accent/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Download size={12} className="text-accent" />
                </div>
                <p className="text-text-secondary">
                  Cryptographic proof allows future royalty claims
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-accent/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Copy size={12} className="text-accent" />
                </div>
                <p className="text-text-secondary">
                  Nullifier prevents double-claiming while maintaining anonymity
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-accent/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Shield size={12} className="text-accent" />
                </div>
                <p className="text-text-secondary">
                  Even platform admins cannot determine authorship
                </p>
              </div>
            </div>
          </Card>

          {/* Security Features */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4 text-accent">Security Guarantees</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-text-secondary">Identity Protection</span>
                <span className="text-accent font-medium">100%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Ownership Proof</span>
                <span className="text-accent font-medium">Cryptographic</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Platform Knowledge</span>
                <span className="text-accent font-medium">Zero</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Claim Verification</span>
                <span className="text-accent font-medium">Instant</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Published Poems Section */}
      {publishedPoems.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12"
        >
          <PublishedPoems />
        </motion.div>
      )}
    </div>
  );
}