"use client";
import { motion } from 'framer-motion';
import { Sparkles, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { StatsTicker } from './StatsTicker';

export function HeroSection() {
  return (
    <section className="text-center py-16 lg:py-24 mobile-container">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* Announcement Badge */}
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 mb-6"
        >
          <Sparkles size={16} className="text-secondary" />
          <span className="text-sm text-text-secondary">
            Revolutionizing Poetry with AI & Blockchain
          </span>
        </motion.div>

        {/* Main Heading */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold gradient-text mb-6 leading-tight">
          Where Words Meet
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-90 from-secondary to-primary">
            Infinite Possibility
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg sm:text-xl text-text-secondary max-w-2xl mx-auto mb-8 leading-relaxed">
          Create, collaborate, and earn with the world's first decentralized poetry platform. 
          Join our collective consciousness powered by community creativity.
        </p>

        {/* CTA Buttons */}
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

        {/* Stats */}
        <StatsTicker />
      </motion.div>
    </section>
  );
}