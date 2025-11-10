"use client";
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Users, DollarSign, TrendingUp, Download, Filter, Sparkles } from 'lucide-react';
import { useStudioStore } from '@/lib/store/studio-store';
import { StudioHeader } from '@/components/studio/StudioHeader';
import { MetricsOverview } from '@/components/studio/MetricsOverview';
import { EarningsBreakdown } from '@/components/studio/EarningsBreakdown';
import { ContentPerformance } from '@/components/studio/ContentPerformance';
import { AudienceInsights } from '@/components/studio/AudienceInsights';
import { CollaborationAnalytics } from '@/components/studio/CollaborationAnalytics';
import { RevenueTrends } from '@/components/studio/RevenueTrends';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function StudioPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'content' | 'audience' | 'collaborations'>('overview');
  
  const {
    metrics,
    earningsBreakdown,
    revenueTrends,
    contentPerformance,
    audienceDemographics,
    collaborationInsights,
    timeFilter,
    isLoading,
    isExporting,
    loadStudioData,
    exportAnalytics,
    setTimeFilter,
  } = useStudioStore();

  useEffect(() => {
    loadStudioData();
  }, [loadStudioData]);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'content', label: 'Content', icon: Sparkles },
    { id: 'audience', label: 'Audience', icon: Users },
    { id: 'collaborations', label: 'Collaborations', icon: TrendingUp },
  ];

  if (isLoading && !metrics) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-secondary">Loading your studio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Studio Header */}
      <StudioHeader 
        metrics={metrics}
        onExport={() => exportAnalytics('csv')}
        isExporting={isExporting}
      />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Time Filter & Tabs */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
          {/* Time Filter */}
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-text-muted" />
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value as any)}
              className="glass-card border border-white/20 rounded-lg px-3 py-2 text-sm text-text-primary bg-transparent"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
              <option value="all">All time</option>
            </select>
          </div>

          {/* Navigation Tabs */}
          <div className="flex space-x-1 glass-card p-1 rounded-lg">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-md transition-all ${
                    isActive
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
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {activeTab === 'overview' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-8"
            >
              {/* Metrics Overview */}
              <MetricsOverview metrics={metrics} />

              {/* Revenue Trends */}
              <RevenueTrends trends={revenueTrends} />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Earnings Breakdown */}
                <EarningsBreakdown breakdown={earningsBreakdown} />

                {/* Top Performing Content */}
                <ContentPerformance 
                  performance={contentPerformance?.slice(0, 5)} 
                  view="compact"
                />
              </div>
            </motion.div>
          )}

          {activeTab === 'content' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <ContentPerformance 
                performance={contentPerformance} 
                view="detailed"
              />
            </motion.div>
          )}

          {activeTab === 'audience' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <AudienceInsights demographics={audienceDemographics} />
            </motion.div>
          )}

          {activeTab === 'collaborations' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <CollaborationAnalytics insights={collaborationInsights} />
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}