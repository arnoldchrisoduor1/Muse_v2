"use client";
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, AlertTriangle, Check, Globe, Shield, Zap } from 'lucide-react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useSoloPoetStore } from '@/lib/store/solo-poet-store';
import { LicenseType } from '@/lib/store/solo-poet-store';

export default function PublishPoemPage() {
  const params = useParams();
  const router = useRouter();
  const poemId = params.id as string;
  
  const { 
    drafts, 
    currentDraft,
    publishPoem,
    isPublishing,
    loadPoems 
  } = useSoloPoetStore();

  const [isLoading, setIsLoading] = useState(true);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [licenseType, setLicenseType] = useState<LicenseType>(LicenseType.ALL_RIGHTS_RESERVED);
  const [isAnonymous, setIsAnonymous] = useState(false);

  // Load the draft when the component mounts
  useEffect(() => {
    const loadDraft = async () => {
      setIsLoading(true);
      
      try {
        // First, ensure we have the latest poems
        await loadPoems();
        
        // Find the draft in the store
        const draftToPublish = drafts.find(draft => draft.id === poemId);
        
        if (draftToPublish) {
          // Set as current draft for publishing
          useSoloPoetStore.setState({ currentDraft: draftToPublish });
          // Set initial values from draft
          setLicenseType(draftToPublish.licenseType || LicenseType.ALL_RIGHTS_RESERVED);
          setIsAnonymous(draftToPublish.isAnonymous || false);
        } else {
          console.error('Draft not found');
          router.push('/create');
          return;
        }
      } catch (error) {
        console.error('Error loading draft:', error);
        router.push('/create');
      } finally {
        setIsLoading(false);
      }
    };

    if (poemId) {
      loadDraft();
    }
  }, [poemId, router, loadPoems]);

  const handlePublish = async () => {
    if (!currentDraft) return;

    try {
      // Update the draft with publishing options
      const publishDraft = {
        ...currentDraft,
        licenseType,
        isAnonymous,
        publishNow: true
      };

      await publishPoem(publishDraft);
      
      // Redirect to published poems or success page
      router.push('/create?published=true');
    } catch (error) {
      console.error('Failed to publish poem:', error);
      alert('Failed to publish poem. Please try again.');
    }
  };

  const licenseOptions = [
    {
      value: LicenseType.ALL_RIGHTS_RESERVED,
      label: 'All Rights Reserved',
      description: 'Traditional copyright protection. Others cannot reuse without permission.',
      icon: Shield,
    },
    {
      value: LicenseType.CC_BY,
      label: 'CC BY',
      description: 'Others can reuse with attribution to you',
      icon: Globe,
    },
    {
      value: LicenseType.CC_BY_NC,
      label: 'CC BY-NC',
      description: 'Non-commercial reuse with attribution',
      icon: Zap,
    },
    {
      value: LicenseType.CC_BY_SA,
      label: 'CC BY-SA',
      description: 'Share alike - others must use same license',
      icon: Globe,
    },
    {
      value: LicenseType.PUBLIC_DOMAIN,
      label: 'Public Domain',
      description: 'No rights reserved - free for anyone to use',
      icon: Globe,
    },
  ];

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-700 rounded w-1/2 mb-8"></div>
          <div className="h-64 bg-gray-700 rounded mb-4"></div>
        </div>
      </div>
    );
  }

  if (!currentDraft) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold mb-4">Draft Not Found</h2>
          <p className="text-text-secondary mb-6">
            The draft you're trying to publish doesn't exist.
          </p>
          <Link href="/create">
            <Button variant="primary" icon={ArrowLeft}>
              Back to Create
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-4 mb-4">
          <Link href={`/poem/edit/${poemId}`}>
            <Button variant="primary" icon={ArrowLeft}>
              Back to Edit
            </Button>
          </Link>
          <h1 className="text-3xl font-bold gradient-text">Publish Your Poem</h1>
        </div>
        <p className="text-text-secondary">
          Review your poem and choose publishing options. Once published, you won't be able to edit the content.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Poem Preview */}
        <div className="lg:col-span-2 space-y-6">
          {/* Poem Preview */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4 text-lg">Poem Preview</h3>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-text-secondary mb-2">Title</h4>
                <p className="text-lg font-semibold">{currentDraft.title || 'Untitled'}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-text-secondary mb-2">Content</h4>
                <div className="bg-background/50 p-4 rounded-lg border border-white/10">
                  <pre className="whitespace-pre-wrap font-serif text-text-primary leading-relaxed">
                    {currentDraft.content || 'No content yet...'}
                  </pre>
                </div>
              </div>
              {currentDraft.tags && currentDraft.tags.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-text-secondary mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {currentDraft.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-primary/20 text-primary text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Important Notice */}
          <Card className="p-6 border-yellow-500/30 bg-yellow-500/10">
            <div className="flex items-start gap-3">
              <AlertTriangle className="text-yellow-500 mt-0.5 shrink-0" size={20} />
              <div>
                <h4 className="font-semibold text-yellow-500 mb-2">Important Notice</h4>
                <p className="text-text-secondary text-sm">
                  Once published, your poem will be permanently recorded on the blockchain and cannot be edited or deleted. 
                  Please review your poem carefully before publishing.
                </p>
                <ul className="text-text-secondary text-sm mt-2 space-y-1">
                  <li>• Content cannot be modified after publishing</li>
                  <li>• Poem will be publicly visible in discovery feeds</li>
                  <li>• You will receive an NFT representing your work</li>
                  <li>• Published poems are eligible for revenue sharing</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column - Publishing Options */}
        <div className="space-y-6">
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
                      {isSelected && <Check size={16} className="text-primary shrink-0" />}
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
              onClick={() => setShowConfirmation(true)}
              disabled={isPublishing || !currentDraft.content.trim()}
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
              {currentDraft.qualityScore && currentDraft.qualityScore >= 85 && (
                <div className="flex items-center gap-2 text-accent">
                  <Check size={12} />
                  <span>Qualified for Collective training</span>
                </div>
              )}
            </div>
          </Card>

          {/* Quality Score */}
          {currentDraft.qualityScore && (
            <Card className="p-6">
              <h3 className="font-semibold mb-3">Quality Score</h3>
              <div className="flex items-center gap-4">
                <div className={`text-2xl font-bold ${
                  currentDraft.qualityScore >= 85 ? 'text-accent' :
                  currentDraft.qualityScore >= 70 ? 'text-primary' :
                  'text-warning'
                }`}>
                  {currentDraft.qualityScore}%
                </div>
                <div className="text-sm text-text-secondary">
                  {currentDraft.qualityScore >= 85 ? 'Excellent quality' :
                   currentDraft.qualityScore >= 70 ? 'Good quality' :
                   'Needs improvement'}
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-bg-primary border border-white/20 rounded-xl p-6 max-w-md w-full"
          >
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="text-yellow-500" size={24} />
              <h3 className="text-lg font-semibold">Confirm Publication</h3>
            </div>
            
            <p className="text-text-secondary mb-6">
              Are you sure you want to publish this poem? Once published, you won't be able to edit the content and it will be permanently recorded on the blockchain.
            </p>

            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mb-6">
              <p className="text-yellow-500 text-sm font-medium text-center">
                This action cannot be undone
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="primary"
                className="flex-1"
                onClick={() => setShowConfirmation(false)}
                disabled={isPublishing}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                onClick={handlePublish}
                loading={isPublishing}
                disabled={isPublishing}
              >
                Yes, Publish Now
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}