"use client";

import { useState, useEffect } from "react";
import { Plus, Sparkles, Upload } from "lucide-react";
import Button from "@/components/ui/Button";
import { Card, CardTitle } from "@/components/ui/Card";
import QuizList from "@/components/features/QuizList";
import Modal from "@/components/ui/Modal";
import AddQuizForm from "@/components/views/AddQuizForm";
import TakeQuiz from "@/components/views/TakeQuiz";
import ImportFromFile from "@/components/views/ImportFromFile";
import { quizzesAPI } from "@/lib/api";
import { useToast } from "@/contexts/ToastContext";

interface Quiz {
  _id: string;
  title: string;
  description?: string;
  source?: string;
  difficulty: string;
  type: string;
  timeLimit?: number;
  tags?: string[];
  questions: any[];
  createdAt: string;
  lastScore?: string;
}

interface TopicQuizzesProps {
  topicId: string;
  topicName: string;
}

export default function TopicQuizzes({
  topicId,
  topicName,
}: TopicQuizzesProps) {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddQuizModalOpen, setIsAddQuizModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [activeQuizId, setActiveQuizId] = useState<string | null>(null);
  const [editingQuizId, setEditingQuizId] = useState<string | null>(null);
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{
    isOpen: boolean;
    quizId: string | null;
  }>({ isOpen: false, quizId: null });
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    if (topicId) {
      fetchQuizzes();
    }
  }, [topicId]);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const data = await quizzesAPI.getAll(topicId);
      setQuizzes(Array.isArray(data) ? data : []);
    } catch (error: any) {
      showError(error.message || "Failed to load quizzes");
      setQuizzes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateQuiz = async (quizData: any) => {
    try {
      const quiz = await quizzesAPI.create({
        topicId,
        ...quizData,
      });
      setQuizzes([quiz, ...quizzes]);
      setIsAddQuizModalOpen(false);
      showSuccess("Quiz created successfully");
    } catch (error: any) {
      showError(error.message || "Failed to create quiz");
    }
  };

  const handleTakeQuiz = (id: string) => {
    setActiveQuizId(id);
  };

  const handleEditQuiz = (id: string) => {
    setEditingQuizId(id);
  };

  const handleQuizComplete = (score: number) => {
    showSuccess(`Quiz completed! Score: ${Math.round(score)}%`);
    setActiveQuizId(null);
    // Optionally refresh quizzes to update lastScore
    fetchQuizzes();
  };

  const handleUpdateQuiz = async (quizData: any) => {
    if (!editingQuizId) return;

    try {
      const updatedQuiz = await quizzesAPI.update(editingQuizId, quizData);
      setQuizzes(
        quizzes.map((q) => (q._id === editingQuizId ? updatedQuiz : q)),
      );
      setEditingQuizId(null);
      showSuccess("Quiz updated successfully");
    } catch (error: any) {
      showError(error.message || "Failed to update quiz");
    }
  };

  const handleDeleteQuiz = (id: string) => {
    setDeleteConfirmModal({ isOpen: true, quizId: id });
  };

  const confirmDelete = async () => {
    if (!deleteConfirmModal.quizId) return;

    try {
      await quizzesAPI.delete(deleteConfirmModal.quizId);
      setQuizzes(quizzes.filter((q) => q._id !== deleteConfirmModal.quizId));
      showSuccess("Quiz deleted successfully");
      setDeleteConfirmModal({ isOpen: false, quizId: null });
    } catch (error: any) {
      showError(error.message || "Failed to delete quiz");
      setDeleteConfirmModal({ isOpen: false, quizId: null });
    }
  };

  const handleImportQuizzes = async (result: {
    quizzes?: Array<{
      question: string;
      options: string[];
      correctAnswer: number | number[];
      explanation?: string;
    }>;
  }) => {
    if (!result.quizzes || result.quizzes.length === 0) {
      showError("No quizzes to import");
      return;
    }

    try {
      // Transform imported quizzes to match schema
      const formattedQuizzes = result.quizzes.map((q, idx) => ({
        title: `Imported Quiz ${idx + 1}`,
        description: "Imported from file",
        difficulty: "medium",
        type: "multiple-choice",
        questions: [
          {
            id: `q-${idx}`,
            question: q.question,
            options: q.options,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation || "",
            points: 1,
            tags: [],
          },
        ],
        tags: ["imported"],
        shuffleQuestions: false,
        shuffleOptions: false,
        showAnswersImmediately: false,
      }));

      await quizzesAPI.importFromFile(topicId, formattedQuizzes);
      setIsImportModalOpen(false);
      await fetchQuizzes();
      showSuccess(`Imported ${formattedQuizzes.length} quiz(zes)`);
    } catch (error: any) {
      showError(error.message || "Failed to import quizzes");
    }
  };

  if (loading) {
    return (
      <Card>
        <CardTitle>Quizzes - {topicName}</CardTitle>
        <div className="text-center py-8 text-slate-400">
          Loading quizzes...
        </div>
      </Card>
    );
  }

  const formattedQuizzes = quizzes.map((quiz) => ({
    id: quiz._id,
    title: quiz.title,
    source: quiz.source || "Custom",
    date: new Date(quiz.createdAt).toLocaleDateString(),
    lastScore: quiz.lastScore,
    description: quiz.description || `${quiz.questions.length} questions`,
  }));

  // If taking a quiz, show TakeQuiz component
  if (activeQuizId) {
    const activeQuiz = quizzes.find((q) => q._id === activeQuizId);
    if (activeQuiz) {
      return (
        <TakeQuiz
          quiz={{
            id: activeQuiz._id,
            title: activeQuiz.title,
            description: activeQuiz.description || "",
            difficulty: activeQuiz.difficulty as "easy" | "medium" | "hard",
            timeLimit: activeQuiz.timeLimit,
            questions: activeQuiz.questions,
          }}
          onClose={() => setActiveQuizId(null)}
          onComplete={handleQuizComplete}
        />
      );
    }
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
              <Button onClick={() => setIsAddQuizModalOpen(true)}>
                <Plus size={16} />
                Add Quiz
              </Button>
            </div>
          }
        >
          Quizzes - {topicName}
        </CardTitle>

        <QuizList
          quizzes={formattedQuizzes}
          onTake={handleTakeQuiz}
          onEdit={handleEditQuiz}
          onDelete={handleDeleteQuiz}
        />
      </Card>

      {/* Add Quiz Modal */}
      {isAddQuizModalOpen && (
        <AddQuizForm
          onClose={() => setIsAddQuizModalOpen(false)}
          onSave={handleCreateQuiz}
        />
      )}

      {/* Edit Quiz Modal */}
      {editingQuizId &&
        (() => {
          const editQuiz = quizzes.find((q) => q._id === editingQuizId);
          if (!editQuiz) return null;

          return (
            <AddQuizForm
              onClose={() => setEditingQuizId(null)}
              onSave={handleUpdateQuiz}
              initialData={{
                title: editQuiz.title,
                description: editQuiz.description || "",
                source: editQuiz.source || "",
                difficulty: editQuiz.difficulty as "easy" | "medium" | "hard",
                type: editQuiz.type as
                  | "multiple-choice"
                  | "true-false"
                  | "mixed",
                timeLimit: editQuiz.timeLimit,
                tags: editQuiz.tags || [],
                questions: editQuiz.questions.map((q: any) => ({
                  id: q.id,
                  question: q.question,
                  options: q.options,
                  correctAnswer: q.correctAnswer,
                  explanation: q.explanation || "",
                })),
              }}
            />
          );
        })()}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteConfirmModal.isOpen}
        onClose={() => setDeleteConfirmModal({ isOpen: false, quizId: null })}
        title="Delete Quiz"
      >
        <div className="!p-6">
          <p className="text-slate-300 !mb-6">
            Are you sure you want to delete this quiz? This action cannot be
            undone.
          </p>
          <div className="flex gap-3 justify-end">
            <Button
              variant="secondary"
              onClick={() =>
                setDeleteConfirmModal({ isOpen: false, quizId: null })
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
          onImport={handleImportQuizzes}
          type="quiz"
        />
      )}
    </>
  );
}
