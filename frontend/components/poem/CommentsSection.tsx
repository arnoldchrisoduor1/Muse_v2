import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CommentItem } from "./CommentItem";

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

interface CommentsSectionProps {
  comments: Comment[];
  user: any;
  userVotes: Record<string, "UP" | "DOWN" | null>;
  newComment: string;
  onNewCommentChange: (content: string) => void;
  onSubmitComment: () => void;
  onVoteComment: (commentId: string, voteType: "UP" | "DOWN") => void;
  onReply: (commentId: string) => void;
  onDeleteComment: (commentId: string) => void;
  replyingTo: string | null;
  replyContent: string;
  onReplyContentChange: (content: string) => void;
  onSubmitReply: (commentId: string) => void;
  onCancelReply: () => void;
  isSubmittingComment: boolean;
  totalComments: number;
  onLoginRedirect: () => void;
}

export const CommentsSection: React.FC<CommentsSectionProps> = ({
  comments,
  user,
  userVotes,
  newComment,
  onNewCommentChange,
  onSubmitComment,
  onVoteComment,
  onReply,
  onDeleteComment,
  replyingTo,
  replyContent,
  onReplyContentChange,
  onSubmitReply,
  onCancelReply,
  isSubmittingComment,
  totalComments,
  onLoginRedirect
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="mb-8"
    >
      <Card className="p-4 sm:p-6">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center gap-2">
          <MessageCircle className="text-primary" size={20} />
          Comments ({totalComments})
        </h2>

        {user ? (
          <div className="space-y-6">
            {/* Comment Input */}
            <div className="flex flex-col gap-4">
              <textarea
                value={newComment}
                onChange={(e) => onNewCommentChange(e.target.value)}
                placeholder="Share your thoughts..."
                className="input-field min-h-[80px] resize-none text-sm sm:text-base"
                disabled={isSubmittingComment}
                onKeyPress={(e) => e.key === 'Enter' && (e.ctrlKey || e.metaKey) && onSubmitComment()}
              />
              <div className="flex justify-between items-center">
                <span className="text-xs text-text-secondary">
                  Press Ctrl+Enter to submit
                </span>
                <Button
                  onClick={onSubmitComment}
                  disabled={!newComment.trim() || isSubmittingComment}
                  className="btn-primary"
                >
                  {isSubmittingComment ? "Posting..." : "Comment"}
                </Button>
              </div>
            </div>

            {/* Comments List */}
            <div className="space-y-4">
              {comments.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  user={user}
                  userVote={userVotes[comment.id] ?? null}
                  onVote={onVoteComment}
                  onReply={onReply}
                  onDelete={onDeleteComment}
                  isReplying={replyingTo === comment.id}
                  replyContent={replyingTo === comment.id ? replyContent : ""}
                  onReplyContentChange={onReplyContentChange}
                  onSubmitReply={() => onSubmitReply(comment.id)}
                  onCancelReply={onCancelReply}
                />
              ))}

              {comments.length === 0 && (
                <div className="text-center text-text-secondary py-8">
                  <MessageCircle size={40} className="mx-auto mb-3 opacity-50" />
                  <p className="text-sm sm:text-base">No comments yet. Be the first to share your thoughts!</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-text-secondary mb-4 text-sm sm:text-base">
              Please log in to view and post comments
            </p>
            <Button variant="primary" onClick={onLoginRedirect} className="btn-primary">
              Log In
            </Button>
          </div>
        )}
      </Card>
    </motion.div>
  );
};