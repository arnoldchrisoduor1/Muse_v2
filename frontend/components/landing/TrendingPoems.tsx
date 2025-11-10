"use client";
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { PoemCard } from './PoemCard';

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
  // ... more poems
];

export function TrendingPoems() {
  return (
    <section className="py-12 lg:py-16 mobile-container">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl lg:text-3xl font-bold gradient-text">Trending Poems</h2>
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
            transition={{ delay: 0.3 + index * 0.1 }}
          >
            <PoemCard poem={poem} />
          </motion.div>
        ))}
      </div>
    </section>
  );
}