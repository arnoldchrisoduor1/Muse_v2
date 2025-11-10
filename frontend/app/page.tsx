// app/page.tsx - Updated with footer
"use client";
import { HeroSection } from '@/components/landing/HeroSection';
import { TrendingPoems } from '@/components/landing/TrendingPoems';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { CTASection } from '@/components/landing/CTASection';
import { Footer } from '@/components/layout/Footer';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-135 from-purple-900 via-indigo-900 to-blue-900 flex flex-col">
      {/* Simple header for landing page only */}
      <header className="glass-card-nav border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-90 from-secondary to-primary rounded-lg" />
              <span className="text-xl font-bold gradient-text">
                Collective Poetry
              </span>
            </div>
            
            {/* Simple navigation */}
            <nav className="flex items-center gap-4">
              <a href="/login" className="text-text-secondary hover:text-text-primary transition-colors">
                Login
              </a>
              <a href="/signup" className="btn-primary text-sm px-4 py-2">
                Get Started
              </a>
            </nav>
          </div>
        </div>
      </header>
      
      <main className="grow">
        <HeroSection />
        <TrendingPoems />
        <FeaturesSection />
        <CTASection />
      </main>
      
      {/* Universal Footer */}
      <Footer />
    </div>
  );
}