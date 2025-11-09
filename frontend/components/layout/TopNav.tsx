// components/layout/TopNav.tsx
"use client";
import { motion } from "framer-motion";
import {
  Pen,
  Sparkles,
  Users,
  Compass,
  Gem,
  User,
  Menu,
  X,
} from "lucide-react";
import { usePoetryStore } from "@/lib/store/poetry-store";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface TopNavProps {
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
}

const majorPages = [
  { id: "create", label: "Create", icon: Pen, href: "/create" },
  {
    id: "collective",
    label: "Collective",
    icon: Sparkles,
    href: "/collective",
  },
  {
    id: "collaborate",
    label: "Collaborate",
    icon: Users,
    href: "/collaborate",
  },
  { id: "explore", label: "Explore", icon: Compass, href: "/explore" },
  { id: "dao", label: "DAO", icon: Gem, href: "/dao" },
  { id: "profile", label: "Profile", icon: User, href: "/profile/sarah_hero" },
];

export function TopNav({ onToggleSidebar, isSidebarOpen }: TopNavProps) {
  const { activeTab, setActiveTab } = usePoetryStore();
  const router = useRouter();

  const handleNavigation = (pageId: string, href: string) => {
    setActiveTab(pageId);
    router.push(href);
  };

  return (
    <nav className="glass-card-nav border-b border-white/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <div className="flex items-center justify-between h-12">
          {/* Logo & Mobile Menu */}
          <div className="flex items-center gap-4">
            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
              onClick={onToggleSidebar}
            >
              {isSidebarOpen ? <X size={18} /> : <Menu size={18} />}
            </button>

            {/* Logo with Link */}
            <Link href="/" className="flex items-center gap-3">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-3 cursor-pointer"
              >
                <div className="w-7 h-7 bg-gradient-90 from-secondary to-primary rounded-lg" />
                <span className="text-lg font-bold gradient-text hidden sm:block">
                  Collective Poetry
                </span>
              </motion.div>
            </Link>
          </div>

          {/* Major Pages Navigation - Hidden on mobile */}
          <div className="hidden md:flex items-center gap-1">
            {majorPages.map((page) => {
              const Icon = page.icon;
              const isActive = activeTab === page.id;

              return (
                <motion.button
                  key={page.id}
                  onClick={() => handleNavigation(page.id, page.href)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
                    isActive
                      ? "bg-white/20 text-white border border-white/30"
                      : "text-text-muted hover:text-text-primary hover:bg-white/10"
                  }`}
                >
                  <Icon size={16} />
                  <span className="font-medium text-sm">{page.label}</span>
                </motion.button>
              );
            })}
          </div>

          {/* Desktop Sidebar Toggle & Wallet */}
          <div className="flex items-center gap-3">
            {/* Desktop Sidebar Toggle */}
            <button
              className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition-colors text-text-muted"
              onClick={onToggleSidebar}
            >
              {isSidebarOpen ? <X size={18} /> : <Menu size={18} />}
            </button>

            {/* <WalletConnect /> */}
          </div>
        </div>
      </div>
    </nav>
  );
}
