"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Settings, Eye, EyeOff } from 'lucide-react';
import { useSoloPoetStore } from '@/lib/store/solo-poet-store';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { AISuggestionsPanel } from '@/components/ai/AISuggestionsPanel';
import { QualityScoreCard } from '@/components/ai/QualityScoreCard';
import { PublishingOptions } from '@/components/poem/PublishingOptions';

export function PoemEditor() {
  const { 
    currentDraft, 
    updateDraft, 
    generateAIFeedback, 
    isGeneratingFeedback,
    publishPoem,
    isPublishing 
  } = useSoloPoetStore();
  
  const [showAISuggestions, setShowAISuggestions] = useState(true);
  const [wordCount, setWordCount] = useState(0);
  const [characterCount, setCharacterCount] = useState(0);

  // Update word and character counts
  useEffect(() => {
    if (currentDraft?.content) {
      const words = currentDraft.content.trim().split(/\s+/).filter(word => word.length > 0);
      setWordCount(words.length);
      setCharacterCount(currentDraft.content.length);
    } else {
      setWordCount(0);
      setCharacterCount(0);
    }
  }, [currentDraft?.content]);

  const handleContentChange = (content: string) => {
    updateDraft({ content });
  };

  const handleTitleChange = (title: string) => {
    updateDraft({ title });
  };

  const handleGetFeedback = async () => {
    if (currentDraft?.content) {
      await generateAIFeedback();
      setShowAISuggestions(true);
    }
  };

  const handlePublish = async () => {
    if (currentDraft) {
      await publishPoem(currentDraft);
    }
  };

  if (!currentDraft) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-secondary">Loading editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Editor Column */}
      <div className="lg:col-span-2 space-y-6">
        {/* Title Input */}
        <Card className="p-6">
          <label className="block text-sm font-medium mb-3 text-text-primary">
            Poem Title
          </label>
          <input
            type="text"
            value={currentDraft.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Give your poem a captivating title..."
            className="input-field text-xl font-bold"
          />
        </Card>
        
        {/* Content Editor */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <label className="block text-sm font-medium text-text-primary">
              Your Poem
            </label>
            <div className="flex items-center gap-4 text-sm text-text-muted">
              <span>{wordCount} words</span>
              <span>{characterCount} characters</span>
            </div>
          </div>
          
          <textarea
            value={currentDraft.content}
            onChange={(e) => handleContentChange(e.target.value)}
            placeholder="Begin your poetic journey... Let the words flow naturally. Don't worry about perfection - you can refine with AI help later."
            className="input-field min-h-[400px] resize-none font-serif text-lg leading-relaxed placeholder:text-text-muted/50"
          />
          
          {/* Editor Actions */}
          <div className="flex flex-wrap gap-3 mt-4">
            <Button 
              variant="primary" 
              icon={Sparkles}
              loading={isGeneratingFeedback}
              onClick={handleGetFeedback}
              disabled={!currentDraft.content.trim() || currentDraft.content.length < 50}
            >
              {isGeneratingFeedback ? 'Analyzing...' : 'Get AI Feedback'}
            </Button>
            
            <Button 
              variant="outline"
              icon={showAISuggestions ? EyeOff : Eye}
              onClick={() => setShowAISuggestions(!showAISuggestions)}
            >
              {showAISuggestions ? 'Hide Suggestions' : 'Show Suggestions'}
            </Button>
          </div>
        </Card>
      </div>
      
      {/* Sidebar */}
      <div className="space-y-6">
        <AnimatePresence>
          {showAISuggestions && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <AISuggestionsPanel />
            </motion.div>
          )}
        </AnimatePresence>
        
        <QualityScoreCard />
        
        <PublishingOptions 
          onPublish={handlePublish}
          isPublishing={isPublishing}
          canPublish={!!currentDraft.content.trim() && currentDraft.content.length >= 50}
        />
      </div>
    </div>
  );
}