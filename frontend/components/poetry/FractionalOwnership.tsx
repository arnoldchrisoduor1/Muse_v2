"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, TrendingUp, AlertCircle, Plus, Trash2 } from 'lucide-react';
import { usePoetryStore } from '@/lib/store/poetry-store';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Collaborator } from '@/types/poetry';

export const FractionalOwnership: React.FC = () => {
  const [poemContent, setPoemContent] = useState('');
  const { collaborators, isLoading, updateCollaboratorShare, setCollaborators, createCollaborativePoem } = usePoetryStore();

  const totalShare = collaborators.reduce((sum, collab) => sum + collab.share, 0);
  const isValid = totalShare === 100 && poemContent.trim().length > 0;

  const handleShareChange = (userId: string, share: number) => {
    updateCollaboratorShare(userId, Math.max(0, Math.min(100, share)));
  };

  const addCollaborator = () => {
    const newCollaborator: Collaborator = {
        userId: Date.now().toString(),
        username: `poet_${Math.random().toString(36).substr(2, 5)}`,
        share: 0,
        joinedAt: new Date()
    };
    setCollaborators([...collaborators, newCollaborator]);
  };

  const removeCollaborator = (userId: string) => {
    if (collaborators.length <= 1) return;
    setCollaborators(collaborators.filter(collab => collab.userId !== userId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    await createCollaborativePoem(poemContent);
  };

  return (
    <div className="space-y-6">
      <Card glow className="p-6">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Users className="text-secondary" />
          Create Collaborative Poem
        </h2>
        
        <p className="text-text-secondary mb-6">
          Write poetry together with automatic revenue sharing via smart contracts.
          Each contributor owns a fraction of the NFT.
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Poem Content</label>
            <textarea
              value={poemContent}
              onChange={(e) => setPoemContent(e.target.value)}
              placeholder="Write your collaborative masterpiece..."
              className="input-field"
              rows={6}
            />
          </div>
          
          <CollaboratorManagement
            collaborators={collaborators}
            onShareChange={handleShareChange}
            onAddCollaborator={addCollaborator}
            onRemoveCollaborator={removeCollaborator}
            totalShare={totalShare}
          />
          
          <Button
            type="submit"
            loading={isLoading}
            disabled={!isValid}
            className="w-full"
            icon={Users}
          >
            Mint Fractional NFT
          </Button>
        </form>
      </Card>
      
      <RevenueDistribution collaborators={collaborators} />
    </div>
  );
};

interface CollaboratorManagementProps {
  collaborators: Collaborator[];
  onShareChange: (userId: string, share: number) => void;
  onAddCollaborator: () => void;
  onRemoveCollaborator: (userId: string) => void;
  totalShare: number;
}

const CollaboratorManagement: React.FC<CollaboratorManagementProps> = ({
  collaborators,
  onShareChange,
  onAddCollaborator,
  onRemoveCollaborator,
  totalShare,
}) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <label className="block text-sm font-medium">Contributors & Ownership</label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onAddCollaborator}
          icon={Plus}
        >
          Add Collaborator
        </Button>
      </div>
      
      <div className="space-y-3">
        <AnimatePresence>
          {collaborators.map((collab, index) => (
            <motion.div
              key={collab.userId}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-center gap-4 bg-white/5 p-4 rounded-lg">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-text-primary truncate">
                    {collab.username}
                  </div>
                  <div className="text-xs text-text-muted">User ID: {collab.userId}</div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={collab.share}
                      onChange={(e) => onShareChange(collab.userId, parseInt(e.target.value) || 0)}
                      className="w-20 bg-white/10 border border-border-muted rounded px-3 py-2 text-center text-text-primary focus:outline-none focus:border-primary"
                      min="0"
                      max="100"
                    />
                    <span className="text-text-muted w-8">%</span>
                  </div>
                  
                  {collaborators.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => onRemoveCollaborator(collab.userId)}
                      className="!p-2"
                    >
                      <Trash2 size={16} />
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      
      <div className="mt-3 text-sm text-text-muted flex items-center justify-between">
        <span>Total: {totalShare}%</span>
        {totalShare !== 100 && (
          <span className="text-warning flex items-center gap-1">
            <AlertCircle size={16} />
            Must equal 100%
          </span>
        )}
      </div>
    </div>
  );
};

interface RevenueDistributionProps {
  collaborators: Collaborator[];
}

const RevenueDistribution: React.FC<RevenueDistributionProps> = ({ collaborators }) => {
  const totalRevenue = 2.5; // Mock ETH amount

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <TrendingUp className="text-secondary" />
        Automatic Revenue Distribution
      </h3>
      
      <div className="space-y-3">
        <div className="flex justify-between items-center p-3 bg-white/5 rounded">
          <span className="text-text-primary">Total Revenue Generated</span>
          <span className="font-bold text-secondary">{totalRevenue} ETH</span>
        </div>
        
        <AnimatePresence>
          {collaborators.map((collab, index) => (
            <motion.div
              key={collab.userId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex justify-between items-center p-3 bg-white/5 rounded">
                <span className="text-text-primary">{collab.username}</span>
                <span className="text-text-muted">
                  {(totalRevenue * collab.share / 100).toFixed(3)} ETH ({collab.share}%)
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      
      <div className="mt-4 text-sm text-text-muted flex items-start gap-2">
        <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
        <span>
          Smart contract automatically distributes revenue proportionally to all owners.
          No manual intervention required.
        </span>
      </div>
    </Card>
  );
};