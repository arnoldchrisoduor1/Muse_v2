"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Save, Wand2, Rocket } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useSoloPoetStore } from "@/lib/store/solo-poet-store";

export default function EditPoemPage() {
  const params = useParams();
  const router = useRouter();
  const poemId = params.id as string;

  const {
    drafts,
    currentDraft,
    updateDraft,
    updateDraftPoem,
    generateAIFeedback,
    isGeneratingFeedback,
    loadPoems,
  } = useSoloPoetStore();

  const [isLoading, setIsLoading] = useState(true);

  // Load the draft when the component mounts
  useEffect(() => {
    const loadDraft = async () => {
      setIsLoading(true);

      try {
        // First, ensure we have the latest poems
        await loadPoems();

        // Find the draft in the store
        const draftToEdit = drafts.find((draft) => draft.id === poemId);

        if (draftToEdit) {
          // Set as current draft for editing
          useSoloPoetStore.setState({ currentDraft: draftToEdit });
        } else {
          console.error("Draft not found");
          // Redirect to create page if draft not found
          router.push("/create");
          return;
        }
      } catch (error) {
        console.error("Error loading draft:", error);
        router.push("/create");
      } finally {
        setIsLoading(false);
      }
    };

    if (poemId) {
      loadDraft();
    }
  }, [poemId, router, loadPoems]);

  const handleSave = async () => {
    try {
      await updateDraftPoem();
      console.log("Draft successfulyy updated");
      router.push("/create");
    } catch (error) {
      console.error("Failed to update draft:", error);
    }
  };

  const handleAIFeedback = async () => {
    try {
      await generateAIFeedback();
    } catch (error) {
      console.error("Failed to generate AI feedback:", error);
      alert("Failed to generate AI feedback. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-700 rounded w-1/2 mb-8"></div>
          <div className="h-64 bg-gray-700 rounded mb-4"></div>
        </div>
      </div>
    );
  }

  if (!currentDraft) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold mb-4">Draft Not Found</h2>
          <p className="text-text-secondary mb-6">
            The draft you're trying to edit doesn't exist or you don't have
            permission to access it.
          </p>
          <Link href="/create">
            <Button variant="primary" icon={ArrowLeft}>
              Back to Create
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <Link href="/create">
              <Button variant="outline" icon={ArrowLeft}>
                Create
              </Button>
            </Link>
            <h1 className="text-md xl:text-3xl font-bold gradient-text">Edit Poem</h1>
          </div>
          <div className="flex gap-3">
            <Button
              variant="primary"
              icon={Wand2}
              onClick={handleAIFeedback}
              disabled={isGeneratingFeedback || !currentDraft.content.trim()}
            >
              {isGeneratingFeedback ? "Generating..." : "Suggest"}
            </Button>
            <Link href={`/poem/publish/${poemId}`}>
              <Button
                variant="primary"
                icon={Rocket}
                disabled={!currentDraft.content.trim()}
              >
                Publish
              </Button>
            </Link>
            <Button
              variant="secondary"
              icon={Save}
              onClick={handleSave}
              disabled={!currentDraft.content.trim()}
            >
              Save
            </Button>
          </div>
        </div>
        <p className="text-text-secondary">
          Editing your poem draft. Make your changes and save when ready.
        </p>
      </motion.div>

      {/* Edit Form */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="space-y-6"
      >
        {/* Title Input */}
        <Card className="p-6">
          <label htmlFor="title" className="block text-sm font-medium mb-2">
            Title
          </label>
          <input
            id="title"
            type="text"
            value={currentDraft.title || ""}
            onChange={(e) => updateDraft({ title: e.target.value })}
            placeholder="Enter poem title..."
            className="w-full p-3 bg-background border border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </Card>

        {/* Content Textarea */}
        <Card className="p-6">
          <label htmlFor="content" className="block text-sm font-medium mb-2">
            Content
          </label>
          <textarea
            id="content"
            value={currentDraft.content || ""}
            onChange={(e) => updateDraft({ content: e.target.value })}
            placeholder="Write your poem here..."
            rows={15}
            className="w-full p-3 bg-background border border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none font-serif leading-relaxed"
          />
        </Card>

        {/* Tags Input */}
        <Card className="p-6">
          <label htmlFor="tags" className="block text-sm font-medium mb-2">
            Tags (comma-separated)
          </label>
          <input
            id="tags"
            type="text"
            value={currentDraft.tags?.join(", ") || ""}
            onChange={(e) =>
              updateDraft({
                tags: e.target.value
                  .split(",")
                  .map((tag) => tag.trim())
                  .filter(Boolean),
              })
            }
            placeholder="love, nature, hope..."
            className="w-full p-3 bg-background border border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </Card>

        {/* AI Suggestions (if any) */}
        {currentDraft.aiSuggestions &&
          currentDraft.aiSuggestions.length > 0 && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">AI Suggestions</h3>
              <div className="space-y-3">
                {currentDraft.aiSuggestions.map((suggestion, index) => (
                  <div
                    key={suggestion.id}
                    className={`p-3 rounded-lg border ${
                      suggestion.applied
                        ? "border-accent bg-accent/10"
                        : "border-gray-700 bg-background"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-sm font-medium text-text-secondary capitalize">
                          {suggestion.type.replace("_", " ")}:
                        </span>
                        <p className="mt-1">{suggestion.suggestion}</p>
                        {suggestion.reasoning && (
                          <p className="text-sm text-text-muted mt-2">
                            {suggestion.reasoning}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => {
                          // Implement suggestion application logic
                          const updatedSuggestions = [
                            ...currentDraft.aiSuggestions!,
                          ];
                          updatedSuggestions[index] = {
                            ...suggestion,
                            applied: !suggestion.applied,
                          };
                          updateDraft({ aiSuggestions: updatedSuggestions });
                        }}
                      >
                        {suggestion.applied ? "Applied" : "Apply"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
      </motion.div>
    </div>
  );
}
