"use client";
import { motion } from 'framer-motion';
import { Sparkles, Users, Shield, Gem, Zap, Coins } from 'lucide-react';
import { Card } from '@/components/ui/Card';

const features = [
  {
    icon: Sparkles,
    title: 'Collective Consciousness',
    description: 'Query AI trained on thousands of community poems. Each response is a unique, DAO-owned NFT.',
    color: 'text-secondary'
  },
  {
    icon: Users,
    title: 'Fractional Collaboration',
    description: 'Co-create poems and automatically split ownership and royalties with collaborators.',
    color: 'text-primary'
  },
  {
    icon: Shield,
    title: 'Anonymous Publishing',
    description: 'Share controversial work using zero-knowledge proofs. Prove ownership without revealing identity.',
    color: 'text-accent'
  },
  {
    icon: Gem,
    title: 'NFT Poetry',
    description: 'Mint your poems as NFTs. Earn from sales, licensing, and micro-payments from readers.',
    color: 'text-warning'
  },
  {
    icon: Zap,
    title: 'DAO Governance',
    description: 'Shape the platform\'s future. Vote on features, grants, and collective training.',
    color: 'text-primary'
  },
  {
    icon: Coins,
    title: 'Earn Royalties',
    description: 'Get paid every time your poem is read, remixed, or licensed. Sustainable creativity.',
    color: 'text-secondary'
  }
];

export function FeaturesSection() {
  return (
    <section className="py-12 lg:py-16 mobile-container bg-gradient-135 from-bg-secondary/30 to-bg-primary/30">
      <div className="text-center mb-12">
        <h2 className="text-2xl lg:text-3xl font-bold gradient-text mb-4">
          Revolutionary Features
        </h2>
        <p className="text-text-secondary text-lg max-w-2xl mx-auto">
          We're reimagining what poetry can be in the digital age
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <FeatureCard feature={feature} />
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function FeatureCard({ feature }: { feature: any }) {
  const Icon = feature.icon;
  
  return (
    <Card className="p-6 text-center hover:bg-white/10 transition-all duration-300 group h-full">
      <div className={`w-12 h-12 ${feature.color} bg-white/10 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
        <Icon size={24} />
      </div>
      
      <h3 className="font-semibold text-lg mb-3 text-text-primary">
        {feature.title}
      </h3>
      
      <p className="text-text-secondary text-sm leading-relaxed">
        {feature.description}
      </p>
    </Card>
  );
}