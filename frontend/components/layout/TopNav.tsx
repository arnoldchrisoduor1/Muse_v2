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
  LogOut,
  LogIn,
} from "lucide-react";
import { usePoetryStore } from "@/lib/store/poetry-store";
import { useAuthStore } from "@/lib/store/auth-store";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useMemo } from "react";

interface TopNavProps {
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
}

const PUBLIC_PATHS = ["/", "/login", "/signup"];

export function TopNav({ onToggleSidebar, isSidebarOpen }: TopNavProps) {
  const { activeTab, setActiveTab } = usePoetryStore();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const signOut = useAuthStore((state) => state.signOut);
  const isLoading = useAuthStore((state) => state.isLoading);
  const router = useRouter();
  const pathname = usePathname();

  // Create majorPages array with dynamic profile link
  const majorPages = useMemo(() => [
    {
      id: "create",
      label: "Create",
      icon: Pen,
      href: "/create",
      requiresAuth: true,
    },
    {
      id: "collective",
      label: "Collective",
      icon: Sparkles,
      href: "/collective",
      requiresAuth: false,
    },
    {
      id: "collaborate",
      label: "Collaborate",
      icon: Users,
      href: "/collaborate",
      requiresAuth: true,
    },
    {
      id: "explore",
      label: "Explore",
      icon: Compass,
      href: "/explore",
      requiresAuth: true,
    },
    { 
      id: "dao", 
      label: "DAO", 
      icon: Gem, 
      href: "/dao", 
      requiresAuth: true 
    },
    {
      id: "profile",
      label: "Profile",
      icon: User,
      href: user?.username ? `/profile/${user.username}` : "/profile",
      requiresAuth: true,
    },
  ] as const, [user?.username]);

  type PageId = (typeof majorPages)[number]["id"];

  const handleNavigation = (
    pageId: PageId,
    href: string,
    requiresAuth: boolean
  ) => {
    if (requiresAuth && !isAuthenticated) {
      router.push("/login");
      return;
    }

    setActiveTab(pageId as any);
    router.push(href);
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleLogin = () => {
    router.push("/login");
  };

  // Don't render nav on public pages when not authenticated
  const isPublicPath = PUBLIC_PATHS.includes(pathname);
  if (isPublicPath && !isAuthenticated) {
    return null;
  }

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

            {/* Logo */}
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
              const isDisabled = page.requiresAuth && !isAuthenticated;

              return (
                <motion.button
                  key={page.id}
                  onClick={() =>
                    handleNavigation(page.id, page.href, page.requiresAuth)
                  }
                  whileHover={!isDisabled ? { scale: 1.02 } : {}}
                  whileTap={!isDisabled ? { scale: 0.98 } : {}}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
                    isActive
                      ? "bg-white/20 text-white border border-white/30"
                      : isDisabled
                      ? "text-text-muted/50 cursor-not-allowed opacity-50"
                      : "text-text-muted hover:text-text-primary hover:bg-white/10"
                  }`}
                  disabled={isDisabled}
                  title={isDisabled ? "Please login to access this page" : ""}
                >
                  <Icon size={16} />
                  <span className="font-medium text-sm">{page.label}</span>
                </motion.button>
              );
            })}
          </div>

          {/* Auth Section */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                {/* User Info - Hidden on mobile */}
                <div className="hidden sm:flex items-center gap-2 text-sm">
                  <div className="w-6 h-6 bg-gradient-90 from-primary to-secondary rounded-full flex items-center justify-center">
                    <User size={16} className="text-white" />
                  </div>
                  <span className="text-text-primary font-medium">
                    {user?.username || user?.email?.split("@")[0]}
                  </span>
                  {user?.anonymous && (
                    <span className="px-1.5 py-0.5 bg-accent/20 text-accent text-xs rounded-full border border-accent/30">
                      Anonymous
                    </span>
                  )}
                </div>

                {/* Logout Button - Hidden on mobile */}
                <motion.button
                  onClick={handleLogout}
                  disabled={isLoading}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-error/20 text-error hover:bg-error/30 border border-error/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Sign out"
                >
                  <LogOut size={16} />
                  <span className="text-sm font-medium">Sign Out</span>
                </motion.button>
              </div>
            ) : (
              /* Login Button - Hidden on mobile */
              <motion.button
                onClick={handleLogin}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 border border-primary/30 transition-colors"
              >
                <LogIn size={16} />
                <span className="text-sm font-medium">Sign In</span>
              </motion.button>
            )}
          </div>
        </div>

        {/* Mobile Auth Info */}
        {isAuthenticated && (
          <div className="md:hidden flex items-center justify-between mt-2 pt-2 border-t border-white/10">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-6 h-6 bg-gradient-90 from-primary to-secondary rounded-full flex items-center justify-center">
                <User size={12} className="text-white" />
              </div>
              <span className="text-text-primary">
                {user?.username || user?.email?.split("@")[0]}
              </span>
              {user?.anonymous && (
                <span className="px-1.5 py-0.5 bg-accent/20 text-accent text-xs rounded-full border border-accent/30">
                  Anonymous
                </span>
              )}
            </div>
            <button
              onClick={handleLogout}
              disabled={isLoading}
              className="p-1.5 rounded-lg bg-error/20 text-error hover:bg-error/30 border border-error/30 transition-colors disabled:opacity-50"
              title="Sign out"
            >
              <LogOut size={14} />
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}