// app/poem/[id]/page.tsx
"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Eye, Heart } from "lucide-react";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PoemGrid } from "@/components/poem/PoemGrid";
import { PoemHeader } from "@/components/poem/PoemHeader";
import { CommentsSection } from "@/components/poem/CommentsSection";
import { ConfirmationDialog } from "@/components/ui/ConfirmationDialog";

import { useDiscoveryStore } from "@/lib/store/discovery-store";
import { useAuthStore } from "@/lib/store/auth-store";
import { useSoloPoetStore } from "@/lib/store/solo-poet-store";

interface Comment {
  id: string;
  content: string;
  author: {
    id: string;
    username: string;
    avatarUrl?: string;
    isVerified?: boolean;
  };
  createdAt: string | Date;
  upvotes: number;
  downvotes: number;
  netVotes: number;
  votes?: Array<{
    userId: string;
    type: "UP" | "DOWN";
  }>;
  replies?: Comment[];
}

export default function PoemDetailPage() {
  const params = useParams();
  const router = useRouter();
  const poemId = params.id as string;

  // State
  const [poem, setPoem] = useState<any>(null);
  const [recommendedPoems, setRecommendedPoems] = useState<any[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [userVotes, setUserVotes] = useState<Record<string, "UP" | "DOWN" | null>>({});
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Stores
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
    voteOnComment,
    removeCommentVote,
    getCommentVote,
    recentPoems
  } = useDiscoveryStore();

  const { deleteDraft } = useSoloPoetStore();
  const { user } = useAuthStore();

  // Effects
  useEffect(() => {
    loadPoemData();
  }, [poemId, user?.id]);

  const loadPoemData = async () => {
    setIsLoading(true);
    try {
      const poemData = await getPoem(poemId);

      if (poemData) {
        setPoem(poemData);
        await incrementViews(poemId);

        if (user) {
          const [liked, bookmarked] = await Promise.all([
            checkIfLiked(poemId),
            checkIfBookmarked(poemId)
          ]);
          setIsLiked(liked);
          setIsBookmarked(bookmarked);
        }

        const commentsData = await getComments(poemId);
        const items: any[] = commentsData?.items || [];
        const normalized = normalizeComments(items);
        setComments(normalized);

        if (user) {
          await loadUserVotes(normalized);
        }

        setRecommendedPoems(recentPoems?.slice(0, 6) || []);
      } else {
        router.push("/explore");
      }
    } catch (error) {
      console.error("Failed to load poem:", error);
    } finally {
      setIsLoading(false);
    }
  };

 const normalizeComments = (items: any[]): Comment[] => {
     const mapComment = (c: any): Comment => {
       const author = c.author || c.user || {
         id: "unknown",
         username: "Unknown",
         avatarUrl: "",
         isVerified: false
       };
       return {
         id: c.id,
         content: c.content,
         author: {
           id: author.id,
           username: author.username || author.name || "Unknown",
           avatarUrl: author.avatarUrl || author.avatar || "",
           isVerified: !!author.isVerified
         },
         createdAt: c.createdAt || c.created_at || new Date().toISOString(),
         upvotes: c.upvotes ?? 0,
         downvotes: c.downvotes ?? 0,
         netVotes:
           typeof c.netVotes === "number"
             ? c.netVotes
             : (c.upvotes ?? 0) - (c.downvotes ?? 0),
         votes: c.votes || [],
         replies: (c.replies || []).map((r: any) => mapComment(r))
       };
     };
 
     return items.map(mapComment);
   };
 
   const loadUserVotes = async (commentsList: Comment[]) => {
     const votes: Record<string, "UP" | "DOWN" | null> = {};
 
     const walk = async (list: Comment[]) => {
       for (const comment of list) {
         try {
           const voteType = await getCommentVote(comment.id);
           votes[comment.id] = voteType ?? null;
         } catch (e) {
           votes[comment.id] = null;
         }
         if (comment.replies && comment.replies.length > 0) {
           await walk(comment.replies);
         }
       }
     };
 
     await walk(commentsList);
     setUserVotes(votes);
   };
 
   const handleEditPoem = () => {
     router.push(`/create?edit=${poemId}`);
   };
 
   const handleDeletePoem = async () => {
     try {
       await deletePoem(poemId, user!.id);
       setShowDeleteDialog(false);
       router.push("/profile");
     } catch (error) {
       console.error("Failed to delete poem:", error);
       alert("Failed to delete poem");
     }
   };
 
   const handleLike = async () => {
     if (!user) {
       router.push("/login");
       return;
     }
     try {
       if (isLiked) {
         await unlikePoem(poemId);
         setPoem((prev: any) =>
           prev ? { ...prev, likes: Math.max(0, (prev.likes || 0) - 1) } : prev
         );
       } else {
         await likePoem(poemId);
         setPoem((prev: any) => (prev ? { ...prev, likes: (prev.likes || 0) + 1 } : prev));
       }
       setIsLiked((s) => !s);
     } catch (error) {
       console.error("Failed to toggle like:", error);
     }
   };
 
   const handleBookmark = async () => {
     if (!user) {
       router.push("/login");
       return;
     }
 
     try {
       if (isBookmarked) {
         await unbookmarkPoem(poemId);
         setPoem((prev: any) =>
           prev ? { ...prev, bookmarks: Math.max(0, (prev.bookmarks || 0) - 1) } : prev
         );
       } else {
         await bookmarkPoem(poemId);
         setPoem((prev: any) => (prev ? { ...prev, bookmarks: (prev.bookmarks || 0) + 1 } : prev));
       }
       setIsBookmarked((s) => !s);
     } catch (error) {
       console.error("Failed to toggle bookmark:", error);
     }
   };
 
   const handleShare = async () => {
     if (!poem) return;
     if (navigator.share) {
       try {
         await navigator.share({
           title: poem?.title,
           text: poem?.excerpt,
           url: window.location.href
         });
       } catch (error) {
         // user cancelled
       }
     } else {
       try {
         await navigator.clipboard.writeText(window.location.href);
         alert("Link copied to clipboard!");
       } catch {
         // fallback
         prompt("Copy this link:", window.location.href);
       }
     }
   };

 
   const handleSubmitReply = async (parentCommentId: string) => {
     if (!replyContent.trim() || !user) return;
 
     try {
       const reply = await addComment(poemId, replyContent, parentCommentId);
       if (reply) {
         const normalizedReply = normalizeComments([reply])[0];
 
         setComments((prev) =>
           prev.map((c) =>
             c.id === parentCommentId
               ? { ...c, replies: [...(c.replies || []), normalizedReply] }
               : c
           )
         );
         setReplyContent("");
         setReplyingTo(null);
         setPoem((prev: any) =>
           prev ? { ...prev, comments: (prev.comments || 0) + 1 } : prev
         );
 
         if (user) {
           const vt = await getCommentVote(normalizedReply.id);
           setUserVotes((p) => ({ ...p, [normalizedReply.id]: vt ?? null }));
         }
       }
     } catch (error) {
       console.error("Failed to submit reply:", error);
     }
   };
 
   const handleDeleteComment = async (commentId: string) => {
     if (!confirm("Are you sure you want to delete this comment?")) return;
     try {
       await useDiscoveryStore.getState().deleteComment(commentId, poemId);
       // Remove comment (and also replies that match id)
       const filterOut = (list: Comment[]) =>
         list
           .filter((c) => c.id !== commentId)
           .map((c) => ({
             ...c,
             replies: c.replies ? filterOut(c.replies) : []
           }));
 
       setComments((prev) => filterOut(prev));
       setPoem((prev: any) =>
         prev ? { ...prev, comments: Math.max(0, (prev.comments || 0) - 1) } : prev
       );
       // remove cached vote
       setUserVotes((p) => {
         const copy = { ...p };
         delete copy[commentId];
         return copy;
       });
     } catch (error) {
       console.error("Failed to delete comment:", error);
     }
   };
 
   const handleVoteComment = async (commentId: string, voteType: "UP" | "DOWN") => {
     if (!user) {
       router.push("/login");
       return;
     }
 
     const currentVote = userVotes[commentId];
 
     try {
       if (currentVote === voteType) {
         // remove
         await removeCommentVote(commentId);
         setUserVotes((prev) => ({ ...prev, [commentId]: null }));
         setComments((prev) => updateCommentVotes(prev, commentId, currentVote, "REMOVE"));
       } else {
         await voteOnComment(commentId, voteType);
         setUserVotes((prev) => ({ ...prev, [commentId]: voteType }));
         if (currentVote) {
           setComments((prev) =>
             updateCommentVotes(prev, commentId, currentVote, "CHANGE", voteType)
           );
         } else {
           setComments((prev) => updateCommentVotes(prev, commentId, null, "ADD", voteType));
         }
       }
     } catch (error) {
       console.error("Failed to vote on comment:", error);
     }
   };
 
   const updateCommentVotes = (
     commentsList: Comment[],
     commentId: string,
     oldVote: "UP" | "DOWN" | null,
     action: "ADD" | "REMOVE" | "CHANGE",
     newVote?: "UP" | "DOWN"
   ): Comment[] => {
     return commentsList.map((comment) => {
       if (comment.id === commentId) {
         let upvotes = comment.upvotes || 0;
         let downvotes = comment.downvotes || 0;
         let netVotes = comment.netVotes ?? upvotes - downvotes;
 
         if (action === "ADD" && newVote) {
           upvotes += newVote === "UP" ? 1 : 0;
           downvotes += newVote === "DOWN" ? 1 : 0;
           netVotes += newVote === "UP" ? 1 : -1;
         } else if (action === "REMOVE" && oldVote) {
           upvotes -= oldVote === "UP" ? 1 : 0;
           downvotes -= oldVote === "DOWN" ? 1 : 0;
           netVotes -= oldVote === "UP" ? 1 : -1;
         } else if (action === "CHANGE" && oldVote && newVote) {
           upvotes -= oldVote === "UP" ? 1 : 0;
           downvotes -= oldVote === "DOWN" ? 1 : 0;
           netVotes -= oldVote === "UP" ? 1 : -1;
           upvotes += newVote === "UP" ? 1 : 0;
           downvotes += newVote === "DOWN" ? 1 : 0;
           netVotes += newVote === "UP" ? 1 : -1;
         }
 
         return { ...comment, upvotes, downvotes, netVotes };
       }
 
       if (comment.replies && comment.replies.length > 0) {
         return {
           ...comment,
           replies: updateCommentVotes(comment.replies, commentId, oldVote, action, newVote)
         };
       }
 
       return comment;
     });
   };

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !user) return;
    setIsSubmittingComment(true);
    try {
      const comment = await addComment(poemId, newComment);
      if (comment) {
        const normalized = normalizeComments([comment])[0];
        setComments((prev) => [normalized, ...prev]);
        setNewComment("");
        setPoem((prev: any) =>
          prev ? { ...prev, comments: (prev.comments || 0) + 1 } : prev
        );

        if (user) {
          const vt = await getCommentVote(normalized.id);
          setUserVotes((p) => ({ ...p, [normalized.id]: vt ?? null }));
        }
      }
    } catch (error) {
      console.error("Failed to submit comment:", error);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // Loading states
  if (isLoading) {
    return <PoemDetailSkeleton />;
  }

  if (!poem) {
    return (
      <div className="mobile-container max-w-4xl mx-auto p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Poem Not Found</h1>
        <Button onClick={() => router.push("/explore")} className="btn-primary">
          Back to Explore
        </Button>
      </div>
    );
  }

  return (
    <div className="mobile-container max-w-4xl mx-auto p-4 sm:p-6">
      {/* Navigation */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            icon={ArrowLeft}
            onClick={() => router.back()}
            className="glass-card-nav"
          >
            Back
          </Button>
          
          <button
            onClick={() => {
              navigator.clipboard?.writeText(window.location.href);
              // Add toast notification here
            }}
            className="text-sm text-text-secondary hover:text-primary transition-colors hidden sm:block"
          >
            Copy Link
          </button>
        </div>
      </motion.div>

      {/* Poem Header */}
      <PoemHeader
        poem={poem}
        user={user}
        onEdit={handleEditPoem}
        onDelete={() => setShowDeleteDialog(true)}
        isLiked={isLiked}
        isBookmarked={isBookmarked}
        onLike={handleLike}
        onBookmark={handleBookmark}
        onShare={handleShare}
        views={poem.views || 0}
        likes={poem.likes || 0}
      />

      {/* Poem Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-8"
      >
        <Card className="p-4 sm:p-6">
          <div className="prose prose-invert max-w-none">
            <div className="whitespace-pre-wrap text-base sm:text-lg leading-relaxed font-light">
              {poem.content}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Comments Section */}
      <CommentsSection
        comments={comments}
        user={user}
        userVotes={userVotes}
        newComment={newComment}
        onNewCommentChange={setNewComment}
        onSubmitComment={handleSubmitComment}
        onVoteComment={handleVoteComment}
        onReply={setReplyingTo}
        onDeleteComment={handleDeleteComment}
        replyingTo={replyingTo}
        replyContent={replyContent}
        onReplyContentChange={setReplyContent}
        onSubmitReply={handleSubmitReply}
        onCancelReply={() => {
          setReplyingTo(null);
          setReplyContent("");
        }}
        isSubmittingComment={isSubmittingComment}
        totalComments={poem?.comments || 0}
        onLoginRedirect={() => router.push("/login")}
      />

      {/* Recommended Poems */}
      {recommendedPoems.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-xl sm:text-2xl font-bold mb-6">You Might Also Like</h2>
          <PoemGrid poems={recommendedPoems} />
        </motion.div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDeletePoem}
        title="Delete Poem"
        message="Are you sure you want to delete this poem? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isDestructive={true}
      />
    </div>
  );
}

// Skeleton Loader Component
function PoemDetailSkeleton() {
  return (
    <div className="mobile-container max-w-4xl mx-auto p-6">
      <div className="animate-pulse space-y-6">
        {/* Back button skeleton */}
        <div className="h-10 bg-white/10 rounded w-24 mb-6"></div>
        
        {/* Header skeleton */}
        <div className="glass-card p-6 space-y-4">
          <div className="h-8 bg-white/10 rounded w-3/4"></div>
          <div className="h-4 bg-white/10 rounded w-1/2"></div>
          <div className="h-6 bg-white/10 rounded w-1/4"></div>
        </div>
        
        {/* Content skeleton */}
        <div className="glass-card p-6 space-y-3">
          <div className="h-4 bg-white/10 rounded"></div>
          <div className="h-4 bg-white/10 rounded"></div>
          <div className="h-4 bg-white/10 rounded w-5/6"></div>
        </div>
      </div>
    </div>
  );
}

// Keep your existing helper functions (normalizeComments, loadUserVotes, handleSubmitReply, handleDeleteComment, handleVoteComment, updateCommentVotes)
// They work perfectly, just need to be included in the file