"use client";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Edit, Trash2, Plus, Rocket } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ConfirmationDialog } from "@/components/ui/ConfirmationDialog";
import { useSoloPoetStore } from "@/lib/store/solo-poet-store";
import { useEffect, useState } from "react";

export function DraftsSection() {
  const { drafts, deleteDraft, loadPoems, isLoadingPoems } = useSoloPoetStore();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [draftToDelete, setDraftToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = (id: string) => {
    setDraftToDelete(id);
    setShowDeleteConfirmation(true);
  };

  const handleConfirmDelete = async () => {
    if (!draftToDelete) return;

    setIsDeleting(true);
    setDeletingId(draftToDelete);
    
    try {
      await deleteDraft(draftToDelete);
      await loadPoems();
      console.log("Poem successfully deleted");
    } catch (error) {
      console.error("Failed to delete draft:", error);
      alert("Failed to delete draft. Please try again.");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirmation(false);
      setDraftToDelete(null);
      // Keep deletingId for a bit longer to allow animation to complete
      setTimeout(() => setDeletingId(null), 300);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirmation(false);
    setDraftToDelete(null);
  };

  useEffect(() => {
    loadPoems();
  }, []);

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Recent Drafts</h2>
          <span className="text-text-muted text-sm">
            {drafts?.length} {drafts?.length === 1 ? "draft" : "drafts"}
          </span>
        </div>

        {drafts.length === 0 && !isLoadingPoems ? (
          <Card className="p-8 text-center">
            <FileText size={48} className="text-text-muted mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No drafts yet</h3>
            <p className="text-text-secondary mb-4">
              Start your first poem and see your drafts appear here.
            </p>
            <Link href="/poem/new">
              <Button variant="primary" icon={Plus}>
                Create First Poem
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-1 xl:grid-cols-2 gap-3">
            <AnimatePresence>
              {drafts?.map((draft, index) => (
                <motion.div
                  key={draft.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ 
                    opacity: deletingId === draft.id ? 0 : 1, 
                    y: 0,
                    scale: deletingId === draft.id ? 0.8 : 1 
                  }}
                  exit={{ 
                    opacity: 0, 
                    scale: 0.8,
                    y: -20 
                  }}
                  transition={{ 
                    duration: 0.3,
                    ease: "easeInOut" 
                  }}
                  layout
                  className={deletingId === draft.id ? "pointer-events-none" : ""}
                >
                  <Card className="p-4 hover:bg-white/10 transition-all duration-300 h-full group flex flex-col">
                    {/* Content - Clickable for editing */}
                    <Link
                      href={`/poem/edit/${draft.id}`}
                      className="block mb-3 grow"
                    >
                      <h3 className="font-semibold mb-2 truncate">
                        {draft.title || "Untitled"}
                      </h3>
                      <p className="text-text-secondary text-sm mb-3 line-clamp-3 min-h-[60px]">
                        {draft?.content || "No content yet..."}
                      </p>
                      <div className="flex items-center justify-between text-xs text-text-muted">
                        {draft.qualityScore && (
                          <span
                            className={`px-2 py-1 rounded-full ${
                              draft.qualityScore >= 85
                                ? "bg-accent/20 text-accent"
                                : draft.qualityScore >= 70
                                ? "bg-primary/20 text-primary"
                                : "bg-warning/20 text-warning"
                            }`}
                          >
                            {draft.qualityScore}%
                          </span>
                        )}
                      </div>
                    </Link>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between gap-2 pt-3 border-t border-gray-200/20">
                      <Link href={`/poem/edit/${draft.id}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          icon={Edit}
                          className="opacity-70 hover:opacity-100 transition-opacity"
                        >
                          Edit
                        </Button>
                      </Link>

                      <Button
                        variant="secondary"
                        size="sm"
                        icon={Trash2}
                        onClick={() => handleDeleteClick(draft.id!)}
                        disabled={isDeleting}
                        className="text-red-400 hover:text-red-300 opacity-70 hover:opacity-100 transition-opacity"
                      >
                        Delete
                      </Button>

                      <Link href={`/poem/publish/${draft.id}`}>
                        <Button
                          variant="primary"
                          size="sm"
                          icon={Rocket}
                          className="text-green-400 hover:text-green-300 opacity-70 hover:opacity-100 transition-opacity"
                        >
                          Publish
                        </Button>
                      </Link>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.div>

      <ConfirmationDialog
        isOpen={showDeleteConfirmation}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Confirm Deletion"
        message="Are you sure you want to delete this draft? This action cannot be undone and the draft will be permanently removed."
        confirmText="Yes, Delete"
        cancelText="Cancel"
        isDestructive={true}
        isLoading={isDeleting}
      />
    </>
  );
}