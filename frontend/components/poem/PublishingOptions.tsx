"use client";
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Globe, Shield, Zap, Check } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface PublishingOptionsProps {
  onPublish: () => void;
  isPublishing: boolean;
  canPublish: boolean;
}

export function PublishingOptions({ onPublish, isPublishing, canPublish }: PublishingOptionsProps) {
  const [licenseType, setLicenseType] = useState('all-rights-reserved');
  const [isAnonymous, setIsAnonymous] = useState(false);

  const qualityScore = 100;

  const licenseOptions = [
    {
      value: 'all-rights-reserved',
      label: 'All Rights Reserved',
      description: 'Traditional copyright protection',
      icon: Shield,
    },
    {
      value: 'cc-by',
      label: 'CC BY',
      description: 'Others can reuse with attribution',
      icon: Globe,
    },
    {
      value: 'cc-by-nc',
      label: 'CC BY-NC',
      description: 'Non-commercial reuse with attribution',
      icon: Zap,
    },
  ];

  return (
    <Card className="p-6">
      <h3 className="font-semibold mb-4">Publishing Options</h3>
      
      {/* License Type */}
      <div className="space-y-3 mb-6">
        <label className="text-sm font-medium text-text-primary">License Type</label>
        {licenseOptions.map((option) => {
          const Icon = option.icon;
          const isSelected = licenseType === option.value;
          
          return (
            <motion.button
              key={option.value}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setLicenseType(option.value)}
              className={`w-full p-3 rounded-lg border text-left transition-all ${
                isSelected
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-white/10 bg-white/5 text-text-secondary hover:bg-white/10'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded ${
                  isSelected ? 'bg-primary/20' : 'bg-white/5'
                }`}>
                  <Icon size={16} />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm">{option.label}</div>
                  <div className="text-xs text-text-muted">{option.description}</div>
                </div>
                {isSelected && <Check size={16} className="text-primary" />}
              </div>
            </motion.button>
          );
        })}
      </div>
      
      {/* Anonymous Toggle */}
      <div className="flex items-center justify-between p-3 rounded-lg border border-white/10 bg-white/5 mb-6">
        <div>
          <div className="font-medium text-sm">Post Anonymously</div>
          <div className="text-xs text-text-muted">
            Protect your identity with zero-knowledge proofs
          </div>
        </div>
        <button
          onClick={() => setIsAnonymous(!isAnonymous)}
          className={`w-12 h-6 rounded-full transition-all ${
            isAnonymous ? 'bg-accent' : 'bg-white/20'
          }`}
        >
          <motion.div
            animate={{ x: isAnonymous ? 24 : 4 }}
            className="w-4 h-4 bg-white rounded-full mt-1"
          />
        </button>
      </div>
      
      {/* Publish Button */}
      <Button
        variant="primary"
        className="w-full"
        loading={isPublishing}
        onClick={onPublish}
        disabled={!canPublish || isPublishing}
      >
        {isPublishing ? 'Publishing...' : 'Publish & Mint NFT'}
      </Button>
      
      {/* Publishing Benefits */}
      <div className="mt-4 space-y-2 text-xs text-text-muted">
        <div className="flex items-center gap-2">
          <Check size={12} />
          <span>Minted as verifiable NFT</span>
        </div>
        <div className="flex items-center gap-2">
          <Check size={12} />
          <span>Added to discovery feeds</span>
        </div>
        <div className="flex items-center gap-2">
          <Check size={12} />
          <span>Eligible for revenue sharing</span>
        </div>
        {qualityScore >= 85 && (
          <div className="flex items-center gap-2 text-accent">
            <Check size={12} />
            <span>Qualified for Collective training</span>
          </div>
        )}
      </div>
    </Card>
  );
}