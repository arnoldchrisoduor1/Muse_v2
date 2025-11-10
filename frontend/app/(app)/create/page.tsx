"use client";
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, FileText, TrendingUp, Users } from 'lucide-react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useSoloPoetStore } from '@/lib/store/solo-poet-store';

export default function CreatePage() {
  const { drafts, loadDrafts } = useSoloPoetStore();

  useEffect(() => {
    loadDrafts();
  }, [loadDrafts]);

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

      {/* Recent Drafts */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Recent Drafts</h2>
          <span className="text-text-muted text-sm">
            {drafts.length} {drafts.length === 1 ? 'draft' : 'drafts'}
          </span>
        </div>

        {drafts.length === 0 ? (
          <Card className="p-8 text-center">
            <FileText size={48} className="text-text-muted mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No drafts yet</h3>
            <p className="text-text-secondary mb-4">
              Start your first poem and see your drafts appear here.
            </p>
            <Link href="/poem/new">
              <Button variant="primary" icon={Plus}>
                Create First Poem
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {drafts.map((draft, index) => (
              <motion.div
                key={draft.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link href={`/poem/new?draft=${draft.id}`}>
                  <Card className="p-4 hover:bg-white/10 transition-all duration-300 cursor-pointer h-full">
                    <h3 className="font-semibold mb-2 truncate">{draft.title || 'Untitled'}</h3>
                    <p className="text-text-secondary text-sm mb-3 line-clamp-3">
                      {draft.content || 'No content yet...'}
                    </p>
                    <div className="flex items-center justify-between text-xs text-text-muted">
                      <span>
                        {new Date(draft.updatedAt).toLocaleDateString()}
                      </span>
                      {draft.qualityScore && (
                        <span className={`px-2 py-1 rounded-full ${
                          draft.qualityScore >= 85 ? 'bg-accent/20 text-accent' :
                          draft.qualityScore >= 70 ? 'bg-primary/20 text-primary' :
                          'bg-warning/20 text-warning'
                        }`}>
                          {draft.qualityScore}%
                        </span>
                      )}
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}