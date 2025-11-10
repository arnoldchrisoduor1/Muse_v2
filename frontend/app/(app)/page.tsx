"use client";
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Users, 
  TrendingUp, 
  BookOpen, 
  Zap, 
  ArrowRight,
  Eye,
  Heart,
  Share2
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
// import { useIsMobile } from '@/hooks/useIsMobile';
import { useIsMobile } from '../hooks/useIsMobile';

// Mock data for the feed
const trendingPoems = [
  {
    id: '1',
    title: 'Digital Solitude',
    author: 'sarah_poet',
    excerpt: 'In the quiet hum of machines, I find a different kind of silence...',
    likes: 423,
    views: 12457,
    isCollective: false,
    isCollaborative: true,
    collaborators: 3,
    qualityScore: 85
  },
  {
    id: '2',
    title: 'Urban Echoes',
    author: 'mike_writer',
    excerpt: 'Concrete canyons whisper secrets, neon lights paint stories...',
    likes: 287,
    views: 8567,
    isCollective: true,
    isCollaborative: false,
    qualityScore: 78
  },
  {
    id: '3',
    title: 'The Emperor Has No Bytes',
    author: 'Anonymous',
    excerpt: 'Behind seven proxies and encrypted streams, I pour my truth...',
    likes: 512,
    views: 18923,
    isCollective: false,
    isCollaborative: false,
    isAnonymous: true,
    qualityScore: 92
  }
];

const featuredCollections = [
  {
    id: '1',
    title: 'Cyber Dreams',
    curator: 'tech_poet',
    poemCount: 8,
    followers: 124,
    description: 'Exploring digital consciousness through poetry'
  },
  {
    id: '2', 
    title: 'Urban Legends',
    curator: 'city_writer',
    poemCount: 12,
    followers: 89,
    description: 'Stories from the concrete jungle'
  }
];

