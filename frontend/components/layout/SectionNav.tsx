// components/layout/SectionNav.tsx
"use client";
import { usePathname } from 'next/navigation';

const sectionMap = {
  '/create': [
    { label: 'New Poem', href: '/poem/new', icon: '📝' },
    { label: 'Drafts', href: '/create/drafts', icon: '📄' },
    { label: 'AI Assistant', href: '/create/ai', icon: '🤖' },
  ],
  '/collective': [
    { label: 'Ask Collective', href: '/collective', icon: '💭' },
    { label: 'Past Responses', href: '/collective/responses', icon: '📚' },
    { label: 'Training Status', href: '/collective/status', icon: '📊' },
  ],
  // ... other sections
};

export function SectionNav() {
  const pathname = usePathname();
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