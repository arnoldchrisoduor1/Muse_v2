"use client";
import { usePathname } from 'next/navigation';

const sectionMap: Record<string, Array<{ label: string; href: string; icon: string }>> = {
  '/create': [
    { label: 'New Poem', href: '/create', icon: '📝' },
    { label: 'Drafts', href: '/create/drafts', icon: '📄' },
    { label: 'AI Assistant', href: '/create/ai', icon: '🤖' },
  ],
  '/collective': [
    { label: 'Ask Collective', href: '/collective', icon: '💭' },
    { label: 'Past Responses', href: '/collective/responses', icon: '📚' },
    { label: 'Training Status', href: '/collective/status', icon: '📊' },
  ],
  '/collaborate': [
    { label: 'Active Sessions', href: '/collaborate', icon: '👥' },
    { label: 'Invites', href: '/collaborate/invites', icon: '📨' },
    { label: 'Templates', href: '/collaborate/templates', icon: '📋' },
  ],
  '/profile': [
    { label: 'My Poems', href: '/profile', icon: '📖' },
    { label: 'Collections', href: '/profile/collections', icon: '📚' },
    { label: 'Analytics', href: '/profile/analytics', icon: '📊' },
    { label: 'Settings', href: '/profile/settings', icon: '⚙️' },
  ],
  '/dao': [
    { label: 'Proposals', href: '/dao', icon: '🗳️' },
    { label: 'Treasury', href: '/dao/treasury', icon: '💰' },
    { label: 'Voting Power', href: '/dao/voting', icon: '⚡' },
  ],
  '/marketplace': [
    { label: 'Browse', href: '/marketplace', icon: '🛒' },
    { label: 'My Listings', href: '/marketplace/listings', icon: '📋' },
    { label: 'Licensing', href: '/marketplace/licensing', icon: '📄' },
  ],
  '/anonymous': [
    { label: 'Publish', href: '/anonymous', icon: '👤' },
    { label: 'Claim Earnings', href: '/anonymous/claim', icon: '💰' },
    { label: 'My Proofs', href: '/anonymous/proofs', icon: '🔐' },
  ],
};

export function SectionNav() {
  const pathname = usePathname();
  
  // Find which section we're in based on the path
  const currentSection = Object.keys(sectionMap).find(section => 
    pathname.startsWith(section)
  );
  
  const sections = currentSection ? sectionMap[currentSection] : [];

  if (!sections.length) return null;

  return (
    <div className="glass-card p-4">
      <h3 className="text-sm font-semibold text-text-muted mb-3 uppercase tracking-wide">
        Navigation
      </h3>
      <nav className="space-y-2">
        {sections.map((section) => {
          const isActive = pathname === section.href;
          return (
            <a
              key={section.href}
              href={section.href}
              className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                isActive
                  ? 'bg-primary/20 text-primary border border-primary/30'
                  : 'text-text-secondary hover:text-text-primary hover:bg-white/10'
              }`}
            >
              <span>{section.icon}</span>
              <span className="font-medium">{section.label}</span>
            </a>
          );
        })}
      </nav>
    </div>
  );
}