export default function HomePage() {
  const [activeFeed, setActiveFeed] = useState<'for-you' | 'trending' | 'new'>('for-you');
  const isMobile = useIsMobile();

  // Stats ticker animation
  const [stats, setStats] = useState({
    totalPoems: 2847,
    activeCollaborations: 42,
    daoMembers: 892,
    collectiveQueries: 1567
  });

  useEffect(() => {
    // Simulate live updating stats
    const interval = setInterval(() => {
      setStats(prev => ({
        totalPoems: prev.totalPoems + Math.floor(Math.random() * 3),
        activeCollaborations: prev.activeCollaborations + Math.floor(Math.random() * 2),
        daoMembers: prev.daoMembers + 1,
        collectiveQueries: prev.collectiveQueries + Math.floor(Math.random() * 5)
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-7xl mx-auto">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-12 lg:mb-16 mobile-container"
      >
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 mb-6"
        >
          <Sparkles size={16} className="text-secondary" />
          <span className="text-sm text-text-secondary">
            Revolutionizing Poetry with AI & Blockchain
          </span>
        </motion.div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold gradient-text mb-6 leading-tight">
          Where Words Meet
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-90 from-secondary to-primary">
            Infinite Possibility
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-text-secondary max-w-2xl mx-auto mb-8 leading-relaxed">
          Create, collaborate, and earn with the world's first decentralized poetry platform. 
          Join our collective consciousness powered by {stats.totalPoems.toLocaleString()}+ community poems.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <Button 
            size="lg" 
            icon={Sparkles}
            className="w-full sm:w-auto"
          >
            Ask the Collective
          </Button>
          <Button 
            variant="outline" 
            size="lg"
            icon={BookOpen}
            className="w-full sm:w-auto"
          >
            Start Writing
          </Button>
        </div>

        {/* Stats Ticker */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto"
        >
          <StatCard 
            icon={BookOpen}
            value={stats.totalPoems.toLocaleString()}
            label="Total Poems"
            color="text-primary"
          />
          <StatCard 
            icon={Users}
            value={stats.activeCollaborations.toString()}
            label="Active Collabs"
            color="text-secondary"
          />
          <StatCard 
            icon={Zap}
            value={stats.daoMembers.toLocaleString()}
            label="DAO Members"
            color="text-accent"
          />
          <StatCard 
            icon={TrendingUp}
            value={stats.collectiveQueries.toLocaleString()}
            label="Collective Queries"
            color="text-warning"
          />
        </motion.div>
      </motion.section>

      {/* Trending Poems Carousel */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="mb-12 mobile-container"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold gradient-text">Trending Poems</h2>
          <Button variant="outline" size="sm" icon={ArrowRight}>
            View All
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trendingPoems.map((poem, index) => (
            <motion.div
              key={poem.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 + index * 0.1 }}
            >
              <PoemCard poem={poem} />
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Feed Section */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
        className="mb-12 mobile-container"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold gradient-text">Your Feed</h2>
          
          {/* Feed Type Tabs */}
          <div className="flex gap-2 glass-card p-1 rounded-lg">
            {[
              { id: 'for-you', label: 'For You' },
              { id: 'trending', label: 'Trending' },
              { id: 'new', label: 'New' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveFeed(tab.id as any)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  activeFeed === tab.id
                    ? 'bg-primary text-white shadow-lg'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Feed Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Main Feed */}
          <div className="space-y-6">
            {[1, 2, 3].map((item) => (
              <motion.div
                key={item}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.1 + item * 0.1 }}
              >
                <FeedPoemCard />
              </motion.div>
            ))}
          </div>

          {/* Featured Collections Sidebar */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              Featured Collections
            </h3>
            
            {featuredCollections.map((collection, index) => (
              <motion.div
                key={collection.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.2 + index * 0.1 }}
              >
                <CollectionCard collection={collection} />
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4 }}
        className="text-center py-12 mobile-container"
      >
        <Card className="p-8 lg:p-12 bg-gradient-135 from-primary/20 to-secondary/20 border-primary/30">
          <h2 className="text-3xl lg:text-4xl font-bold gradient-text mb-4">
            Ready to Join the Collective?
          </h2>
          <p className="text-text-secondary text-lg mb-8 max-w-2xl mx-auto">
            Start creating, earn royalties, and contribute to our growing AI consciousness. 
            Your words have never had more power.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" icon={Sparkles}>
              Start Creating
            </Button>
            <Button variant="outline" size="lg">
              Learn More
            </Button>
          </div>
        </Card>
      </motion.section>
    </div>
  );
}

// Helper Components
function StatCard({ icon: Icon, value, label, color }: {
  icon: any;
  value: string;
  label: string;
  color: string;
}) {
  return (
    <Card className="p-4 text-center hover:bg-white/5 transition-colors cursor-pointer">
      <Icon size={24} className={`mx-auto mb-2 ${color}`} />
      <div className={`text-2xl font-bold ${color} mb-1`}>{value}</div>
      <div className="text-text-secondary text-sm">{label}</div>
    </Card>
  );
}

function PoemCard({ poem }: { poem: any }) {
  return (
    <Card className="p-4 hover:bg-white/10 transition-all duration-300 cursor-pointer group">
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-text-primary group-hover:text-primary transition-colors">
          {poem.title}
        </h3>
        <div className="flex gap-1">
          {poem.isCollective && (
            <span className="text-xs bg-secondary/20 text-secondary px-2 py-1 rounded-full">
              Collective
            </span>
          )}
          {poem.isCollaborative && (
            <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
              Collab
            </span>
          )}
          {poem.isAnonymous && (
            <span className="text-xs bg-accent/20 text-accent px-2 py-1 rounded-full">
              Anonymous
            </span>
          )}
        </div>
      </div>
      
      <p className="text-text-secondary text-sm mb-4 line-clamp-3">
        {poem.excerpt}
      </p>
      
      <div className="flex items-center justify-between text-xs text-text-muted">
        <span>by {poem.author}</span>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <Heart size={12} />
            <span>{poem.likes}</span>
          </div>
          <div className="flex items-center gap-1">
            <Eye size={12} />
            <span>{poem.views.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}

function FeedPoemCard() {
  return (
    <Card className="p-6 hover:bg-white/10 transition-all duration-300 cursor-pointer group">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 bg-gradient-90 from-primary to-secondary rounded-full flex items-center justify-center flex-shrink-0">
          <BookOpen size={20} className="text-white" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-semibold text-text-primary">sarah_poet</span>
            <span className="text-text-muted text-sm">• 2h ago</span>
          </div>
          
          <h4 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
            Digital Solitude
          </h4>
          
          <p className="text-text-secondary mb-4 leading-relaxed">
            In the quiet hum of machines, I find a different kind of silence. 
            Not the absence of sound, but the presence of something deeper...
          </p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-text-muted">
              <button className="flex items-center gap-1 hover:text-secondary transition-colors">
                <Heart size={16} />
                <span className="text-sm">423</span>
              </button>
              <button className="flex items-center gap-1 hover:text-primary transition-colors">
                <Share2 size={16} />
                <span className="text-sm">Share</span>
              </button>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
                Collaborative
              </span>
              <span className="text-xs bg-warning/20 text-warning px-2 py-1 rounded-full">
                ⭐ 85
              </span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

function CollectionCard({ collection }: { collection: any }) {
  return (
    <Card className="p-4 hover:bg-white/10 transition-all duration-300 cursor-pointer group">
      <div className="flex items-start justify-between mb-3">
        <h4 className="font-semibold text-text-primary group-hover:text-primary transition-colors">
          {collection.title}
        </h4>
        <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
          {collection.poemCount} poems
        </span>
      </div>
      
      <p className="text-text-secondary text-sm mb-3">
        {collection.description}
      </p>
      
      <div className="flex items-center justify-between text-xs text-text-muted">
        <span>by {collection.curator}</span>
        <span>{collection.followers} followers</span>
      </div>
    </Card>
  );
}