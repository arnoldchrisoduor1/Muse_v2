// app/poem/[id]/page.tsx
"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Heart, 
  Bookmark, 
  Eye, 
  MessageCircle, 
  Share, 
  ArrowLeft,
  Calendar,
  Clock,
  Users,
  Shield,
  Sparkles
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PoemGrid } from "@/components/poem/PoemGrid";
import { useSoloPoetStore } from "@/lib/store/solo-poet-store";
import { useAuthStore } from "@/lib/store/auth-store";
import { useDiscoveryStore } from "@/lib/store/discovery-store";
interface Comment {
  id: string;
  content: string;
  author: {
    id: string;
    username: string;
    avatarUrl: string;
    isVerified: boolean;
  };
  createdAt: Date;
  likes: number;
}

export default function PoemDetailPage() {
  const params = useParams();
  const router = useRouter();
  const poemId = params.id as string;
  
  const [poem, setPoem] = useState<any>(null);
  const [recommendedPoems, setRecommendedPoems] = useState<any[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  
  const { 
    getPoem, 
    likePoem, 
    unlikePoem, 
    bookmarkPoem, 
    unbookmarkPoem,
    checkIfLiked, 
    checkIfBookmarked,
    addComment,
    getComments,
    incrementViews,
    recentPoems 
  } = useDiscoveryStore();
  const { user } = useAuthStore();

  useEffect(() => {
    loadPoemData();
  }, [poemId]);

  const loadPoemData = async () => {
    setIsLoading(true);
    try {
      // Load poem data
      const poemData = await getPoem(poemId);
      
      if (poemData) {
        setPoem(poemData);
        
        // Increment views
        await incrementViews(poemId);
        
        // Check if user has liked/bookmarked
        if (user) {
          const [liked, bookmarked] = await Promise.all([
            checkIfLiked(poemId),
            checkIfBookmarked(poemId)
          ]);
          setIsLiked(liked);
          setIsBookmarked(bookmarked);
        }
        
        // Load comments
        const commentsData = await getComments(poemId);
        setComments(commentsData.comments || []);
        
        // Load recommended poems (using recent poems as fallback)
        setRecommendedPoems(recentPoems.slice(0, 6));
      } else {
        router.push('/explore');
      }
    } catch (error) {
      console.error('Failed to load poem:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLike = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    try {
      if (isLiked) {
        await unlikePoem(poemId);
        setPoem(prev => prev ? { ...prev, likes: Math.max(0, prev.likes - 1) } : null);
      } else {
        await likePoem(poemId);
        setPoem(prev => prev ? { ...prev, likes: (prev.likes || 0) + 1 } : null);
      }
      setIsLiked(!isLiked);
    } catch (error) {
      console.error('Failed to toggle like:', error);
    }
  };

  const handleBookmark = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    try {
      if (isBookmarked) {
        await unbookmarkPoem(poemId);
        setPoem(prev => prev ? { ...prev, bookmarks: Math.max(0, prev.bookmarks - 1) } : null);
      } else {
        await bookmarkPoem(poemId);
        setPoem(prev => prev ? { ...prev, bookmarks: (prev.bookmarks || 0) + 1 } : null);
      }
      setIsBookmarked(!isBookmarked);
    } catch (error) {
      console.error('Failed to toggle bookmark:', error);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: poem?.title,
          text: poem?.excerpt,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !user) return;

    setIsSubmittingComment(true);
    try {
      const comment = await addComment(poemId, newComment);
      if (comment) {
        setComments(prev => [comment, ...prev]);
        setNewComment('');
        setPoem(prev => prev ? { ...prev, comments: (prev.comments || 0) + 1 } : null);
      }
    } catch (error) {
      console.error('Failed to submit comment:', error);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  console.log("Comments: ", comments);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-white/10 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-white/10 rounded w-1/2 mb-8"></div>
          <div className="space-y-3">
            <div className="h-4 bg-white/10 rounded"></div>
            <div className="h-4 bg-white/10 rounded"></div>
            <div className="h-4 bg-white/10 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!poem) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Poem Not Found</h1>
        <Button onClick={() => router.push('/explore')}>
          Back to Explore
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Navigation */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <Button
          variant="outline"
          icon={ArrowLeft}
          onClick={() => router.back()}
          className="mb-4"
        >
          Back
        </Button>
      </motion.div>

      {/* Poem Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="p-8 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <h1 className="text-4xl font-bold gradient-text mb-4">
                {poem.title}
              </h1>
              
              <div className="flex items-center gap-4 text-text-secondary mb-4">
                <div className="flex items-center gap-2">
                  <span>by {poem.author.username}</span>
                  {poem.author.isVerified && (
                    <Sparkles size={16} className="text-primary" />
                  )}
                </div>
                
                {poem.publishedAt && (
                  <div className="flex items-center gap-1">
                    <Calendar size={16} />
                    <span>{new Date(poem.publishedAt).toLocaleDateString()}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-1">
                  <Clock size={16} />
                  <span>{poem.readingTime || 2} min read</span>
                </div>
              </div>

              {/* Quality Score & Badges */}
              <div className="flex items-center gap-4 mb-4">
                <div className={`px-3 py-1 rounded-full text-sm font-bold ${
                  poem.qualityScore >= 85 ? 'bg-accent/20 text-accent' :
                  poem.qualityScore >= 70 ? 'bg-primary/20 text-primary' :
                  'bg-warning/20 text-warning'
                }`}>
                  Quality: {poem.qualityScore}%
                </div>
                
                <div className="flex items-center gap-2">
                  {poem.isCollaborative && (
                    <div className="flex items-center gap-1 text-primary">
                      <Users size={16} />
                      <span className="text-sm">Collaborative</span>
                    </div>
                  )}
                  {poem.isAnonymous && (
                    <div className="flex items-center gap-1 text-accent">
                      <Shield size={16} />
                      <span className="text-sm">Anonymous</span>
                    </div>
                  )}
                  {poem.nftTokenId && (
                    <div className="flex items-center gap-1 text-secondary">
                      <Sparkles size={16} />
                      <span className="text-sm">NFT</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {poem.tags?.map((tag: string) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-white/10 text-text-secondary rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between border-t border-white/10 pt-6">
            <div className="flex items-center gap-6 text-text-secondary">
              <div className="flex items-center gap-2">
                <Eye size={18} />
                <span>{poem.views?.toLocaleString() || 0} views</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart size={18} />
                <span>{poem.likes || 0} likes</span>
              </div>
              <div className="flex items-center gap-2">
                <Bookmark size={18} />
                <span>{poem.bookmarks || 0} saves</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle size={18} />
                <span>{poem.comments || 0} comments</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <Button
                variant={isLiked ? "primary" : "outline"}
                icon={Heart}
                onClick={handleLike}
                disabled={!user}
              >
                {isLiked ? 'Liked' : 'Like'}
              </Button>
              <Button
                variant={isBookmarked ? "primary" : "outline"}
                icon={Bookmark}
                onClick={handleBookmark}
                disabled={!user}
              >
                {isBookmarked ? 'Saved' : 'Save'}
              </Button>
              <Button
                variant="outline"
                icon={Share}
                onClick={handleShare}
              >
                Share
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Poem Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-12"
      >
        <Card className="p-8">
          <div className="prose prose-invert max-w-none">
            <div className="whitespace-pre-wrap text-lg leading-relaxed">
              {poem.content}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Comments Section */}
       <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.3 }}
    className="mb-12"
  >
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <MessageCircle className="text-primary" />
        Comments ({poem?.comments || 0})
      </h2>
      
      {user ? (
        <div className="space-y-6">
          {/* Comment input */}
          <div className="flex gap-4">
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your thoughts..."
                className="input-field min-h-[100px] resize-none"
                disabled={isSubmittingComment}
              />
            </div>
            <Button 
              variant="primary" 
              onClick={handleSubmitComment}
              disabled={!newComment.trim() || isSubmittingComment}
            >
              {isSubmittingComment ? 'Posting...' : 'Comment'}
            </Button>
          </div>
          
          {/* Comments list */}
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="p-4 bg-white/5 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold">
                      {comment.user.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold">{comment.user.username}</span>
                    {comment.user.isVerified && (
                      <Sparkles size={12} className="text-primary inline ml-1" />
                    )}
                    <span className="text-text-secondary text-sm ml-2">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <p className="text-text-primary">{comment.content}</p>
              </div>
            ))}
            
            {comments.length === 0 && (
              <div className="text-center text-text-secondary py-8">
                <MessageCircle size={48} className="mx-auto mb-4 opacity-50" />
                <p>No comments yet. Be the first to share your thoughts!</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-text-secondary mb-4">
            Please log in to view and post comments
          </p>
          <Button variant="primary" onClick={() => router.push('/login')}>
            Log In
          </Button>
        </div>
      )}
    </Card>
  </motion.div>

      {/* Recommended Poems */}
      {recommendedPoems.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-2xl font-bold mb-6">You Might Also Like</h2>
          <PoemGrid poems={recommendedPoems} />
        </motion.div>
      )}
    </div>
  );
}