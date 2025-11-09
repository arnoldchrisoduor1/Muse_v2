"use client";
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { User, Mail, Calendar, MapPin, Link as LinkIcon, Twitter, Instagram, Edit, Plus, Users, BookOpen, DollarSign, Award } from 'lucide-react';
import { useUserStore } from '@/lib/store/user-store';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ProfileTabs } from '@/components/profile/ProfileTabs';
import { ProfileStats } from '@/components/profile/ProfileStats';
import { BadgeDisplay } from '@/components/profile/BadgeDisplay';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function ProfilePage() {
  const params = useParams();
  const username = params.username as string;
  const [activeTab, setActiveTab] = useState<'poems' | 'collections' | 'collaborations' | 'analytics'>('poems');
  
  const {
    viewedProfile,
    userPoems,
    userCollections,
    userCollaborations,
    earnings,
    loadUserProfile,
    loadUserPoems,
    loadUserCollections,
    loadEarningsData,
    followUser,
    unfollowUser,
    isLoading,
  } = useUserStore();

  const isOwnProfile = viewedProfile?.username === 'current_user'; // In real app, compare with logged-in user

  useEffect(() => {
    if (username) {
      loadUserProfile(username);
      loadUserPoems(username);
      loadUserCollections(username);
      if (isOwnProfile) {
        loadEarningsData(username);
      }
    }
  }, [username, loadUserProfile, loadUserPoems, loadUserCollections, loadEarningsData, isOwnProfile]);

  if (isLoading && !viewedProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-secondary">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!viewedProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <User size={64} className="text-text-muted mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">User Not Found</h1>
          <p className="text-text-secondary">The profile you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Profile Header */}
      <ProfileHeader 
        profile={viewedProfile} 
        isOwnProfile={isOwnProfile}
        onFollow={followUser}
        onUnfollow={unfollowUser}
      />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Info Card */}
            <Card className="p-6">
              <div className="space-y-4">
                {/* Bio */}
                <div>
                  <h3 className="font-semibold mb-2">About</h3>
                  <p className="text-text-secondary text-sm leading-relaxed">
                    {viewedProfile.bio || 'No bio yet.'}
                  </p>
                </div>

                {/* Join Date */}
                <div className="flex items-center gap-2 text-sm text-text-muted">
                  <Calendar size={16} />
                  <span>Joined {viewedProfile.joinedAt.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                </div>

                {/* Social Links */}
                {(viewedProfile.website || viewedProfile.twitter || viewedProfile.instagram) && (
                  <div>
                    <h4 className="font-semibold mb-2 text-sm">Connect</h4>
                    <div className="space-y-2">
                      {viewedProfile.website && (
                        <a 
                          href={viewedProfile.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-text-secondary hover:text-primary transition-colors text-sm"
                        >
                          <LinkIcon size={14} />
                          <span>Website</span>
                        </a>
                      )}
                      {viewedProfile.twitter && (
                        <a 
                          href={`https://twitter.com/${viewedProfile.twitter}`}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-text-secondary hover:text-primary transition-colors text-sm"
                        >
                          <Twitter size={14} />
                          <span>@{viewedProfile.twitter}</span>
                        </a>
                      )}
                      {viewedProfile.instagram && (
                        <a 
                          href={`https://instagram.com/${viewedProfile.instagram}`}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-text-secondary hover:text-primary transition-colors text-sm"
                        >
                          <Instagram size={14} />
                          <span>@{viewedProfile.instagram}</span>
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Wallet Address */}
                <div>
                  <h4 className="font-semibold mb-2 text-sm">Wallet</h4>
                  <div className="text-xs text-text-muted font-mono bg-white/5 p-2 rounded">
                    {viewedProfile.walletAddress.substring(0, 16)}...
                  </div>
                </div>
              </div>
            </Card>

            {/* Badges */}
            <BadgeDisplay badges={viewedProfile.badges} />

            {/* Quick Stats */}
            <ProfileStats profile={viewedProfile} />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Action Bar */}
            <div className="flex items-center justify-between">
              <ProfileTabs 
                activeTab={activeTab} 
                onTabChange={setActiveTab}
                stats={{
                  poems: userPoems.length,
                  collections: userCollections.length,
                  collaborations: userCollaborations.length,
                }}
              />
              
              {isOwnProfile && (
                <div className="flex gap-3">
                  <Button variant="outline" icon={Edit}>
                    Edit Profile
                  </Button>
                  <Button variant="primary" icon={Plus}>
                    New Poem
                  </Button>
                </div>
              )}
            </div>

            {/* Tab Content */}
            <div className="min-h-[400px]">
              {activeTab === 'poems' && <PoemsTab poems={userPoems} />}
              {activeTab === 'collections' && <CollectionsTab collections={userCollections} />}
              {activeTab === 'collaborations' && <CollaborationsTab collaborations={userCollaborations} />}
              {activeTab === 'analytics' && <AnalyticsTab earnings={earnings} isOwnProfile={isOwnProfile} />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Tab Components
function PoemsTab({ poems }: { poems: any[] }) {
  if (poems.length === 0) {
    return (
      <Card className="p-8 text-center">
        <BookOpen size={48} className="text-text-muted mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No poems yet</h3>
        <p className="text-text-secondary">Start writing to see your poems here.</p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {poems.map((poem, index) => (
        <motion.div
          key={poem.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="p-6 hover:bg-white/10 transition-colors cursor-pointer">
            <h3 className="font-semibold text-lg mb-2">{poem.title}</h3>
            <p className="text-text-secondary text-sm mb-4 line-clamp-2">
              {poem.excerpt}
            </p>
            <div className="flex items-center justify-between text-sm text-text-muted">
              <div className="flex items-center gap-4">
                <span>{poem.views.toLocaleString()} views</span>
                <span>{poem.likes} likes</span>
              </div>
              <span>${poem.earnings.toFixed(2)}</span>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

function CollectionsTab({ collections }: { collections: any[] }) {
  if (collections.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Users size={48} className="text-text-muted mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No collections yet</h3>
        <p className="text-text-secondary">Create collections to organize your favorite poems.</p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {collections.map((collection, index) => (
        <motion.div
          key={collection.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="p-6 hover:bg-white/10 transition-colors cursor-pointer">
            <h3 className="font-semibold text-lg mb-2">{collection.title}</h3>
            <p className="text-text-secondary text-sm mb-4 line-clamp-2">
              {collection.description}
            </p>
            <div className="flex items-center justify-between text-sm text-text-muted">
              <span>{collection.poemCount} poems</span>
              <span>{collection.followers} followers</span>
              <span className={collection.isPublic ? 'text-accent' : 'text-warning'}>
                {collection.isPublic ? 'Public' : 'Private'}
              </span>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

function CollaborationsTab({ collaborations }: { collaborations: any[] }) {
  if (collaborations.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Users size={48} className="text-text-muted mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No collaborations yet</h3>
        <p className="text-text-secondary">Join or start a collaboration to see it here.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {collaborations.map((collab, index) => (
        <motion.div
          key={collab.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="p-6 hover:bg-white/10 transition-colors cursor-pointer">
            <h3 className="font-semibold text-lg mb-2">{collab.title}</h3>
            <p className="text-text-secondary text-sm mb-4">
              {collab.description}
            </p>
            <div className="flex items-center justify-between text-sm text-text-muted">
              <span>With {collab.participants} poets</span>
              <span>Created {collab.createdAt.toLocaleDateString()}</span>
              <span className={collab.status === 'active' ? 'text-accent' : 'text-primary'}>
                {collab.status}
              </span>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

function AnalyticsTab({ earnings, isOwnProfile }: { earnings: any, isOwnProfile: boolean }) {
  if (!isOwnProfile) {
    return (
      <Card className="p-8 text-center">
        <DollarSign size={48} className="text-text-muted mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Private Analytics</h3>
        <p className="text-text-secondary">Only you can view your earnings and analytics.</p>
      </Card>
    );
  }

  if (!earnings) {
    return (
      <Card className="p-8 text-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-text-secondary">Loading analytics...</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Earnings Overview</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-white/5 rounded-lg">
            <div className="text-2xl font-bold text-accent mb-1">
              ${earnings.totalEarnings.toFixed(2)}
            </div>
            <div className="text-sm text-text-muted">Total Earned</div>
          </div>
          <div className="text-center p-4 bg-white/5 rounded-lg">
            <div className="text-2xl font-bold text-primary mb-1">
              ${earnings.thisMonth.toFixed(2)}
            </div>
            <div className="text-sm text-text-muted">This Month</div>
          </div>
          <div className="text-center p-4 bg-white/5 rounded-lg">
            <div className="text-2xl font-bold text-secondary mb-1">
              ${earnings.lastMonth.toFixed(2)}
            </div>
            <div className="text-sm text-text-muted">Last Month</div>
          </div>
          <div className="text-center p-4 bg-white/5 rounded-lg">
            <div className="text-2xl font-bold text-warning mb-1">
              {earnings.history.length}
            </div>
            <div className="text-sm text-text-muted">Transactions</div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold mb-4">Revenue Sources</h3>
        <div className="space-y-3">
          {Object.entries(earnings.bySource).map(([source, amount]) => (
            <div key={source} className="flex items-center justify-between">
              <span className="text-text-secondary capitalize">
                {source.replace(/([A-Z])/g, ' $1')}
              </span>
              <div className="flex items-center gap-4">
                <div className="w-24 bg-white/10 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full bg-primary"
                    style={{ 
                      width: `${((amount as number) / earnings.totalEarnings) * 100}%` 
                    }}
                  />
                </div>
                <span className="text-text-primary font-medium w-16 text-right">
                  ${(amount as number).toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}