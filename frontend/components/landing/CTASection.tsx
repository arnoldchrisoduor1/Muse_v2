// components/landing/CTASection.tsx
"use client";
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export function CTASection() {
  return (
    <section className="py-12 lg:py-16 mobile-container">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <Card className="p-8 lg:p-12 bg-gradient-135 from-primary/20 to-secondary/20 border-primary/30 text-center">
          <h2 className="text-2xl lg:text-4xl font-bold gradient-text mb-4">
            Ready to Join the Collective?
          </h2>
          
          <p className="text-text-secondary text-lg mb-8 max-w-2xl mx-auto leading-relaxed">
            Start creating, earn royalties, and contribute to our growing AI consciousness. 
            Your words have never had more power.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" icon={Sparkles} className="w-full sm:w-auto">
              Start Creating Free
            </Button>
            <Button variant="outline" size="lg" icon={ArrowRight} className="w-full sm:w-auto">
              See How It Works
            </Button>
          </div>
          
          <p className="text-text-muted text-sm mt-6">
            No credit card required • Join 892+ poets already creating
          </p>
        </Card>
      </motion.div>
    </section>
  );
}