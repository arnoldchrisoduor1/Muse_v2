"use client";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, X, Sparkles } from 'lucide-react';
import { useDiscoveryStore } from '@/lib/store/discovery-store';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export function SearchInterface() {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [semanticQuery, setSemanticQuery] = useState('');
  
  const {
    searchFilters,
    setSearchFilters,
    performSearch,
    performSemanticSearch,
    isSearching,
  } = useDiscoveryStore();

  const availableTags = ['technology', 'love', 'nature', 'urban', 'political', 'emotional', 'experimental'];
  const availableThemes = ['love', 'loss', 'nature', 'identity', 'social-justice', 'technology', 'existential'];
  const availableMoods = ['melancholic', 'hopeful', 'angry', 'peaceful', 'anxious', 'joyful', 'contemplative'];

  const handleSearch = () => {
    performSearch();
  };

  const handleSemanticSearch = async () => {
    if (!semanticQuery.trim()) return;
    
    const matches = await performSemanticSearch(semanticQuery);
    console.log('Semantic matches:', matches);
    // In a real app, you'd display these matches
  };

  const handleTagToggle = (tag: string) => {
    const newTags = searchFilters.tags.includes(tag)
      ? searchFilters.tags.filter(t => t !== tag)
      : [...searchFilters.tags, tag];
    
    setSearchFilters({ tags: newTags });
  };

  const handleThemeToggle = (theme: string) => {
    const newThemes = searchFilters.themes.includes(theme)
      ? searchFilters.themes.filter(t => t !== theme)
      : [...searchFilters.themes, theme];
    
    setSearchFilters({ themes: newThemes });
  };

  const handleMoodToggle = (mood: string) => {
    const newMoods = searchFilters.moods.includes(mood)
      ? searchFilters.moods.filter(m => m !== mood)
      : [...searchFilters.moods, mood];
    
    setSearchFilters({ moods: newMoods });
  };

  const clearFilters = () => {
    setSearchFilters({
      query: '',
      tags: [],
      themes: [],
      moods: [],
      minQualityScore: 0,
      maxQualityScore: 100,
      isCollaborative: null,
      hasNFT: null,
      licenseTypes: [],
    });
    setSemanticQuery('');
  };

  const hasActiveFilters = 
    searchFilters.query || 
    searchFilters.tags.length > 0 || 
    searchFilters.themes.length > 0 || 
    searchFilters.moods.length > 0 ||
    searchFilters.minQualityScore > 0 ||
    searchFilters.maxQualityScore < 100 ||
    searchFilters.isCollaborative !== null ||
    searchFilters.hasNFT !== null;

  return (
    <div className="space-y-6">
      {/* Main Search Bar */}
      <Card className="p-6">
        <div className="flex gap-4 mb-4">
          {/* Text Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted" size={20} />
            <input
              type="text"
              value={searchFilters.query}
              onChange={(e) => setSearchFilters({ query: e.target.value })}
              placeholder="Search poems, poets, or themes..."
              className="input-field pl-10 pr-4"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>

          <Button
            variant="primary"
            icon={Search}
            loading={isSearching}
            onClick={handleSearch}
            disabled={!searchFilters.query && !hasActiveFilters}
          >
            Search
          </Button>

          <Button
            variant="outline"
            icon={Filter}
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          >
            Filters
          </Button>
        </div>

        {/* Semantic Search */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Sparkles className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary" size={18} />
            <input
              type="text"
              value={semanticQuery}
              onChange={(e) => setSemanticQuery(e.target.value)}
              placeholder="Describe what you're looking for... (AI-powered semantic search)"
              className="input-field pl-10 pr-4 text-sm"
            />
          </div>
          <Button
            variant="secondary"
            icon={Sparkles}
            onClick={handleSemanticSearch}
            disabled={!semanticQuery.trim()}
          >
            AI Search
          </Button>
        </div>

        {/* Active Filters */}
        {hasActiveFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4 flex flex-wrap gap-2"
          >
            {searchFilters.query && (
              <div className="bg-primary/20 text-primary px-3 py-1 rounded-full text-sm flex items-center gap-2">
                Text: "{searchFilters.query}"
                <button onClick={() => setSearchFilters({ query: '' })}>
                  <X size={14} />
                </button>
              </div>
            )}
            
            {searchFilters.tags.map(tag => (
              <div key={tag} className="bg-secondary/20 text-secondary px-3 py-1 rounded-full text-sm flex items-center gap-2">
                Tag: {tag}
                <button onClick={() => handleTagToggle(tag)}>
                  <X size={14} />
                </button>
              </div>
            ))}
            
            {searchFilters.themes.map(theme => (
              <div key={theme} className="bg-accent/20 text-accent px-3 py-1 rounded-full text-sm flex items-center gap-2">
                Theme: {theme}
                <button onClick={() => handleThemeToggle(theme)}>
                  <X size={14} />
                </button>
              </div>
            ))}

            <button
              onClick={clearFilters}
              className="text-text-muted hover:text-text-primary text-sm flex items-center gap-1"
            >
              <X size={14} />
              Clear all
            </button>
          </motion.div>
        )}
      </Card>

      {/* Advanced Filters */}
      <AnimatePresence>
        {showAdvancedFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Filter size={18} />
                Advanced Filters
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium mb-2">Tags</label>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {availableTags.map(tag => (
                      <label key={tag} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={searchFilters.tags.includes(tag)}
                          onChange={() => handleTagToggle(tag)}
                          className="rounded border-white/20 bg-white/10"
                        />
                        <span className="capitalize">{tag}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Themes */}
                <div>
                  <label className="block text-sm font-medium mb-2">Themes</label>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {availableThemes.map(theme => (
                      <label key={theme} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={searchFilters.themes.includes(theme)}
                          onChange={() => handleThemeToggle(theme)}
                          className="rounded border-white/20 bg-white/10"
                        />
                        <span className="capitalize">{theme.replace('-', ' ')}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Moods */}
                <div>
                  <label className="block text-sm font-medium mb-2">Mood</label>
                  <div className="space-y-2">
                    {availableMoods.map(mood => (
                      <label key={mood} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={searchFilters.moods.includes(mood)}
                          onChange={() => handleMoodToggle(mood)}
                          className="rounded border-white/20 bg-white/10"
                        />
                        <span className="capitalize">{mood}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Quality Score */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Quality Score: {searchFilters.minQualityScore} - {searchFilters.maxQualityScore}
                  </label>
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={searchFilters.minQualityScore}
                      onChange={(e) => setSearchFilters({ minQualityScore: parseInt(e.target.value) })}
                      className="w-full"
                    />
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={searchFilters.maxQualityScore}
                      onChange={(e) => setSearchFilters({ maxQualityScore: parseInt(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Additional Filters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Collaborative</label>
                  <select
                    value={searchFilters.isCollaborative === null ? '' : searchFilters.isCollaborative.toString()}
                    onChange={(e) => setSearchFilters({ 
                      isCollaborative: e.target.value === '' ? null : e.target.value === 'true' 
                    })}
                    className="input-field"
                  >
                    <option value="">Any</option>
                    <option value="true">Collaborative Only</option>
                    <option value="false">Solo Only</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">NFT Status</label>
                  <select
                    value={searchFilters.hasNFT === null ? '' : searchFilters.hasNFT.toString()}
                    onChange={(e) => setSearchFilters({ 
                      hasNFT: e.target.value === '' ? null : e.target.value === 'true' 
                    })}
                    className="input-field"
                  >
                    <option value="">Any</option>
                    <option value="true">Has NFT</option>
                    <option value="false">No NFT</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Sort By</label>
                  <select
                    value={searchFilters.sortBy}
                    onChange={(e) => setSearchFilters({ sortBy: e.target.value as any })}
                    className="input-field"
                  >
                    <option value="recent">Most Recent</option>
                    <option value="popular">Most Popular</option>
                    <option value="quality">Highest Quality</option>
                    <option value="trending">Trending</option>
                  </select>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}