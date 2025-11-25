"use client";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, Percent, CheckCircle } from 'lucide-react';
import { useCollaborationStore } from '@/lib/store/collaboration-store';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

interface OwnershipProposalModalProps {
  session: any;
  onClose: () => void;
}

export function OwnershipProposalModal({ session, onClose }: OwnershipProposalModalProps) {
  const [splits, setSplits] = useState<{ userId: string; percentage: number }[]>(
    session.participants
      .filter((p: any) => p.approvalStatus === 'approved')
      .map((p: any) => ({
        userId: p.userId,
        percentage: p.sharePercentage
      }))
  );
  
  const { proposeOwnership } = useCollaborationStore();

  const handlePercentageChange = (userId: string, percentage: number) => {
    const newSplits = splits.map(split =>
      split.userId === userId ? { ...split, percentage } : split
    );
    setSplits(newSplits);
  };

  const handlePropose = async () => {
    const total = splits.reduce((sum, split) => sum + split.percentage, 0);
    if (total !== 100) {
      alert('Total percentage must equal 100%');
      return;
    }

    try {
      await proposeOwnership(session.id, splits);
      onClose();
    } catch (error) {
      console.error('Failed to propose ownership:', error);
    }
  };

  const totalPercentage = splits.reduce((sum, split) => sum + split.percentage, 0);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="glass-card max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Users className="text-primary" />
              Ownership Proposal
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            <div className="text-text-secondary">
              Propose ownership percentages for all collaborators. Total must equal 100%.
            </div>

            {/* Current Splits */}
            <Card className="p-4">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Percent className="text-secondary" />
                Ownership Distribution
              </h3>
              
              <div className="space-y-3">
                {splits.map((split) => {
                  const collaborator = session.participants.find((p: any) => p.userId === split.userId);
                  return (
                    <div key={split.userId} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                          <Users size={16} className="text-primary" />
                        </div>
                        <span className="font-medium">{collaborator?.username}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={split.percentage}
                          onChange={(e) => handlePercentageChange(split.userId, Number(e.target.value))}
                          className="w-20 p-2 bg-background border border-gray-700 rounded text-center"
                        />
                        <span className="text-text-muted">%</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Total */}
              <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                <span className="font-semibold">Total</span>
                <div className={`flex items-center gap-2 ${totalPercentage === 100 ? 'text-accent' : 'text-error'}`}>
                  <span className="font-bold">{totalPercentage}%</span>
                  {totalPercentage === 100 && <CheckCircle size={16} />}
                </div>
              </div>

              {totalPercentage !== 100 && (
                <div className="mt-2 text-error text-sm">
                  Total must equal 100%. Current: {totalPercentage}%
                </div>
              )}
            </Card>

            {/* Info */}
            <Card className="p-4 bg-primary/10 border-primary/20">
              <h4 className="font-semibold text-primary mb-2">How Ownership Works</h4>
              <ul className="text-sm text-text-secondary space-y-1">
                <li>• All collaborators must approve the proposal</li>
                <li>• Revenue from the poem will be split according to these percentages</li>
                <li>• Changes require unanimous approval from all collaborators</li>
                <li>• Once approved, ownership is recorded on the blockchain</li>
              </ul>
            </Card>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-white/10">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            
            <Button
              variant="primary"
              onClick={handlePropose}
              disabled={totalPercentage !== 100}
              icon={Users}
            >
              Propose Ownership
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}