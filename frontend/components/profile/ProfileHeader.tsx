"use client";
import { motion } from "framer-motion";
import { User, Mail, MapPin, Calendar, Edit, Users, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useEffect, useState } from "react";
import { UpdateProfileModal } from "./UpdateProfileModal";
import { useUserStore } from "@/lib/store/user-store";

interface ProfileHeaderProps {
  myProfile: any;
  viewedProfile: any;
  isOwnProfile: boolean;
  // make these async (or return a promise) so the UI can wait for completion
  onFollow: (followerId: string, targetId: string) => Promise<any> | any;
  onUnfollow: (followerId: string, targetId: string) => Promise<any> | any;
}

export function ProfileHeader({
  myProfile,
  isOwnProfile,
  onFollow,
  onUnfollow,
  viewedProfile,
}: ProfileHeaderProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { checkIfIfollowThisUser, isFollowing } = useUserStore();

  // local UI state so we can update counts immediately
  const [isFollowingLocal, setIsFollowingLocal] = useState<boolean>(false);
  const [followersCount, setFollowersCount] = useState<number>(
    viewedProfile?.followersCount ?? 0
  );

  // initialize local state whenever viewedProfile or myProfile change
  useEffect(() => {
    setFollowersCount(viewedProfile?.followersCount ?? 0);
    // call store to get canonical isFollowing value (async)
    if (myProfile?.id && viewedProfile?.id) {
      checkIfIfollowThisUser(myProfile.id, viewedProfile.id)
        // if checkIfIfollowThisUser updates the store's isFollowing, we sync local copy after a tick
        .finally(() => setIsFollowingLocal(Boolean(isFollowing)));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myProfile?.id, viewedProfile?.id]);

  // Also keep local boolean in sync if the store changes elsewhere
  useEffect(() => {
    setIsFollowingLocal(Boolean(isFollowing));
  }, [isFollowing]);

  // handler that awaits the parent follow/unfollow then re-syncs state
  const handleFollowToggle = async () => {
    if (!myProfile?.id || !viewedProfile?.id) return;

    // optimistic update: flip local isFollowing and adjust followersCount
    const wasFollowing = isFollowingLocal;
    setIsFollowingLocal(!wasFollowing);
    setFollowersCount((c) => (wasFollowing ? c - 1 : c + 1));

    try {
      if (wasFollowing) {
        // call parent's unfollow (await if it returns a promise)
        await onUnfollow(myProfile.id, viewedProfile.id);
      } else {
        await onFollow(myProfile.id, viewedProfile.id);
      }

      // after successful server update, ask store to re-check follow status (canonical)
      await checkIfIfollowThisUser(myProfile.id, viewedProfile.id);

      // optionally refresh follower count from server: 
      // if you have an endpoint to fetch viewedProfile, call it from parent and pass updated viewedProfile down.
      // Otherwise, we rely on optimistic UI updated above and the store re-check.
    } catch (err) {
      // rollback optimistic update on error
      setIsFollowingLocal(wasFollowing);
      setFollowersCount((c) => (wasFollowing ? c + 1 : c - 1));
      console.error("Follow/unfollow failed", err);
    }
  };

  return (
    <div className="relative">
      {/* Cover Image */}
      <div
        className="h-64 bg-gradient-135 from-purple-900 via-indigo-900 to-blue-900 relative"
        style={{
          backgroundImage: viewedProfile?.coverImageUrl
            ? `url(${viewedProfile?.coverImageUrl})`
            : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/40" />

        {isOwnProfile && (
          <div className="absolute top-4 right-4">
            <Button variant="outline" size="sm" icon={Edit}>
              Edit Cover
            </Button>
          </div>
        )}
      </div>

      <UpdateProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />

      {/* Profile Info */}
      <div className="max-w-7xl mx-auto px-6 -mt-16 relative z-10">
        <div className="flex flex-col lg:flex-row items-start lg:items-end gap-6">
          {/* Avatar */}
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="relative">
            <div className="w-32 h-32 rounded-full border-4 border-bg-primary bg-bg-primary overflow-hidden">
              {viewedProfile?.avatarUrl ? (
                <img src={viewedProfile.avatarUrl} alt={viewedProfile.username} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-90 from-primary to-secondary flex items-center justify-center">
                  <User size={48} className="text-white" />
                </div>
              )}
            </div>

            {viewedProfile?.verificationStatus === "verified" && (
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-accent rounded-full flex items-center justify-center border-2 border-bg-primary">
                <div className="text-white text-xs font-bold">✓</div>
              </div>
            )}
          </motion.div>

          {/* Profile Details */}
          <div className="flex-1 text-white pb-6">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
              <div className="space-y-2">
                <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-3xl lg:text-4xl font-bold">
                  {viewedProfile?.username}
                </motion.h1>

                {viewedProfile?.bio && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-lg text-white/80 max-w-2xl">
                    {viewedProfile?.bio}
                  </motion.p>
                )}

                {/* Stats */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="flex items-center gap-6 text-white/80 text-sm">
                  <div className="flex items-center gap-1">
                    <Users size={16} />
                    <span>{followersCount.toLocaleString()} followers</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>{viewedProfile?.followingCount ?? 0} following</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar size={16} />
                  </div>
                </motion.div>
              </div>

              {/* Action Buttons */}
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="flex gap-3">
                {isOwnProfile ? (
                  <>
                    <Button variant="outline" icon={Edit} className="flex-1 sm:flex-none" onClick={() => setIsEditModalOpen(true)}>
                      Edit
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
                    <Button variant={isFollowingLocal ? "outline" : "primary"} onClick={handleFollowToggle}>
                      {isFollowingLocal ? "Following" : "Follow"}
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
