"use client";
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Filter, Search, X } from 'lucide-react';
import { useDAOStore } from '@/lib/store/dao-store';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export function ProposalFilters() {
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { proposals, setSearchFilters } = useDAOStore();

  const proposalTypes = [...new Set(proposals.map(p => p.proposalType))];
  const allTags = [...new Set(proposals.flatMap(p => p.tags))];

  const handleTypeFilter = (type: string) => {
    // Implementation for type-based filtering
    console.log('Filter by type:', type);
  };

  const handleTagFilter = (tag: string) => {
    // Implementation for tag-based filtering
    console.log('Filter by tag:', tag);
  };

  const handleSearch = () => {
    // Implementation for search
    console.log('Search query:', searchQuery);
  };

  return (
    <Card className="p-4">
      <div className="flex gap-3">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted" size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search proposals..."
            className="input-field pl-10 pr-4 text-sm"
          />
        </div>

        {/* Filter Toggle */}
        <Button
          variant="outline"
          icon={Filter}
          onClick={() => setShowFilters(!showFilters)}
        >
          Filters
        </Button>
      </div>

      {/* Expanded Filters */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-4 space-y-4"
        >
          {/* Proposal Types */}
          <div>
            <label className="block text-sm font-medium mb-2 text-text-primary">
              Proposal Types
            </label>
            <div className="flex flex-wrap gap-2">
              {proposalTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => handleTypeFilter(type)}
                  className="text-xs bg-white/10 hover:bg-white/20 text-text-muted hover:text-text-primary px-3 py-1 rounded-full transition-colors capitalize"
                >
                  {type.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium mb-2 text-text-primary">
              Tags
            </label>
            <div className="flex flex-wrap gap-2">
              {allTags.slice(0, 10).map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleTagFilter(tag)}
                  className="text-xs bg-primary/20 hover:bg-primary/30 text-primary px-3 py-1 rounded-full transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </Card>
  );
}