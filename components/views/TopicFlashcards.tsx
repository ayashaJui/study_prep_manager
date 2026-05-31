"use client";

import { useState, useEffect } from "react";
import { Plus, Play, Shuffle, Sparkles, Upload, X } from "lucide-react";
import Button from "@/components/ui/Button";
import { Card, CardTitle } from "@/components/ui/Card";
import { Input, Textarea } from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import FlashcardGrid from "@/components/features/FlashcardGrid";
import ImportFromFile from "@/components/views/ImportFromFile";
import { flashcardsAPI } from "@/lib/api";
import { useToast } from "@/contexts/ToastContext";

interface Flashcard {
  _id: string;
  front: string;
  back: string;
  tags: string[];
  difficulty: string;
  createdAt: string;
}

interface TopicFlashcardsProps {
  topicId: string;
  topicName: string;
  initialFlashcardId?: string;
}

export default function TopicFlashcards({
  topicId,
  topicName,
  initialFlashcardId,
}: TopicFlashcardsProps) {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [newFlashcard, setNewFlashcard] = useState({
    front: "",
    back: "",
    difficulty: "medium",
  });
  const [editingFlashcard, setEditingFlashcard] = useState<Flashcard | null>(
    null,
  );
  const [saving, setSaving] = useState(false);
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{
    isOpen: boolean;
    flashcardId: string | null;
  }>({ isOpen: false, flashcardId: null });
  const [isStudyModeOpen, setIsStudyModeOpen] = useState(false);
  const [studyQueue, setStudyQueue] = useState<Flashcard[]>([]);
  const [studyIndex, setStudyIndex] = useState(0);
  const [isStudyFlipped, setIsStudyFlipped] = useState(false);
  const [studyStartedAt, setStudyStartedAt] = useState<number | null>(null);
  const [isReviewing, setIsReviewing] = useState(false);
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    if (topicId) {
      fetchFlashcards();
    }
  }, [topicId]);

  useEffect(() => {
    if (initialFlashcardId && flashcards.length > 0) {
      handleEditFlashcard(initialFlashcardId);
    }
  }, [initialFlashcardId, flashcards]);

  const fetchFlashcards = async () => {
    try {
      setLoading(true);
      const data = await flashcardsAPI.getAll(topicId);
      setFlashcards(Array.isArray(data) ? data : []);
    } catch (error: any) {
      showError(error.message || "Failed to load flashcards");
      setFlashcards([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFlashcard = async () => {
    if (!newFlashcard.front.trim() || !newFlashcard.back.trim()) {
      showError("Both front and back are required");
      return;
    }

    try {
      setSaving(true);
      const flashcard = await flashcardsAPI.create({
        topicId,
        front: newFlashcard.front,
        back: newFlashcard.back,
        difficulty: newFlashcard.difficulty,
      });
      setFlashcards([flashcard, ...flashcards]);
      setNewFlashcard({ front: "", back: "", difficulty: "medium" });
      setIsAddModalOpen(false);
      showSuccess("Flashcard created successfully");
    } catch (error: any) {
      showError(error.message || "Failed to create flashcard");
    } finally {
      setSaving(false);
    }
  };

  const handleEditFlashcard = (id: string) => {
    const flashcard = flashcards.find((f) => f._id === id);
    if (flashcard) {
      setEditingFlashcard(flashcard);
    }
  };

  const handleUpdateFlashcard = async () => {
    if (
      !editingFlashcard ||
      !editingFlashcard.front.trim() ||
      !editingFlashcard.back.trim()
    ) {
      showError("Both front and back are required");
      return;
    }

    try {
      setSaving(true);
      const updated = await flashcardsAPI.update(editingFlashcard._id, {
        front: editingFlashcard.front,
        back: editingFlashcard.back,
        difficulty: editingFlashcard.difficulty,
      });
      setFlashcards(
        flashcards.map((f) => (f._id === updated._id ? updated : f)),
      );
      setEditingFlashcard(null);
      showSuccess("Flashcard updated successfully");
    } catch (error: any) {
      showError(error.message || "Failed to update flashcard");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteFlashcard = (id: string) => {
    setDeleteConfirmModal({ isOpen: true, flashcardId: id });
  };

  const confirmDelete = async () => {
    if (!deleteConfirmModal.flashcardId) return;

    try {
      await flashcardsAPI.delete(deleteConfirmModal.flashcardId);
      setFlashcards(
        flashcards.filter((f) => f._id !== deleteConfirmModal.flashcardId),
      );
      showSuccess("Flashcard deleted successfully");
      setDeleteConfirmModal({ isOpen: false, flashcardId: null });
    } catch (error: any) {
      showError(error.message || "Failed to delete flashcard");
      setDeleteConfirmModal({ isOpen: false, flashcardId: null });
    }
  };

  const handleImportFlashcards = async (result: {
    flashcards?: Array<{ front: string; back: string }>;
  }) => {
    if (!result.flashcards || result.flashcards.length === 0) {
      showError("No flashcards to import");
      return;
    }

    try {
      const formattedFlashcards = result.flashcards.map((fc) => ({
        front: fc.front,
        back: fc.back,
        difficulty: "medium",
        tags: ["imported"],
      }));

      await flashcardsAPI.importFromFile(topicId, formattedFlashcards);
      setIsImportModalOpen(false);
      await fetchFlashcards();
      showSuccess(`Imported ${formattedFlashcards.length} flashcard(s)`);
    } catch (error: any) {
      showError(error.message || "Failed to import flashcards");
    }
  };

  const openStudyMode = () => {
    if (!flashcards.length) {
      showError("No flashcards available for study mode");
      return;
    }

    setStudyQueue(flashcards);
    setStudyIndex(0);
    setIsStudyFlipped(false);
    setStudyStartedAt(Date.now());
    setIsStudyModeOpen(true);
  };

  const closeStudyMode = () => {
    setIsStudyModeOpen(false);
    setIsReviewing(false);
  };

  const advanceStudyCard = () => {
    const nextIndex = studyIndex + 1;
    if (nextIndex >= studyQueue.length) {
      setIsStudyModeOpen(false);
      showSuccess("Study session complete");
      return;
    }

    setStudyIndex(nextIndex);
    setIsStudyFlipped(false);
    setStudyStartedAt(Date.now());
  };

  const handleReview = async (quality: number) => {
    const current = studyQueue[studyIndex];
    if (!current) return;

    const duration = studyStartedAt
      ? Math.max(1, Math.round((Date.now() - studyStartedAt) / 1000))
      : 0;

    let shouldAdvance = false;
    try {
      setIsReviewing(true);
      const updated = await flashcardsAPI.review(
        current._id,
        quality,
        duration,
      );
      setFlashcards((prev) =>
        prev.map((f) => (f._id === updated._id ? updated : f)),
      );
      shouldAdvance = true;
    } catch (error: any) {
      showError(error.message || "Failed to submit review");
    } finally {
      setIsReviewing(false);
      if (shouldAdvance) advanceStudyCard();
    }
  };

  const handleSkip = () => {
    advanceStudyCard();
  };

  if (loading) {
    return (
      <Card>
        <CardTitle>Flashcards - {topicName}</CardTitle>
        <div className="text-center py-8 text-slate-400">
          Loading flashcards...
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardTitle
          action={
            <div className="flex gap-2 flex-wrap">
              <Button
                variant="secondary"
                onClick={() => setIsImportModalOpen(true)}
              >
                <Upload size={16} />
                Import CSV
              </Button>
              <Button variant="secondary">
                <Sparkles size={16} />
                Generate from File
              </Button>
              <Button onClick={() => setIsAddModalOpen(true)}>
                <Plus size={16} />
                Add Flashcard
              </Button>
            </div>
          }
        >
          Flashcards - {topicName}
        </CardTitle>

        <div className="!mb-6 flex gap-4 flex-wrap">
          <Button variant="secondary" onClick={openStudyMode}>
            <Play size={16} />
            Study Mode
          </Button>
          <Button variant="secondary">
            <Shuffle size={16} />
            Shuffle
          </Button>
        </div>

        <FlashcardGrid
          flashcards={flashcards.map((fc) => ({
            id: fc._id,
            front: fc.front,
            back: fc.back,
          }))}
          onEdit={handleEditFlashcard}
          onDelete={handleDeleteFlashcard}
        />
      </Card>

      {/* Add Flashcard Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 overflow-y-auto flex items-start justify-center !p-4 md:!p-8">
          <div className="w-full max-w-2xl !my-8 bg-slate-800 rounded-lg border border-slate-700">
            {/* Header */}
            <div className="flex items-center justify-between !p-6 !pb-4 border-b border-slate-700/50">
              <h2 className="text-2xl font-bold text-slate-100">
                Create New Flashcard
              </h2>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setNewFlashcard({
                    front: "",
                    back: "",
                    difficulty: "medium",
                  });
                }}
                className="!p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-800"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form Content */}
            <div className="!p-6 !space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 !mb-2">
                  Front (Question)
                </label>
                <Textarea
                  value={newFlashcard.front}
                  onChange={(e) =>
                    setNewFlashcard({ ...newFlashcard, front: e.target.value })
                  }
                  rows={4}
                  placeholder="What is the question or concept you want to remember?"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 !mb-2">
                  Back (Answer)
                </label>
                <Textarea
                  value={newFlashcard.back}
                  onChange={(e) =>
                    setNewFlashcard({ ...newFlashcard, back: e.target.value })
                  }
                  rows={4}
                  placeholder="The answer or explanation..."
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 !mb-3">
                  Difficulty Level
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {["easy", "medium", "hard"].map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() =>
                        setNewFlashcard({ ...newFlashcard, difficulty: level })
                      }
                      className={`!py-2.5 !px-4 rounded-lg border-2 transition-all font-medium capitalize text-sm ${
                        newFlashcard.difficulty === level
                          ? level === "easy"
                            ? "border-green-500 bg-green-500/20 text-green-400"
                            : level === "medium"
                              ? "border-yellow-500 bg-yellow-500/20 text-yellow-400"
                              : "border-red-500 bg-red-500/20 text-red-400"
                          : "border-slate-600 bg-slate-700/30 text-slate-400 hover:border-slate-500 hover:bg-slate-700/50"
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 justify-end !pt-4 border-t border-slate-700">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setNewFlashcard({
                      front: "",
                      back: "",
                      difficulty: "medium",
                    });
                  }}
                  type="button"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddFlashcard}
                  disabled={saving}
                  type="button"
                >
                  {saving ? "Creating..." : "Create Flashcard"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Flashcard Modal */}
      {editingFlashcard && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 overflow-y-auto flex items-start justify-center !p-4 md:!p-8">
          <div className="w-full max-w-2xl !my-8 bg-slate-800 rounded-lg border border-slate-700">
            {/* Header */}
            <div className="flex items-center justify-between !p-6 !pb-4 border-b border-slate-700/50">
              <h2 className="text-2xl font-bold text-slate-100">
                Edit Flashcard
              </h2>
              <button
                onClick={() => setEditingFlashcard(null)}
                className="!p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-800"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form Content */}
            <div className="!p-6 !space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 !mb-2">
                  Front (Question)
                </label>
                <Textarea
                  value={editingFlashcard.front}
                  onChange={(e) =>
                    setEditingFlashcard({
                      ...editingFlashcard,
                      front: e.target.value,
                    })
                  }
                  rows={4}
                  placeholder="What is the question or concept you want to remember?"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 !mb-2">
                  Back (Answer)
                </label>
                <Textarea
                  value={editingFlashcard.back}
                  onChange={(e) =>
                    setEditingFlashcard({
                      ...editingFlashcard,
                      back: e.target.value,
                    })
                  }
                  rows={4}
                  placeholder="The answer or explanation..."
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 !mb-3">
                  Difficulty Level
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {["easy", "medium", "hard"].map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() =>
                        setEditingFlashcard({
                          ...editingFlashcard,
                          difficulty: level,
                        })
                      }
                      className={`!py-2.5 !px-4 rounded-lg border-2 transition-all font-medium capitalize text-sm ${
                        editingFlashcard.difficulty === level
                          ? level === "easy"
                            ? "border-green-500 bg-green-500/20 text-green-400"
                            : level === "medium"
                              ? "border-yellow-500 bg-yellow-500/20 text-yellow-400"
                              : "border-red-500 bg-red-500/20 text-red-400"
                          : "border-slate-600 bg-slate-700/30 text-slate-400 hover:border-slate-500 hover:bg-slate-700/50"
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 justify-end !pt-4 border-t border-slate-700">
                <Button
                  variant="secondary"
                  onClick={() => setEditingFlashcard(null)}
                  type="button"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpdateFlashcard}
                  disabled={saving}
                  type="button"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteConfirmModal.isOpen}
        onClose={() =>
          setDeleteConfirmModal({ isOpen: false, flashcardId: null })
        }
        title="Delete Flashcard"
      >
        <div className="!p-6">
          <p className="text-slate-300 !mb-6">
            Are you sure you want to delete this flashcard? This action cannot
            be undone.
          </p>
          <div className="flex gap-3 justify-end">
            <Button
              variant="secondary"
              onClick={() =>
                setDeleteConfirmModal({ isOpen: false, flashcardId: null })
              }
            >
              Cancel
            </Button>
            <Button
              onClick={confirmDelete}
              className="!bg-red-600 hover:!bg-red-700"
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>

      {/* Import Modal */}
      {isImportModalOpen && (
        <ImportFromFile
          onClose={() => setIsImportModalOpen(false)}
          onImport={handleImportFlashcards}
          type="flashcards"
        />
      )}

      <Modal
        isOpen={isStudyModeOpen}
        onClose={closeStudyMode}
        title={`Study Mode - ${topicName}`}
      >
        {studyQueue.length === 0 ? (
          <div className="text-slate-400">No flashcards available.</div>
        ) : (
          <div className="!space-y-4">
            <div className="flex items-center justify-between text-sm text-slate-400">
              <span>
                Card {studyIndex + 1} of {studyQueue.length}
              </span>
              <span>{isStudyFlipped ? "Answer" : "Question"}</span>
            </div>

            <div
              className="rounded-lg border border-slate-700 bg-slate-900/60 !p-6 text-center min-h-[160px] flex items-center justify-center"
              onClick={() => setIsStudyFlipped((prev) => !prev)}
            >
              <div className="text-lg text-slate-100 whitespace-pre-wrap">
                {isStudyFlipped
                  ? studyQueue[studyIndex].back
                  : studyQueue[studyIndex].front}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 justify-between">
              <Button variant="secondary" onClick={handleSkip}>
                Skip
              </Button>
              <Button
                variant="secondary"
                onClick={() => setIsStudyFlipped((prev) => !prev)}
              >
                {isStudyFlipped ? "Show Question" : "Show Answer"}
              </Button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { value: 0, label: "Again" },
                { value: 1, label: "Hard" },
                { value: 2, label: "Difficult" },
                { value: 3, label: "Okay" },
                { value: 4, label: "Good" },
                { value: 5, label: "Easy" },
              ].map((option) => (
                <Button
                  key={option.value}
                  variant="secondary"
                  onClick={() => handleReview(option.value)}
                  disabled={!isStudyFlipped || isReviewing}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
