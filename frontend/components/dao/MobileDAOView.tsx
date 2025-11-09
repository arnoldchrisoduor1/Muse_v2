
"use client";
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Vote, Building2, Users, ChevronDown, ChevronUp } from 'lucide-react';
import { useDAOStore } from '@/lib/store/dao-store';
import { ProposalCard } from '@/components/dao/ProposalCard';
import { Card } from '@/components/ui/Card';

export function MobileDAOView() {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const { proposals, treasury, userVotingPower } = useDAOStore();

  const sections = [
    {
      id: 'proposals',
      title: 'Active Proposals',
      icon: Vote,
      count: proposals.filter(p => p.status === 'active').length,
    },
    {
      id: 'treasury',
      title: 'Treasury Overview',
      icon: Building2,
      count: treasury ? `${treasury.totalBalance} ETH` : '0 ETH',
    },
    {
      id: 'voting',
      title: 'Your Voting Power',
      icon: Users,
      count: `${userVotingPower.toLocaleString()} votes`,
    },
  ];

  const activeProposals = proposals.filter(p => p.status === 'active');

  return (
    <div className="space-y-4 md:hidden">
      {sections.map((section) => {
        const Icon = section.icon;
        const isExpanded = expandedSection === section.id;
        
        return (
          <Card key={section.id} className="p-4">
            <button
              onClick={() => setExpandedSection(isExpanded ? null : section.id)}
              className="flex items-center justify-between w-full"
            >
              <div className="flex items-center gap-3">
                <Icon size={20} className="text-primary" />
                <div className="text-left">
                  <div className="font-semibold text-text-primary">
                    {section.title}
                  </div>
                  <div className="text-sm text-text-muted">
                    {section.count}
                  </div>
                </div>
              </div>
              {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>

            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-4"
              >
                {section.id === 'proposals' && (
                  <div className="space-y-3">
                    {activeProposals.map((proposal, index) => (
                      <ProposalCard key={proposal.id} proposal={proposal} />
                    ))}
                    {activeProposals.length === 0 && (
                      <p className="text-text-secondary text-sm text-center py-4">
                        No active proposals
                      </p>
                    )}
                  </div>
                )}

                {section.id === 'treasury' && treasury && (
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-text-muted">Total Balance</span>
                      <span className="text-text-primary font-medium">
                        {treasury.totalBalance} ETH
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-muted">USD Value</span>
                      <span className="text-text-primary font-medium">
                        ${treasury.balanceUSD.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-muted">Active Proposals</span>
                      <span className="text-text-primary font-medium">
                        {treasury.activeProposals}
                      </span>
                    </div>
                  </div>
                )}

                {section.id === 'voting' && (
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-text-muted">Total Power</span>
                      <span className="text-text-primary font-medium">
                        {userVotingPower.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-muted">Influence</span>
                      <span className="text-text-primary font-medium">
                        {((userVotingPower / 500000) * 100).toFixed(2)}%
                      </span>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </Card>
        );
      })}
    </div>
  );
}