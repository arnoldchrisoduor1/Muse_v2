// components/layout/MobileNav.tsx
"use client";
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Pen, Sparkles, Users, Compass, Gem, User } from 'lucide-react';

const mobilePages = [
  { id: 'create', label: 'Create', icon: Pen, href: '/create' },
  { id: 'collective', label: 'Collective', icon: Sparkles, href: '/collective' },
  { id: 'collaborate', label: 'Collaborate', icon: Users, href: '/collaborate' },
  { id: 'explore', label: 'Explore', icon: Compass, href: '/explore' },
  { id: 'profile', label: 'Profile', icon: User, href: '/profile/sarah_poet' },
];

export function MobileNav() {
  const pathname = usePathname();
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 glass-card border-t border-white/20 md:hidden z-50">
      <div className="flex justify-around items-center h-16 px-2">
        {mobilePages.map((page) => {
          const Icon = page.icon;
          const isActive = pathname.startsWith(page.href);
          
          return (
            <motion.a
              key={page.id}
              href={page.href}
              whileTap={{ scale: 0.9 }}
              className={`flex flex-col items-center p-2 flex-1 min-w-0 transition-colors ${
                isActive ? 'text-secondary' : 'text-text-muted'
              }`}
            >
              <Icon size={20} />
              <span className="text-xs mt-1 truncate w-full text-center">
                {page.label}
              </span>
              {isActive && (
                <motion.div 
                  layoutId="mobileNavIndicator"
                  className="w-1 h-1 bg-secondary rounded-full mt-1"
                />
              )}
            </motion.a>
          );
        })}
      </div>
    </nav>
  );
}