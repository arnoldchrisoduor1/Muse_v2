"use client";
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Compass, Search, TrendingUp, Clock, Zap } from 'lucide-react';
import { SearchInterface } from '@/components/search/SearchInterface';
import { PoemGrid } from '@/components/poem/PoemGrid';
import { FeaturedCollections } from '@/components/discovery/FeaturedCollections';
import { QuickFilters } from '@/components/search/QuickFilters';
import { useDiscoveryStore } from '@/lib/store/discovery-store';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function ExplorePage() {
  const [activeTab, setActiveTab] = useState<'discover' | 'search'>('discover');
  const {
    trendingPoems,
    recentPoems,
    featuredCollections,
    loadTrendingPoems,
    loadRecentPoems,
    loadFeaturedCollections,
    searchResults,
  } = useDiscoveryStore();

  useEffect(() => {
    loadTrendingPoems();
    loadRecentPoems();
    loadFeaturedCollections();
  }, [loadTrendingPoems, loadRecentPoems, loadFeaturedCollections]);

  const discoveryTabs = [
    { id: 'trending', label: 'Trending', icon: TrendingUp, poems: trendingPoems },
    { id: 'recent', label: 'Recent', icon: Clock, poems: recentPoems },
    { id: 'featured', label: 'Featured', icon: Zap, poems: [] },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold gradient-text mb-4">
          Discover Poetry
        </h1>
        <p className="text-text-secondary text-lg max-w-2xl mx-auto">
          Explore thousands of poems, find new voices, and discover your next favorite piece of writing.
        </p>
      </motion.div>

      {/* Search/Discover Toggle */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex items-center justify-center mb-8"
      >
        <div className="glass-card p-1 rounded-lg flex">
          {[
            { id: 'discover', label: 'Discover', icon: Compass },
            { id: 'search', label: 'Search', icon: Search },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-3 rounded-md transition-all ${
                activeTab === tab.id
                  ? 'bg-primary text-white'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              <tab.icon size={18} />
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {activeTab === 'search' ? (
        /* Search Interface */
        <div className="space-y-8">
          <SearchInterface />
          
          {searchResults && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">
                  Search Results
                  <span className="text-text-muted text-lg ml-2">
                    ({searchResults.total} poems)
                  </span>
                </h2>
              </div>
              <PoemGrid poems={searchResults.poems} />
            </motion.div>
          )}
        </div>
      ) : (
        /* Discovery Interface */
        <div className="space-y-12">
          {/* Quick Filters */}
          <QuickFilters />

          {/* Trending Poems */}
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <TrendingUp className="text-secondary" />
                Trending Now
              </h2>
              <Button variant="outline" size="sm">
                View All
              </Button>
            </div>
            <PoemGrid poems={trendingPoems} />
          </motion.section>

          {/* Featured Collections */}
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <FeaturedCollections collections={featuredCollections} />
          </motion.section>

          {/* Recent Poems */}
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Clock className="text-primary" />
                Recently Published
              </h2>
              <Button variant="outline" size="sm">
                View All
              </Button>
            </div>
            <PoemGrid poems={recentPoems} />
          </motion.section>
        </div>
      )}
    </div>
  );
}