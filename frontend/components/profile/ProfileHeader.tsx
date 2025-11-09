"use client";
import { motion } from 'framer-motion';
import { User, Mail, MapPin, Calendar, Edit, Users, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ProfileHeaderProps {
  profile: any;
  isOwnProfile: boolean;
  onFollow: (userId: string) => void;
  onUnfollow: (userId: string) => void;
}

export function ProfileHeader({ profile, isOwnProfile, onFollow, onUnfollow }: ProfileHeaderProps) {
  const isFollowing = false; // In real app, check if current user is following

  return (
    <div className="relative">
      {/* Cover Image */}
      <div 
        className="h-64 bg-gradient-135 from-purple-900 via-indigo-900 to-blue-900 relative"
        style={{
          backgroundImage: profile.coverImageUrl ? `url(${profile.coverImageUrl})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-black/40" />
        
        {/* Edit Cover Button (Own Profile Only) */}
        {isOwnProfile && (
          <div className="absolute top-4 right-4">
            <Button variant="outline" size="sm" icon={Edit}>
              Edit Cover
            </Button>
          </div>
        )}
      </div>

      {/* Profile Info */}
      <div className="max-w-7xl mx-auto px-6 -mt-16 relative z-10">
        <div className="flex flex-col lg:flex-row items-start lg:items-end gap-6">
          {/* Avatar */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="relative"
          >
            <div className="w-32 h-32 rounded-full border-4 border-bg-primary bg-bg-primary overflow-hidden">
              {profile.avatarUrl ? (
                <img 
                  src={profile.avatarUrl} 
                  alt={profile.username}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-90 from-primary to-secondary flex items-center justify-center">
                  <User size={48} className="text-white" />
                </div>
              )}
            </div>
            
            {/* Verification Badge */}
            {profile.verificationStatus === 'verified' && (
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-accent rounded-full flex items-center justify-center border-2 border-bg-primary">
                <div className="text-white text-xs font-bold">✓</div>
              </div>
            )}
          </motion.div>

          {/* Profile Details */}
          <div className="flex-1 text-white pb-6">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
              <div className="space-y-2">
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-3xl lg:text-4xl font-bold"
                >
                  {profile.username}
                </motion.h1>
                
                {profile.bio && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-lg text-white/80 max-w-2xl"
                  >
                    {profile.bio}
                  </motion.p>
                )}

                {/* Stats */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="flex items-center gap-6 text-white/80 text-sm"
                >
                  <div className="flex items-center gap-1">
                    <Users size={16} />
                    <span>{profile.followersCount.toLocaleString()} followers</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>{profile.followingCount} following</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar size={16} />
                    <span>Joined {profile.joinedAt.toLocaleDateString()}</span>
                  </div>
                </motion.div>
              </div>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="flex gap-3"
              >
                {isOwnProfile ? (
                  <>
                    <Button variant="outline" icon={Edit}>
                      Edit Profile
                    </Button>
                    <Button variant="primary" icon={Plus}>
                      New Poem
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" icon={Mail}>
                      Message
                    </Button>
                    <Button 
                      variant={isFollowing ? "outline" : "primary"}
                      onClick={() => isFollowing ? onUnfollow(profile.id) : onFollow(profile.id)}
                    >
                      {isFollowing ? 'Following' : 'Follow'}
                    </Button>
                  </>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}