"use client";
import { motion } from 'framer-motion';
import { Sparkles, Check, X } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useSoloPoetStore } from '@/lib/store/solo-poet-store';

export function AISuggestionsPanel() {
  const { aiSuggestions, isGeneratingFeedback, currentDraft, updateDraft } = useSoloPoetStore();

  const handleApplySuggestion = (suggestionId: string) => {
    if (!currentDraft) return;
    
    const updatedSuggestions = currentDraft.aiSuggestions.map(suggestion =>
      suggestion.id === suggestionId 
        ? { ...suggestion, applied: true }
        : suggestion
    );
    
    updateDraft({ aiSuggestions: updatedSuggestions });
  };

  const handleDismissSuggestion = (suggestionId: string) => {
    if (!currentDraft) return;
    
    const updatedSuggestions = currentDraft.aiSuggestions.filter(
      suggestion => suggestion.id !== suggestionId
    );
    
    updateDraft({ aiSuggestions: updatedSuggestions });
  };

  if (isGeneratingFeedback) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="text-secondary" size={20} />
          <h3 className="font-semibold">AI Analysis</h3>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((item) => (
            <motion.div
              key={item}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: item * 0.1 }}
              className="flex gap-3"
            >
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-white/10 rounded animate-pulse" />
                <div className="h-3 bg-white/5 rounded animate-pulse w-3/4" />
              </div>
            </motion.div>
          ))}
        </div>
      </Card>
    );
  }

  if (!aiSuggestions.length && !isGeneratingFeedback) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="text-secondary" size={20} />
          <h3 className="font-semibold">AI Suggestions</h3>
        </div>
        <p className="text-text-secondary text-sm">
          Click "Get AI Feedback" to receive writing suggestions and quality analysis.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <Sparkles className="text-secondary" size={20} />
        <h3 className="font-semibold">AI Suggestions</h3>
        <span className="text-xs bg-secondary/20 text-secondary px-2 py-1 rounded-full">
          {aiSuggestions.length} suggestions
        </span>
      </div>
      
      <div className="space-y-4">
        {aiSuggestions.map((suggestion, index) => (
          <motion.div
            key={suggestion.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-3 rounded-lg border ${
              suggestion.applied 
                ? 'border-accent/30 bg-accent/10' 
                : 'border-white/10 bg-white/5'
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <span className="text-xs font-medium bg-primary/20 text-primary px-2 py-1 rounded">
                {suggestion.type.replace('_', ' ')}
              </span>
              {!suggestion.applied && (
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    className="!p-1 h-6 w-6"
                    onClick={() => handleApplySuggestion(suggestion.id)}
                  >
                    <Check size={12} />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="!p-1 h-6 w-6"
                    onClick={() => handleDismissSuggestion(suggestion.id)}
                  >
                    <X size={12} />
                  </Button>
                </div>
              )}
            </div>
            
            <p className="text-sm text-text-secondary mb-2">
              {suggestion.reasoning}
            </p>
            
            <div className="text-xs space-y-1">
              <p className="text-text-muted line-through">{suggestion.original}</p>
              <p className="text-accent">{suggestion.suggestion}</p>
            </div>
            
            {suggestion.applied && (
              <div className="flex items-center gap-1 mt-2 text-accent text-xs">
                <Check size={12} />
                Applied
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </Card>
  );
}