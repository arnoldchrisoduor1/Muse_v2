"use client";
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Vote, Clock, Check, X, Users, Sparkles, Settings, Zap, ExternalLink, ArrowUp, ArrowDown } from 'lucide-react';
import { useDAOStore } from '@/lib/store/dao-store';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface ProposalCardProps {
  proposal: any;
}

export function ProposalCard({ proposal }: ProposalCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedVote, setSelectedVote] = useState<'for' | 'against' | 'abstain' | null>(null);
  const [voteReasoning, setVoteReasoning] = useState('');
  
  const { voteOnProposal, executeProposal, isVoting, isExecuting, userAvailablePower } = useDAOStore();

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return Clock;
      case 'passed': return Check;
      case 'executed': return Check;
      case 'rejected': return X;
      case 'draft': return Clock;
      default: return Clock;
    }
  };

  const TypeIcon = getProposalTypeIcon(proposal.proposalType);
  const StatusIcon = getStatusIcon(proposal.status);

  const totalVotes = proposal.votesFor + proposal.votesAgainst + proposal.votesAbstain;
  const forPercentage = totalVotes > 0 ? (proposal.votesFor / totalVotes) * 100 : 0;
  const againstPercentage = totalVotes > 0 ? (proposal.votesAgainst / totalVotes) * 100 : 0;
  const abstainPercentage = totalVotes > 0 ? (proposal.votesAbstain / totalVotes) * 100 : 0;

  const quorumReached = totalVotes >= (proposal.quorumRequired / 100) * proposal.totalVotingPower;
  const willPass = forPercentage >= proposal.approvalThreshold && quorumReached;

  const handleVote = async () => {
    if (!selectedVote) return;
    await voteOnProposal(proposal.id, selectedVote, voteReasoning || undefined);
    setSelectedVote(null);
    setVoteReasoning('');
  };

  const handleExecute = async () => {
    await executeProposal(proposal.id);
  };

  const isVotingActive = proposal.status === 'active' && new Date() >= proposal.votingStartsAt && new Date() <= proposal.votingEndsAt;
  const canExecute = proposal.status === 'passed' && !proposal.executedAt;

  return (
    <Card className="p-6 hover:bg-white/10 transition-all duration-300">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <TypeIcon size={20} className="text-primary" />
            <h3 className="text-xl font-semibold text-text-primary line-clamp-2">
              {proposal.title}
            </h3>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-text-muted">
            <div className="flex items-center gap-1">
              <Users size={14} />
              <span>by {proposal.proposer.username}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock size={14} />
              <span>
                {proposal.status === 'active' 
                  ? `Ends ${new Date(proposal.votingEndsAt).toLocaleDateString()}`
                  : new Date(proposal.createdAt).toLocaleDateString()
                }
              </span>
            </div>
            <div className={`flex items-center gap-1 ${getStatusColor(proposal.status)}`}>
              <StatusIcon size={14} />
              <span className="capitalize">{proposal.status}</span>
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(proposal.status)} bg-white/10 border ${getStatusColor(proposal.status).replace('text-', 'border-')}/30`}>
          {proposal.status.toUpperCase()}
        </div>
      </div>

      {/* Description */}
      <p className="text-text-secondary mb-4 line-clamp-3">
        {proposal.description}
      </p>

      {/* Voting Progress */}
      {proposal.status === 'active' && (
        <div className="mb-4 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-text-muted">Voting Progress</span>
            <span className="text-text-primary">
              {totalVotes.toLocaleString()} / {proposal.totalVotingPower.toLocaleString()} votes
            </span>
          </div>
          
          <div className="space-y-2">
            {/* For Votes */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 w-20">
                <Check size={14} className="text-accent" />
                <span className="text-sm text-text-muted">For</span>
              </div>
              <div className="flex-1 bg-white/10 rounded-full h-2">
                <div 
                  className="h-2 rounded-full bg-accent transition-all duration-500"
                  style={{ width: `${forPercentage}%` }}
                />
              </div>
              <div className="text-sm text-text-primary w-16 text-right">
                {forPercentage.toFixed(1)}%
              </div>
            </div>

            {/* Against Votes */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 w-20">
                <X size={14} className="text-error" />
                <span className="text-sm text-text-muted">Against</span>
              </div>
              <div className="flex-1 bg-white/10 rounded-full h-2">
                <div 
                  className="h-2 rounded-full bg-error transition-all duration-500"
                  style={{ width: `${againstPercentage}%` }}
                />
              </div>
              <div className="text-sm text-text-primary w-16 text-right">
                {againstPercentage.toFixed(1)}%
              </div>
            </div>

            {/* Abstain Votes */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 w-20">
                <Clock size={14} className="text-warning" />
                <span className="text-sm text-text-muted">Abstain</span>
              </div>
              <div className="flex-1 bg-white/10 rounded-full h-2">
                <div 
                  className="h-2 rounded-full bg-warning transition-all duration-500"
                  style={{ width: `${abstainPercentage}%` }}
                />
              </div>
              <div className="text-sm text-text-primary w-16 text-right">
                {abstainPercentage.toFixed(1)}%
              </div>
            </div>
          </div>

          {/* Quorum and Threshold */}
          <div className="flex justify-between text-xs text-text-muted">
            <span>Quorum: {proposal.quorumRequired}% {quorumReached ? '✓' : '✗'}</span>
            <span>Threshold: {proposal.approvalThreshold}% {willPass ? '✓' : '✗'}</span>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-white/10">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Show Less' : 'Show More'}
          </Button>

          {proposal.discussionUrl && (
            <Button
              variant="outline"
              size="sm"
              icon={ExternalLink}
              onClick={() => window.open(proposal.discussionUrl, '_blank')}
            >
              Discuss
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isVotingActive && (
            <Button
              variant="primary"
              size="sm"
              icon={Vote}
              onClick={() => setIsExpanded(true)}
            >
              Vote ({userAvailablePower.toLocaleString()})
            </Button>
          )}

          {canExecute && (
            <Button
              variant="primary"
              size="sm"
              loading={isExecuting}
              onClick={handleExecute}
            >
              Execute
            </Button>
          )}
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-4 space-y-4"
        >
          {/* Detailed Description */}
          <div>
            <h4 className="font-semibold mb-2">Proposal Details</h4>
            <p className="text-text-secondary text-sm leading-relaxed">
              {proposal.description}
            </p>
          </div>

          {/* Proposal Specific Details */}
          {proposal.requestedAmount && (
            <div>
              <h4 className="font-semibold mb-2">Funding Request</h4>
              <p className="text-text-secondary text-sm">
                Amount: {proposal.requestedAmount} ETH (${(proposal.requestedAmount * 3000).toLocaleString()})
              </p>
            </div>
          )}

          {proposal.recipients && (
            <div>
              <h4 className="font-semibold mb-2">Recipients</h4>
              <div className="flex flex-wrap gap-2">
                {proposal.recipients.map((recipient: string) => (
                  <span
                    key={recipient}
                    className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full"
                  >
                    {recipient}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Voting Interface */}
          {isVotingActive && (
            <div className="p-4 bg-white/5 rounded-lg border border-white/10">
              <h4 className="font-semibold mb-3">Cast Your Vote</h4>
              <div className="space-y-3">
                <div className="flex gap-2">
                  {[
                    { value: 'for', label: 'For', icon: ArrowUp, color: 'text-accent' },
                    { value: 'against', label: 'Against', icon: ArrowDown, color: 'text-error' },
                    { value: 'abstain', label: 'Abstain', icon: Clock, color: 'text-warning' },
                  ].map((option) => {
                    const Icon = option.icon;
                    const isSelected = selectedVote === option.value;
                    
                    return (
                      <button
                        key={option.value}
                        onClick={() => setSelectedVote(option.value as any)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all flex-1 justify-center ${
                          isSelected
                            ? `${option.color.replace('text-', 'border-')} bg-white/10`
                            : 'border-white/10 text-text-muted hover:text-text-primary'
                        }`}
                      >
                        <Icon size={16} />
                        <span>{option.label}</span>
                      </button>
                    );
                  })}
                </div>

                {selectedVote && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Reasoning (Optional)
                      </label>
                      <textarea
                        value={voteReasoning}
                        onChange={(e) => setVoteReasoning(e.target.value)}
                        placeholder="Share your thoughts on this proposal..."
                        className="input-field text-sm min-h-[80px] resize-none"
                      />
                    </div>

                    <Button
                      variant="primary"
                      loading={isVoting}
                      onClick={handleVote}
                      className="w-full"
                      icon={Vote}
                    >
                      Cast Vote ({userAvailablePower.toLocaleString()} votes)
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </Card>
  );
}