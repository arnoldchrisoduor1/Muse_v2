"use client";
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Vote, Clock, Check, X, Zap, Users, Sparkles, Settings } from 'lucide-react';
import { useDAOStore } from '@/lib/store/dao-store';
import { ProposalCard } from '@/components/dao/ProposalCard';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export function ProposalList() {
  const [filter, setFilter] = useState<'all' | 'active' | 'draft' | 'passed' | 'executed'>('all');
  const { proposals, activeProposals } = useDAOStore();

  const filteredProposals = proposals.filter(proposal => {
    if (filter === 'all') return true;
    if (filter === 'active') return proposal.status === 'active';
    return proposal.status === filter;
  });

  const getProposalTypeIcon = (type: string) => {
    switch (type) {
      case 'grant': return Users;
      case 'treasury_allocation': return Sparkles;
      case 'platform_feature': return Settings;
      case 'collective_training': return Zap;
      case 'moderation': return Vote;
      default: return Vote;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-accent';
      case 'passed': return 'text-primary';
      case 'executed': return 'text-accent';
      case 'rejected': return 'text-error';
      case 'draft': return 'text-warning';
      default: return 'text-text-muted';
    }
  };

  const filters = [
    { id: 'all', label: 'All Proposals', count: proposals.length },
    { id: 'active', label: 'Active', count: activeProposals.length },
    { id: 'draft', label: 'Draft', count: proposals.filter(p => p.status === 'draft').length },
    { id: 'passed', label: 'Passed', count: proposals.filter(p => p.status === 'passed').length },
    { id: 'executed', label: 'Executed', count: proposals.filter(p => p.status === 'executed').length },
  ];

  if (proposals.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Vote size={48} className="text-text-muted mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No proposals yet</h3>
        <p className="text-text-secondary mb-4">
          Be the first to create a proposal and shape the platform's future.
        </p>
        <Button variant="primary" icon={Vote}>
          Create First Proposal
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <Card className="p-4">
        <div className="flex space-x-1">
          {filters.map((filterItem) => (
            <button
              key={filterItem.id}
              onClick={() => setFilter(filterItem.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all flex-1 justify-center ${
                filter === filterItem.id
                  ? 'bg-primary text-white'
                  : 'text-text-muted hover:text-text-primary hover:bg-white/10'
              }`}
            >
              <span className="font-medium">{filterItem.label}</span>
              <span className={`text-xs px-2 py-1 rounded-full ${
                filter === filterItem.id
                  ? 'bg-white/20 text-white'
                  : 'bg-white/10 text-text-muted'
              }`}>
                {filterItem.count}
              </span>
            </button>
          ))}
        </div>
      </Card>

      {/* Proposals Grid */}
      <div className="space-y-4">
        {filteredProposals.map((proposal, index) => (
          <motion.div
            key={proposal.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <ProposalCard proposal={proposal} />
          </motion.div>
        ))}
      </div>

      {/* No Results */}
      {filteredProposals.length === 0 && (
        <Card className="p-8 text-center">
          <Clock size={48} className="text-text-muted mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No proposals found</h3>
          <p className="text-text-secondary">
            Try selecting a different filter to see more proposals.
          </p>
        </Card>
      )}
    </div>
  );
}