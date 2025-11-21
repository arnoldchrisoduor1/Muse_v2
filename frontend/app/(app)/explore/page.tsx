"use client";
import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Compass, Search, TrendingUp, Clock, Zap, Copy } from "lucide-react";
import { SearchInterface } from "@/components/search/SearchInterface";
import { PoemGrid } from "@/components/poem/PoemGrid";
import { FeaturedCollections } from "@/components/discovery/FeaturedCollections";
import { QuickFilters } from "@/components/search/QuickFilters";
import { useDiscoveryStore } from "@/lib/store/discovery-store";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/lib/store/auth-store"; // adjust path if needed
import { useRouter } from "next/navigation";

export default function ExplorePage() {
  const [activeTab, setActiveTab] = useState<"discover" | "search">("discover");
  const {
    trendingPoems,
    recentPoems,
    featuredCollections,
    loadTrendingPoems,
    loadRecentPoems,
    loadFeaturedCollections,
    searchResults,
  } = useDiscoveryStore();

  const { user } = useAuthStore();
  const router = useRouter();

  // state for modal visibility
  const [showAnonModal, setShowAnonModal] = useState(false);

  useEffect(() => {
    loadTrendingPoems();
    loadRecentPoems();
    loadFeaturedCollections();
  }, [loadTrendingPoems, loadRecentPoems, loadFeaturedCollections]);

  console.log("Trending Poems", trendingPoems);

  // Show the modal once for newly-created anonymous accounts
  useEffect(() => {
    if (!user) return;

    const userId = user.id;
    const hasPlain = Boolean(user.passwordHash);
    const isAnon = Boolean(user.passwordHash);

    if (!userId || !isAnon || !hasPlain) {
      setShowAnonModal(false);
      return;
    }

    const shownKey = `anon_shown_${userId}`;
    const alreadyShown = localStorage.getItem(shownKey);

    if (!alreadyShown) {
      // show the modal (one-time)
      setShowAnonModal(true);
    }
  }, [user]);

  // helper to persist that we've shown the modal
  const markModalShown = useCallback(() => {
    if (!user?.id) return;
    const key = `anon_shown_${user.id}`;
    try {
      localStorage.setItem(key, "1");
    } catch (err) {
      // ignore localStorage errors
    }
  }, [user?.id]);

  const handleCloseModal = () => {
    markModalShown();
    setShowAnonModal(false);
  };

  const handleViewAllTrending = () => {
    router.push('/explore/trending');
  }

  const handleViewAllRecent = () => {
    router.push('/explore/recent');
  }

  const handleViewAllCollections = () => {
    router.push('/collections');
  }

  // Copies a single value to clipboard and gives simple visual feedback
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // tiny feedback: brief browser-native alert can be replaced by toast
      // but keep things simple: use alert or set a small local state for a nicer toast
      // using alert to be simple:
      // alert("Copied to clipboard");
      // better: small non-blocking feedback using console + optional UI later
      console.info("Copied to clipboard");
    } catch (err) {
      console.error("Copy failed", err);
    }
  };

  const copyAll = async () => {
    if (!user) return;
    const all = `username: ${user.username}\nemail: ${user.email}\npassword: ${user?.passwordHash}`;
    await copyToClipboard(all);
  };

  const discoveryTabs = [
    {
      id: "trending",
      label: "Trending",
      icon: TrendingUp,
      poems: trendingPoems,
    },
    { id: "recent", label: "Recent", icon: Clock, poems: recentPoems },
    { id: "featured", label: "Featured", icon: Zap, poems: [] },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold gradient-text mb-4">
          Discover Poetry
        </h1>
        <p className="text-text-secondary text-lg max-w-2xl mx-auto">
          Explore thousands of poems, find new voices, and discover your next
          favorite piece of writing.
        </p>
      </motion.div>

      {/* Search/Discover Toggle */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex items-center justify-center mb-8"
      >
        <div className="glass-card p-1 rounded-lg flex">
          {[
            { id: "discover", label: "Discover", icon: Compass },
            { id: "search", label: "Search", icon: Search },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-3 rounded-md transition-all ${
                activeTab === tab.id
                  ? "bg-primary text-white"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              <tab.icon size={18} />
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {activeTab === "search" ? (
        /* Search Interface */
        <div className="space-y-8">
          <SearchInterface />

           {activeTab === "search" ? (
        /* Search Interface */
        <div className="space-y-8">
          <SearchInterface />

          {searchResults && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">
                  Search Results
                  <span className="text-text-muted text-lg ml-2">
                    ({searchResults.total} poems)
                  </span>
                </h2>
              </div>
              <PoemGrid poems={searchResults.poems} />
            </motion.div>
          )}
        </div>
      ) : (
        /* Discovery Interface */
        <div className="space-y-12">
          {/* Quick Filters */}
          <QuickFilters />

          {/* Trending Poems */}
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <TrendingUp className="text-secondary" />
                Trending Now
              </h2>
              <Button variant="outline" size="sm" onClick={handleViewAllTrending}>
                View All
              </Button>
            </div>
            <PoemGrid poems={trendingPoems} />
          </motion.section>

          {/* Featured Collections */}
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <FeaturedCollections 
              collections={featuredCollections}
              onViewAll={handleViewAllCollections}
            />
          </motion.section>

          {/* Recent Poems */}
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Clock className="text-primary" />
                Recently Published
              </h2>
              <Button variant="outline" size="sm" onClick={handleViewAllRecent}>
                View All
              </Button>
            </div>
            <PoemGrid poems={recentPoems} />
          </motion.section>
        </div>
      )}

        </div>
      ) : (
        /* Discovery Interface */
        <div className="space-y-12">
          {/* Quick Filters */}
          <QuickFilters />

          {/* Trending Poems */}
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <TrendingUp className="text-secondary" />
                Trending Now
              </h2>
              <Button variant="outline" size="sm">
                View All
              </Button>
            </div>
            <PoemGrid poems={trendingPoems} />
          </motion.section>

          {/* Featured Collections */}
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <FeaturedCollections collections={featuredCollections} />
          </motion.section>

          {/* Recent Poems */}
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Clock className="text-primary" />
                Recently Published
              </h2>
              <Button variant="outline" size="sm">
                View All
              </Button>
            </div>
            <PoemGrid poems={recentPoems} />
          </motion.section>
        </div>
      )}

      {/* Anonymous account one-time modal */}
      {showAnonModal && user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleCloseModal}
            aria-hidden
          />

          {/* modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.18 }}
            className="relative max-w-xl w-full glass-card p-6 rounded-2xl shadow-2xl text-text-primary"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-2xl font-bold gradient-text">
                  Welcome — your temporary account
                </h3>
                <p className="text-sm text-text-secondary mt-1">
                  This account was created for you anonymously.{" "}
                  <span className="font-semibold">
                    Save these credentials now — they will only be shown once.
                  </span>
                </p>
              </div>

              <div className="ml-auto">
                <button
                  aria-label="Close"
                  onClick={handleCloseModal}
                  className="rounded-md p-2 hover:bg-white/5"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              {/* Username */}
              <div className="flex items-center justify-between gap-4 p-4 bg-white/5 rounded-lg">
                <div>
                  <div className="text-xs text-text-muted">Username</div>
                  <div className="font-medium">{user.username}</div>
                </div>
                <button
                  onClick={() => copyToClipboard(user.username)}
                  className="btn-primary flex items-center gap-2 px-3 py-2 text-sm"
                >
                  <Copy size={14} /> Copy
                </button>
              </div>

              {/* Email */}
              <div className="flex items-center justify-between gap-4 p-4 bg-white/5 rounded-lg">
                <div>
                  <div className="text-xs text-text-muted">Email</div>
                  <div className="font-medium">{user.email}</div>
                </div>
                <button
                  onClick={() => copyToClipboard(user.email)}
                  className="btn-primary flex items-center gap-2 px-3 py-2 text-sm"
                >
                  <Copy size={14} /> Copy
                </button>
              </div>

              {/* Password */}
              <div className="flex items-center justify-between gap-4 p-4 bg-white/5 rounded-lg">
                <div>
                  <div className="text-xs text-text-muted">
                    Password (one-time)
                  </div>
                  <div className="font-medium">{user.passwordHash}</div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      if (user?.passwordHash) {
                        copyToClipboard(user.passwordHash);
                      }
                    }}
                    className="btn-primary flex items-center gap-2 px-3 py-2 text-sm"
                    disabled={!user?.passwordHash}
                  >
                    <Copy size={14} /> Copy
                  </button>
                  <button
                    onClick={copyAll}
                    className="btn-primary flex items-center gap-2 px-3 py-2 text-sm"
                  >
                    Copy all
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 mt-2">
                <div className="text-sm text-text-secondary">
                  Consider changing the password later to secure this account.
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // user didn't save yet, but if they close we still mark shown to prevent repeat
                      handleCloseModal();
                    }}
                  >
                    I saved this
                  </Button>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      // copy then close
                      copyAll();
                      handleCloseModal();
                    }}
                  >
                    Copy & Close
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
