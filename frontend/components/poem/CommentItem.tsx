import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Trash2, ThumbsUp, ThumbsDown, Reply } from "lucide-react";
import { Button } from "@/components/ui/Button";

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
  replies?: Comment[];
}

interface CommentItemProps {
  comment: Comment;
  user: any;
  userVote: "UP" | "DOWN" | null;
  onVote: (commentId: string, voteType: "UP" | "DOWN") => void;
  onReply: (commentId: string) => void;
  onDelete: (commentId: string) => void;
  isReplying?: boolean;
  replyContent?: string;
  onReplyContentChange?: (content: string) => void;
  onSubmitReply?: () => void;
  onCancelReply?: () => void;
}

export const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  user,
  userVote,
  onVote,
  onReply,
  onDelete,
  isReplying = false,
  replyContent = "",
  onReplyContentChange,
  onSubmitReply,
  onCancelReply
}) => {
  const [showReplies, setShowReplies] = useState(true);
  const isAuthor = user?.id === comment.author.id;

  return (
    <div className="p-4 bg-white/3 rounded-lg">
      {/* Comment Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-semibold">
              {comment.author.username?.charAt(0)?.toUpperCase() ?? "U"}
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm">{comment.author.username}</span>
              {comment.author.isVerified && <Sparkles size={12} className="text-primary" />}
              <span className="text-text-secondary text-xs">
                {new Date(comment.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {isAuthor && (
          <button
            onClick={() => onDelete(comment.id)}
            className="text-text-secondary hover:text-error transition-colors p-1"
            aria-label="Delete comment"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>

      {/* Comment Content */}
      <p className="text-text-primary text-sm mb-3">{comment.content}</p>

      {/* Comment Actions */}
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-1">
          <button
            onClick={() => onVote(comment.id, "UP")}
            className={`p-1 rounded transition-colors ${
              userVote === "UP" 
                ? "text-accent bg-accent/10" 
                : "text-text-secondary hover:text-accent"
            }`}
            aria-label="Upvote"
          >
            <ThumbsUp size={14} />
          </button>

          <span className={`font-medium min-w-[2ch] text-center text-xs ${
            comment.netVotes > 0 ? "text-accent" : 
            comment.netVotes < 0 ? "text-error" : 
            "text-text-secondary"
          }`}>
            {comment.netVotes}
          </span>

          <button
            onClick={() => onVote(comment.id, "DOWN")}
            className={`p-1 rounded transition-colors ${
              userVote === "DOWN" 
                ? "text-error bg-error/10" 
                : "text-text-secondary hover:text-error"
            }`}
            aria-label="Downvote"
          >
            <ThumbsDown size={14} />
          </button>
        </div>

        <button
          onClick={() => onReply(comment.id)}
          className="text-text-secondary hover:text-primary transition-colors flex items-center gap-1"
        >
          <Reply size={14} />
          Reply
        </button>
      </div>

      {/* Reply Input */}
      {isReplying && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mt-4 pl-4 border-l-2 border-primary/20"
        >
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={replyContent}
              onChange={(e) => onReplyContentChange?.(e.target.value)}
              placeholder="Write a reply..."
              className="input-field flex-1 text-sm"
              onKeyPress={(e) => e.key === 'Enter' && onSubmitReply?.()}
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={onSubmitReply} disabled={!replyContent.trim()}>
                Reply
              </Button>
              <Button variant="outline" size="sm" onClick={onCancelReply}>
                Cancel
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-4">
          <button
            onClick={() => setShowReplies(!showReplies)}
            className="text-xs text-primary mb-2 hover:underline"
          >
            {showReplies ? 'Hide' : 'Show'} {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
          </button>
          
          {showReplies && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-3 pl-4 border-l-2 border-white/10"
            >
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  user={user}
                  userVote={userVote}
                  onVote={onVote}
                  onReply={onReply}
                  onDelete={onDelete}
                />
              ))}
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
};