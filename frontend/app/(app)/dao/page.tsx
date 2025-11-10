// app/dao/page.tsx
"use client";
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Gem, Vote, Building2, Users, Plus, TrendingUp } from 'lucide-react';
import { ProposalList } from '@/components/dao/ProposalList';
import { TreasuryOverview } from '@/components/dao/TreasuryOverview';
import { VotingPowerCard } from '@/components/dao/VotingPowerCard';
import { CreateProposalModal } from '@/components/dao/CreateProposalModal';
import { useDAOStore } from '@/lib/store/dao-store';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ProposalStats } from '@/components/dao/ProposalStats';

export default function DAOPage() {
  const [activeTab, setActiveTab] = useState<'proposals' | 'treasury' | 'delegation'>('proposals');
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  const {
    proposals,
    activeProposals,
    treasury,
    userVotingPower,
    loadProposals,
    loadTreasury,
    loadUserVotingPower,
  } = useDAOStore();

  useEffect(() => {
    loadProposals();
    loadTreasury();
    loadUserVotingPower('current_user');
  }, [loadProposals, loadTreasury, loadUserVotingPower]);

  const stats = [
    {
      icon: Vote,
      label: 'Active Proposals',
      value: activeProposals.length.toString(),
      color: 'text-primary',
      change: '+2 this week',
    },
    {
      icon: Users,
      label: 'Total Voters',
      value: '892',
      color: 'text-secondary',
      change: 'Community members',
    },
    {
      icon: Building2,
      label: 'Treasury',
      value: treasury ? `${treasury.totalBalance} ETH` : 'Loading...',
      color: 'text-accent',
      change: treasury ? `$${treasury.balanceUSD.toLocaleString()}` : '',
    },
    {
      icon: Gem,
      label: 'Your Voting Power',
      value: userVotingPower.toLocaleString(),
      color: 'text-warning',
      change: 'Based on contributions',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="text-4xl font-bold gradient-text mb-2">DAO Governance</h1>
          <p className="text-text-secondary text-lg">
            Shape the future of Collective Poetry. Vote on proposals and manage the community treasury.
          </p>
        </div>
        
        <Button
          variant="primary"
          icon={Plus}
          onClick={() => setShowCreateModal(true)}
        >
          New Proposal
        </Button>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
      >
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-6 text-center hover:bg-white/10 transition-colors">
                <Icon size={32} className={`mx-auto mb-3 ${stat.color}`} />
                <div className={`text-2xl font-bold ${stat.color} mb-1`}>
                  {stat.value}
                </div>
                <div className="text-sm font-medium text-text-primary mb-1">
                  {stat.label}
                </div>
                <div className="text-xs text-text-muted">
                  {stat.change}
                </div>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-8">
          {/* Navigation Tabs */}
          <div className="flex space-x-1 glass-card p-1 rounded-lg">
            {[
              { id: 'proposals', label: 'Proposals', icon: Vote },
              { id: 'treasury', label: 'Treasury', icon: Building2 },
              { id: 'delegation', label: 'Delegation', icon: Users },
            ].map((tab) => {
              const Icon = tab.icon;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-md transition-all flex-1 justify-center ${
                    activeTab === tab.id
                      ? 'bg-primary text-white'
                      : 'text-text-muted hover:text-text-primary hover:bg-white/10'
                  }`}
                >
                  <Icon size={18} />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Content based on active tab */}
          {activeTab === 'proposals' && <ProposalList />}
          {activeTab === 'treasury' && <TreasuryOverview />}
          {activeTab === 'delegation' && <DelegationInterface />}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <VotingPowerCard />

          {/* Proposal Statistics */}
        <ProposalStats />
          
          {/* How DAO Works */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Gem className="text-primary" size={20} />
              How Governance Works
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-primary text-xs font-bold">1</span>
                </div>
                <p className="text-text-secondary">
                  Earn voting power through platform contributions
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-primary text-xs font-bold">2</span>
                </div>
                <p className="text-text-secondary">
                  Create or vote on proposals for platform improvements
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-primary text-xs font-bold">3</span>
                </div>
                <p className="text-text-secondary">
                  Successful proposals are executed automatically via smart contracts
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-primary text-xs font-bold">4</span>
                </div>
                <p className="text-text-secondary">
                  Track treasury usage and platform evolution
                </p>
              </div>
            </div>
          </Card>

          {/* Recent Activity */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Recent Activity</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-text-secondary">Proposal #4 Executed</span>
                <span className="text-accent font-medium">+1</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-secondary">New Voters</span>
                <span className="text-primary font-medium">+23</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-secondary">Treasury Growth</span>
                <span className="text-accent font-medium">+2.1 ETH</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-secondary">Delegations</span>
                <span className="text-warning font-medium">+5</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Create Proposal Modal */}
      {showCreateModal && (
        <CreateProposalModal onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  );
}

// Placeholder for delegation interface
function DelegationInterface() {
  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-4">Voting Power Delegation</h2>
      <p className="text-text-secondary mb-6">
        Delegate your voting power to trusted community members to participate in governance more effectively.
      </p>
      <div className="text-center py-8">
        <Users size={48} className="text-text-muted mx-auto mb-4" />
        <p className="text-text-secondary">Delegation interface coming soon</p>
      </div>
    </Card>
  );
}