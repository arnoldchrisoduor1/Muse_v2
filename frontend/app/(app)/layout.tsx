// app/(app)/layout.tsx - This handles ALL app pages
"use client";
import { useState, useEffect } from 'react';
import { TopNav } from '@/components/layout/TopNav';
import { SectionNav } from '@/components/layout/SectionNav';
import { RightSidebar } from '@/components/layout/RightSidebar';
import { MobileNav } from '@/components/layout/MobileNav';
import { Footer } from '@/components/layout/Footer';
import { useIsMobile } from '../hooks/useIsMobile';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);
  const isMobile = useIsMobile();
  
  useEffect(() => {
    if (isMobile) {
      setIsRightSidebarOpen(false);
    } else {
      setIsRightSidebarOpen(true);
    }
  }, [isMobile]);

  return (
    <div className="min-h-screen bg-gradient-135 from-purple-900 via-indigo-900 to-blue-900 flex flex-col">
      <TopNav 
        onToggleSidebar={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
        isSidebarOpen={isRightSidebarOpen}
      />
      
      <div className="flex flex-grow">
        {/* Left Sidebar */}
        <aside className="w-64 hidden lg:block p-6 sidebar-transition">
          <SectionNav />
        </aside>
        
        {/* Main Content */}
        <main className={`flex-1 min-h-screen p-4 sm:p-6 transition-all duration-300 ${
          isRightSidebarOpen ? 'lg:mr-8' : 'mr-0'
        }`}>
          {children}
        </main>
        
        {/* Right Sidebar */}
        <aside className={`
          fixed lg:relative top-16 lg:top-0 right-0 h-[calc(100vh-4rem)] lg:h-auto
          w-80 lg:w-80 bg-bg-primary/80 backdrop-blur-xl lg:bg-transparent
          border-l border-white/10 lg:border-none
          transform transition-transform duration-300 z-40
          ${isRightSidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0 lg:w-0'}
          ${isRightSidebarOpen ? 'lg:p-6' : 'lg:p-0'}
        `}>
          {isRightSidebarOpen && <RightSidebar />}
        </aside>
        
        {/* Mobile Overlay */}
        {isRightSidebarOpen && isMobile && (
          <div 
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setIsRightSidebarOpen(false)}
          />
        )}
      </div>
      
      <MobileNav />
      <Footer />
    </div>
  );
}