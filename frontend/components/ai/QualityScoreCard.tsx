"use client";
import { motion } from 'framer-motion';
import { TrendingUp, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { useSoloPoetStore } from '@/lib/store/solo-poet-store';

export function QualityScoreCard() {
  const { qualityScore, isGeneratingFeedback } = useSoloPoetStore();

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-accent';
    if (score >= 70) return 'text-primary';
    if (score >= 60) return 'text-warning';
    return 'text-error';
  };

  const getScoreMessage = (score: number) => {
    if (score >= 85) return 'Exceptional quality! Ready for Collective inclusion.';
    if (score >= 70) return 'Great work! This will resonate well with readers.';
    if (score >= 60) return 'Good foundation. Consider AI suggestions for improvement.';
    return 'Needs significant revision. Use AI feedback to enhance.';
  };

  if (isGeneratingFeedback) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp className="text-primary" size={20} />
          <h3 className="font-semibold">Quality Score</h3>
        </div>
        <div className="h-24 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </Card>
    );
  }

  if (!qualityScore) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp className="text-primary" size={20} />
          <h3 className="font-semibold">Quality Score</h3>
        </div>
        <p className="text-text-secondary text-sm">
          Get AI feedback to see your poem's quality score and improvement suggestions.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <TrendingUp className="text-primary" size={20} />
        <h3 className="font-semibold">Quality Score</h3>
      </div>
      
      <div className="text-center mb-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className={`text-4xl font-bold ${getScoreColor(qualityScore)} mb-2`}
        >
          {qualityScore}/100
        </motion.div>
        <div className="w-full bg-white/10 rounded-full h-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${qualityScore}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={`h-2 rounded-full ${
              qualityScore >= 85 ? 'bg-accent' :
              qualityScore >= 70 ? 'bg-primary' :
              qualityScore >= 60 ? 'bg-warning' : 'bg-error'
            }`}
          />
        </div>
      </div>
      
      <div className="text-center">
        <p className="text-sm text-text-secondary mb-2">
          {getScoreMessage(qualityScore)}
        </p>
        
        {qualityScore >= 85 && (
          <div className="flex items-center justify-center gap-2 text-accent text-sm">
            <AlertCircle size={16} />
            Eligible for Collective Consciousness!
          </div>
        )}
      </div>
    </Card>
  );
}