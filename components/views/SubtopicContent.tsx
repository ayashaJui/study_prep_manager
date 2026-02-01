"use client";

import { useState } from "react";
import Tabs from "@/components/ui/Tabs";
import SubtopicDetail from "@/components/views/SubtopicDetail";
import TopicNotes from "@/components/views/TopicNotes";
import TopicFlashcards from "@/components/views/TopicFlashcards";
import TopicQuizzes from "@/components/views/TopicQuizzes";
import TakeQuiz from "@/components/views/TakeQuiz";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { mockNotes, mockFlashcards, mockQuizzes } from "@/lib/mockData";
import { topicAPI } from "@/lib/api";

interface SubtopicContentProps {
  subtopic: {
    id: string; // MongoDB ObjectId as string
    name: string;
    description: string;
    notes?: number;
    flashcards?: number;
    quizzes?: number;
    subtopics?: any[]; // Nested subtopics
    status?: "not-started" | "in-progress" | "review" | "mastered";
    flashcardsCount?: number;
    quizzesCount?: number;
    notesCount?: number;
  };
  activeTab: string;
  onTabChange: (tab: string) => void;
  onSubtopicSelect?: (id: string) => void;
  onSubtopicAdded?: () => void; // Callback to refresh parent data
}

export default function SubtopicContent({
  subtopic,
  activeTab,
  onTabChange,
  onSubtopicSelect,
  onSubtopicAdded,
}: SubtopicContentProps) {
  const [activeQuizId, setActiveQuizId] = useState<string | null>(null);
  const [isAddSubtopicModalOpen, setIsAddSubtopicModalOpen] = useState(false);
  const [newSubtopicName, setNewSubtopicName] = useState("");
  const [newSubtopicDescription, setNewSubtopicDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleTakeQuiz = (quizId: string) => {
    setActiveQuizId(quizId);
  };

  const handleQuizComplete = (score: number) => {
    console.log("Quiz completed with score:", score);
    // In real implementation, update quiz with:
    // - lastScore: score
    // - lastAttemptDate: new Date().toLocaleDateString()
    // - attempts: attempts + 1
    // Keep modal open to show results - user will close it manually
  };

  const handleAddSubtopic = async () => {
    if (!newSubtopicName.trim()) return;

    try {
      setIsCreating(true);

      // Create subtopic with parent reference
      const response = await topicAPI.create({
        name: newSubtopicName.trim(),
        description: newSubtopicDescription.trim() || undefined,
        parentId: subtopic.id, // This subtopic becomes the parent
        level: 2, // Increment from parent level
        status: "not-started",
        tags: [],
        favorite: false,
      });

      if (response.success) {
        console.log("Subtopic created:", response.data);

        setNewSubtopicName("");
        setNewSubtopicDescription("");
        setIsAddSubtopicModalOpen(false);

        // Notify parent to refresh data
        if (onSubtopicAdded) {
          onSubtopicAdded();
        }
      }
    } catch (err: any) {
      console.error("Failed to create subtopic:", err);
      alert(err.message || "Failed to create subtopic. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  // Support both old and new data structure
  const notesCount = subtopic.notes ?? subtopic.notesCount ?? 0;
  const flashcardsCount = subtopic.flashcards ?? subtopic.flashcardsCount ?? 0;
  const quizzesCount = subtopic.quizzes ?? subtopic.quizzesCount ?? 0;
  const subSubtopics = subtopic.subtopics || [];

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "notes", label: "Notes", count: notesCount },
    { id: "flashcards", label: "Flashcards", count: flashcardsCount },
    { id: "quizzes", label: "Quizzes", count: quizzesCount },
  ];

  return (
    <>
      <Tabs tabs={tabs} activeTab={activeTab} onTabChange={onTabChange} />

      {activeTab === "overview" && (
        <SubtopicDetail
          subtopic={{
            id: subtopic.id,
            name: subtopic.name,
            status: subtopic.status || "in-progress",
            summary: subtopic.description,
          }}
          subSubtopics={subSubtopics.map((s: any) => ({
            id: s.id,
            name: s.name,
            description: s.description || "",
            flashcards: s.flashcardsCount || 0,
            quizzes: s.quizzesCount || 0,
            notes: s.notesCount || 0,
          }))}
          stats={{
            notes: notesCount,
            flashcards: flashcardsCount,
            quizzes: quizzesCount,
          }}
          onSubSubtopicSelect={onSubtopicSelect}
          onAddSubtopic={() => setIsAddSubtopicModalOpen(true)}
        />
      )}

      {activeTab === "notes" && (
        <TopicNotes topicId={subtopic.id} topicName={subtopic.name} />
      )}

      {activeTab === "flashcards" && (
        <TopicFlashcards topicId={subtopic.id} topicName={subtopic.name} />
      )}

      {activeTab === "quizzes" && (
        <TopicQuizzes topicId={subtopic.id} topicName={subtopic.name} />
      )}

      {activeQuizId && (
        <TakeQuiz
          quiz={mockQuizzes.find((q) => q.id === activeQuizId)!}
          onClose={() => setActiveQuizId(null)}
          onComplete={handleQuizComplete}
        />
      )}

      <Modal
        isOpen={isAddSubtopicModalOpen}
        onClose={() => {
          setIsAddSubtopicModalOpen(false);
          setNewSubtopicName("");
          setNewSubtopicDescription("");
        }}
        title="Add New Subtopic"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAddSubtopic();
          }}
        >
          <Input
            label="Subtopic Name"
            placeholder="e.g., Arrays, Linked Lists, etc."
            value={newSubtopicName}
            onChange={(e) => setNewSubtopicName(e.target.value)}
            required
          />
          <Textarea
            label="Description (Optional)"
            placeholder="Brief description of this subtopic..."
            value={newSubtopicDescription}
            onChange={(e) => setNewSubtopicDescription(e.target.value)}
          />
          <div className="flex gap-3 justify-end !mt-6">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsAddSubtopicModalOpen(false);
                setNewSubtopicName("");
                setNewSubtopicDescription("");
              }}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!newSubtopicName.trim() || isCreating}
            >
              {isCreating ? "Adding..." : "Add Subtopic"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
