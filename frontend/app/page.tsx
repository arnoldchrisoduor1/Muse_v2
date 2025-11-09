// app/page.tsx (HomePage)
"use client";
import { motion } from 'framer-motion';

import { NavigationTabs } from '@/components/poetry/NavigationTabs';
import { CollectiveConsciousness } from '@/components/poetry/CollectiveConsciousness';
import { FractionalOwnership } from '@/components/poetry/FractionalOwnership';
import { AnonymousProof } from '@/components/poetry/AnonymousProof';
import { usePoetryStore } from '@/lib/store/poetry-store';

export default function HomePage() {
  const { activeTab } = usePoetryStore();

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'collective':
        return <CollectiveConsciousness />;
      case 'fractional':
        return <FractionalOwnership />;
      case 'anonymous':
        return <AnonymousProof />;
      default:
        return <CollectiveConsciousness />;
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-bold mb-4 gradient-text"
          >
            Collective Poetry
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-text-secondary"
          >
            Where AI, Blockchain, and Poetry Converge
          </motion.p>
        </div>

        <NavigationTabs />
        {renderActiveTab()}
      </div>
    </div>
  );
}
