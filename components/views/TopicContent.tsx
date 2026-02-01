"use client";

import { useState } from "react";
import Tabs from "@/components/ui/Tabs";
import TopicOverview from "@/components/views/TopicOverview";
import TopicNotes from "@/components/views/TopicNotes";
import TopicFlashcards from "@/components/views/TopicFlashcards";
import TopicQuizzes from "@/components/views/TopicQuizzes";
import AddQuizForm from "@/components/views/AddQuizForm";
import GenerateFromFile from "@/components/views/GenerateFromFile";
import ImportFromFile from "@/components/views/ImportFromFile";
import TakeQuiz from "@/components/views/TakeQuiz";
import Modal from "@/components/ui/Modal";
import { Input, Textarea } from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { topicAPI } from "@/lib/api";
import {
  mockSubtopics,
  mockNotes,
  mockFlashcards,
  mockQuizzes,
} from "@/lib/mockData";

interface TopicContentProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onSubtopicSelect: (id: string) => void;
  topicId?: string; // Current topic ID
  onSubtopicAdded?: () => void; // Callback to refresh parent data
  topic?: any; // Current topic data from API
}

export default function TopicContent({
  activeTab,
  onTabChange,
  onSubtopicSelect,
  topicId,
  onSubtopicAdded,
  topic,
}: TopicContentProps) {
  const [isAddSubtopicModalOpen, setIsAddSubtopicModalOpen] = useState(false);
  const [newSubtopicName, setNewSubtopicName] = useState("");
  const [newSubtopicDescription, setNewSubtopicDescription] = useState("");
  const [isCreatingSubtopic, setIsCreatingSubtopic] = useState(false);
  const [isAddFlashcardModalOpen, setIsAddFlashcardModalOpen] = useState(false);
  const [newFlashcardFront, setNewFlashcardFront] = useState("");
  const [newFlashcardBack, setNewFlashcardBack] = useState("");
  const [isAddQuizModalOpen, setIsAddQuizModalOpen] = useState(false);
  const [isGenerateFlashcardsOpen, setIsGenerateFlashcardsOpen] =
    useState(false);
  const [isGenerateQuizOpen, setIsGenerateQuizOpen] = useState(false);
  const [isImportFlashcardsOpen, setIsImportFlashcardsOpen] = useState(false);
  const [isImportQuizOpen, setIsImportQuizOpen] = useState(false);
  const [activeQuizId, setActiveQuizId] = useState<string | null>(null);

  const handleAddSubtopic = async () => {
    if (!newSubtopicName.trim() || !topicId) return;

    try {
      setIsCreatingSubtopic(true);

      const response = await topicAPI.create({
        name: newSubtopicName.trim(),
        description: newSubtopicDescription.trim() || undefined,
        parentId: topicId,
        level: 1,
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
      setIsCreatingSubtopic(false);
    }
  };

  const handleAddFlashcard = () => {
    if (!newFlashcardFront.trim() || !newFlashcardBack.trim()) return;

    console.log("Add flashcard:", {
      front: newFlashcardFront,
      back: newFlashcardBack,
    });

    setNewFlashcardFront("");
    setNewFlashcardBack("");
    setIsAddFlashcardModalOpen(false);
  };

  const handleAddQuiz = (quiz: any) => {
    console.log("Add quiz:", quiz);
    setIsAddQuizModalOpen(false);
  };

  const handleGenerateFromFile = (result: any) => {
    console.log("Generated content:", result);
    setIsGenerateFlashcardsOpen(false);
    setIsGenerateQuizOpen(false);
  };

  const handleImportFromFile = (result: any) => {
    console.log("Imported content:", result);
    setIsImportFlashcardsOpen(false);
    setIsImportQuizOpen(false);
  };

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

  // Calculate stats from topic data
  const subtopics = topic?.subtopics || [];
  const stats = {
    notes: topic?.notesCount || 0,
    flashcards: topic?.flashcardsCount || 0,
    quizzes: topic?.quizzesCount || 0,
  };

  const topicOverviewData = {
    id: topic?.id || topic?._id || "",
    name: topic?.name || "Topic",
    status: topic?.status || "not-started",
    progress: topic?.progress || 0,
    completedSubtopics: subtopics.filter((s: any) => s.status === "mastered")
      .length,
    totalSubtopics: subtopics.length,
  };

  const formattedSubtopics = subtopics.map((sub: any) => ({
    id: sub.id || sub._id,
    name: sub.name,
    slug: sub.slug,
    description: sub.description || "",
    flashcards: sub.flashcardsCount || 0,
    quizzes: sub.quizzesCount || 0,
    notes: sub.notesCount || 0,
  }));

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "notes", label: "Notes", count: stats.notes },
    { id: "flashcards", label: "Flashcards", count: stats.flashcards },
    { id: "quizzes", label: "Quizzes", count: stats.quizzes },
  ];

  return (
    <>
      <Tabs tabs={tabs} activeTab={activeTab} onTabChange={onTabChange} />

      {activeTab === "overview" && (
        <TopicOverview
          topic={topicOverviewData}
          subtopics={formattedSubtopics}
          stats={stats}
          onSubtopicSelect={onSubtopicSelect}
          onAddSubtopic={() => setIsAddSubtopicModalOpen(true)}
        />
      )}

      {activeTab === "notes" && (
        <TopicNotes
          topicId={topicId || ""}
          topicName={topic?.name || "Topic"}
        />
      )}

      {activeTab === "flashcards" && (
        <TopicFlashcards
          topicId={topicId || ""}
          topicName={topic?.name || "Topic"}
        />
      )}

      {activeTab === "quizzes" && topicId && (
        <TopicQuizzes topicId={topicId} topicName={topic?.name || "Topic"} />
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
              disabled={isCreatingSubtopic}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!newSubtopicName.trim() || isCreatingSubtopic}
            >
              {isCreatingSubtopic ? "Adding..." : "Add Subtopic"}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isAddFlashcardModalOpen}
        onClose={() => {
          setIsAddFlashcardModalOpen(false);
          setNewFlashcardFront("");
          setNewFlashcardBack("");
        }}
        title="Add New Flashcard"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAddFlashcard();
          }}
        >
          <Textarea
            label="Front (Question)"
            placeholder="Enter the question or term..."
            value={newFlashcardFront}
            onChange={(e) => setNewFlashcardFront(e.target.value)}
            rows={3}
            required
          />
          <Textarea
            label="Back (Answer)"
            placeholder="Enter the answer or definition..."
            value={newFlashcardBack}
            onChange={(e) => setNewFlashcardBack(e.target.value)}
            rows={3}
            required
          />
          <div className="flex gap-3 justify-end !mt-6">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsAddFlashcardModalOpen(false);
                setNewFlashcardFront("");
                setNewFlashcardBack("");
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!newFlashcardFront.trim() || !newFlashcardBack.trim()}
            >
              Add Flashcard
            </Button>
          </div>
        </form>
      </Modal>

      {isAddQuizModalOpen && (
        <AddQuizForm
          onClose={() => setIsAddQuizModalOpen(false)}
          onSave={handleAddQuiz}
        />
      )}

      {isGenerateFlashcardsOpen && (
        <GenerateFromFile
          type="flashcards"
          onClose={() => setIsGenerateFlashcardsOpen(false)}
          onGenerate={handleGenerateFromFile}
        />
      )}

      {isGenerateQuizOpen && (
        <GenerateFromFile
          type="quiz"
          onClose={() => setIsGenerateQuizOpen(false)}
          onGenerate={handleGenerateFromFile}
        />
      )}

      {isImportFlashcardsOpen && (
        <ImportFromFile
          type="flashcards"
          onClose={() => setIsImportFlashcardsOpen(false)}
          onImport={handleImportFromFile}
        />
      )}

      {isImportQuizOpen && (
        <ImportFromFile
          type="quiz"
          onClose={() => setIsImportQuizOpen(false)}
          onImport={handleImportFromFile}
        />
      )}

      {activeQuizId && (
        <TakeQuiz
          quiz={mockQuizzes.find((q) => q.id === activeQuizId)!}
          onClose={() => setActiveQuizId(null)}
          onComplete={handleQuizComplete}
        />
      )}
    </>
  );
}
