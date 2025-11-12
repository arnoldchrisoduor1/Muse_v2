"use client";
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, FileText, Users } from 'lucide-react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useSoloPoetStore } from '@/lib/store/solo-poet-store';
import { useAuth } from '@/app/hooks/useAuth';
import { DraftsSection } from '@/components/create/DraftsSection';

export default function CreatePage() {
  const { loadPoems } = useSoloPoetStore();
  const { user } = useAuth();

  useEffect(() => {
    if (user?.id) {
      loadPoems(user.id);
    }
  }, [loadPoems, user]);

  const quickActions = [
    {
      title: 'New Poem',
      description: 'Start writing a new poem from scratch',
      icon: Plus,
      href: '/poem/new',
      color: 'from-secondary to-primary',
    },
    {
      title: 'From Template',
      description: 'Use AI-generated templates for inspiration',
      icon: FileText,
      href: '/create/templates',
      color: 'from-primary to-accent',
    },
    {
      title: 'Collaborate',
      description: 'Start a collaborative writing session',
      icon: Users,
      href: '/collaborate',
      color: 'from-warning to-secondary',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold gradient-text mb-2">Create</h1>
        <p className="text-text-secondary text-lg">
          Start your next poetic masterpiece or continue where you left off.
        </p>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
      >
        {quickActions.map((action, index) => {
          const Icon = action.icon;
          
          return (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link href={action.href}>
                <Card className="p-6 hover:bg-white/10 transition-all duration-300 cursor-pointer group h-full">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-90 ${action.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon size={24} className="text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{action.title}</h3>
                  <p className="text-text-secondary">{action.description}</p>
                </Card>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Recent Drafts Section */}
      <DraftsSection />
    </div>
  );
}