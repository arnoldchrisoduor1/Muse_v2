import { motion } from "framer-motion";
import { Calendar, Clock, Users, Shield, Sparkles, Edit, Trash2, Bookmark, Share, Heart, Eye } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface PoemHeaderProps {
  poem: any;
  user: any;
  onEdit: () => void;
  onDelete: () => void;
  isLiked: boolean;
  isBookmarked: boolean;
  onLike: () => void;
  onBookmark: () => void;
  onShare: () => void;
  views: number;
  likes: number;
}

export const PoemHeader: React.FC<PoemHeaderProps> = ({
  poem,
  user,
  onEdit,
  onDelete,
  isLiked,
  isBookmarked,
  onLike,
  onBookmark,
  onShare,
  views,
  likes
}) => {
  const isAuthor = user && (poem.authorId === user.id || poem.author?.id === user.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <Card className="p-4 sm:p-6 mb-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Title and Metadata */}
          <div className="lg:col-span-2">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
              <h1 className="text-2xl sm:text-4xl font-bold gradient-text">
                {poem.title}
              </h1>
              
              {isAuthor && (
                <div className="flex gap-2 flex-shrink-0">
                  <Button variant="outline" size="sm" icon={Edit} onClick={onEdit}>
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" icon={Trash2} onClick={onDelete} className="text-error">
                    Delete
                  </Button>
                </div>
              )}
            </div>

            {/* Author and Date */}
            <div className="flex flex-wrap items-center gap-3 text-text-secondary text-sm mb-4">
              <div className="flex items-center gap-2">
                <span>by {poem.author?.username || poem.authorName || "Unknown"}</span>
                {poem.author?.isVerified && <Sparkles size={16} className="text-primary" />}
              </div>

              {poem.publishedAt && (
                <div className="flex items-center gap-1">
                  <Calendar size={14} />
                  <span>{new Date(poem.publishedAt).toLocaleDateString()}</span>
                </div>
              )}

              <div className="flex items-center gap-1">
                <Clock size={14} />
                <span>{poem.readingTime || 2} min read</span>
              </div>
            </div>

            {/* Quality Score and Badges */}
            <div className="flex items-center gap-3 flex-wrap mb-4">
              <div
                className={`px-3 py-1 rounded-full text-sm font-bold ${
                  (poem.qualityScore ?? 0) >= 85
                    ? "bg-accent/20 text-accent"
                    : (poem.qualityScore ?? 0) >= 70
                    ? "bg-primary/20 text-primary"
                    : "bg-warning/20 text-warning"
                }`}
              >
                Quality: {poem.qualityScore ?? 0}%
              </div>

              <div className="flex items-center gap-2 text-sm">
                {poem.isCollaborative && (
                  <div className="flex items-center gap-1 text-primary">
                    <Users size={14} />
                    <span>Collaborative</span>
                  </div>
                )}
                {poem.isAnonymous && (
                  <div className="flex items-center gap-1 text-accent">
                    <Shield size={14} />
                    <span>Anonymous</span>
                  </div>
                )}
                {poem.nftTokenId && (
                  <div className="flex items-center gap-1 text-secondary">
                    <Sparkles size={14} />
                    <span>NFT</span>
                  </div>
                )}
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {poem.tags?.map((tag: string) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-white/5 text-text-secondary rounded-full text-sm"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* Stats and Actions */}
          <div className="flex flex-col gap-4 items-start lg:items-end">
            <div className="flex items-center gap-4 text-text-secondary text-sm">
              <div className="flex items-center gap-2">
                <Eye size={16} />
                <span>{views.toLocaleString()} views</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart size={16} />
                <span>{likes} likes</span>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap justify-end">
              <Button
                variant={isLiked ? "primary" : "outline"}
                size="sm"
                icon={Heart}
                onClick={onLike}
                disabled={!user}
              >
                {isLiked ? "Liked" : "Like"}
              </Button>

              <Button
                variant={isBookmarked ? "primary" : "outline"}
                size="sm"
                icon={Bookmark}
                onClick={onBookmark}
                disabled={!user}
              >
                {isBookmarked ? "Saved" : "Save"}
              </Button>

              <Button variant="outline" size="sm" icon={Share} onClick={onShare}>
                Share
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};