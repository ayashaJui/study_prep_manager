"use client";

import { useState } from "react";
import { Plus, Trash2, X } from "lucide-react";
import Button from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number | number[]; // Support both single and multiple answers
  explanation?: string;
}

interface AddQuizFormProps {
  onClose: () => void;
  onSave: (quiz: {
    title: string;
    description: string;
    source: string;
    difficulty: "easy" | "medium" | "hard";
    type: "multiple-choice" | "true-false" | "mixed";
    timeLimit?: number;
    tags: string[];
    questions: Question[];
  }) => void;
  initialData?: {
    title: string;
    description: string;
    source: string;
    difficulty: "easy" | "medium" | "hard";
    type: "multiple-choice" | "true-false" | "mixed";
    timeLimit?: number;
    tags: string[];
    questions: Question[];
  };
}

export default function AddQuizForm({
  onClose,
  onSave,
  initialData,
}: AddQuizFormProps) {
  const [quizTitle, setQuizTitle] = useState(initialData?.title || "");
  const [quizDescription, setQuizDescription] = useState(
    initialData?.description || "",
  );
  const [source, setSource] = useState(initialData?.source || "");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">(
    initialData?.difficulty || "medium",
  );
  const [type, setType] = useState<"multiple-choice" | "true-false" | "mixed">(
    initialData?.type || "multiple-choice",
  );
  const [timeLimit, setTimeLimit] = useState<string>(
    initialData?.timeLimit?.toString() || "",
  );
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [questions, setQuestions] = useState<Question[]>(
    initialData?.questions || [
      {
        id: "1",
        question: "",
        options: ["", "", "", ""],
        correctAnswer: [], // Array for multiple answers
        explanation: "",
      },
    ],
  );

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: Date.now().toString(),
        question: "",
        options: ["", "", "", ""],
        correctAnswer: [], // Array for multiple answers
        explanation: "",
      },
    ]);
  };

  const removeQuestion = (id: string) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((q) => q.id !== id));
    }
  };

  const updateQuestion = (id: string, field: string, value: any) => {
    setQuestions(
      questions.map((q) => (q.id === id ? { ...q, [field]: value } : q)),
    );
  };

  const updateOption = (
    questionId: string,
    optionIndex: number,
    value: string,
  ) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId) {
          const newOptions = [...q.options];
          newOptions[optionIndex] = value;
          return { ...q, options: newOptions };
        }
        return q;
      }),
    );
  };

  const toggleCorrectAnswer = (questionId: string, optionIndex: number) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId) {
          const currentAnswers = Array.isArray(q.correctAnswer)
            ? q.correctAnswer
            : [q.correctAnswer];
          const newAnswers = currentAnswers.includes(optionIndex)
            ? currentAnswers.filter((idx) => idx !== optionIndex)
            : [...currentAnswers, optionIndex];
          return { ...q, correctAnswer: newAnswers };
        }
        return q;
      }),
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate
    if (!quizTitle.trim()) return;

    const validQuestions = questions.filter((q) => {
      const correctAnswers = Array.isArray(q.correctAnswer)
        ? q.correctAnswer
        : [q.correctAnswer];
      const hasCorrectAnswer =
        correctAnswers.length > 0 &&
        correctAnswers.every((idx) => typeof idx === "number");
      return (
        q.question.trim() &&
        q.options.every((o) => o.trim()) &&
        hasCorrectAnswer
      );
    });

    if (validQuestions.length === 0) {
      alert("Please add at least one complete question with correct answer(s)");
      return;
    }

    onSave({
      title: quizTitle,
      description: quizDescription,
      source,
      difficulty,
      type,
      timeLimit: timeLimit ? parseInt(timeLimit) : undefined,
      tags: tags.filter((tag) => tag.trim() !== ""),
      questions: validQuestions,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 overflow-y-auto flex items-start justify-center !p-4 md:!p-8">
      <Card className="w-full max-w-4xl !my-8">
        <div className="overflow-y-auto max-h-[85vh]">
          {/* Header */}
          <div className="flex items-center justify-between !mb-6 !pb-4 border-b border-slate-700/50">
            <h2 className="text-2xl font-bold text-slate-100">
              {initialData ? "Edit Quiz" : "Create New Quiz"}
            </h2>
            <button
              onClick={onClose}
              className="!p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-800"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Quiz Info */}
            <div className="!mb-8 !space-y-4">
              <Input
                label="Quiz Title"
                placeholder="e.g., Arrays & Strings Fundamentals"
                value={quizTitle}
                onChange={(e) => setQuizTitle(e.target.value)}
                required
              />
              <Textarea
                label="Description (Optional)"
                placeholder="Brief overview of what this quiz covers..."
                value={quizDescription}
                onChange={(e) => setQuizDescription(e.target.value)}
                rows={3}
              />

              <Input
                label="Source"
                placeholder="e.g., LeetCode, Interview Prep Book, etc."
                value={source}
                onChange={(e) => setSource(e.target.value)}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 !mb-2">
                    Difficulty
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as any)}
                    className="w-full !px-4 !py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 !mb-2">
                    Type
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full !px-4 !py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="multiple-choice">Multiple Choice</option>
                    <option value="true-false">True/False</option>
                    <option value="mixed">Mixed</option>
                  </select>
                </div>

                <Input
                  label="Time Limit (minutes)"
                  type="number"
                  placeholder="Optional"
                  value={timeLimit}
                  onChange={(e) => setTimeLimit(e.target.value)}
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 !mb-2">
                  Tags (comma-separated)
                </label>
                <Input
                  placeholder="e.g., arrays, two-pointers, sliding-window"
                  value={tags.join(", ")}
                  onChange={(e) => {
                    const value = e.target.value;
                    const tagsArray = value.split(",").map((tag) => tag.trim());
                    setTags(tagsArray);
                  }}
                />
                {tags.filter((t) => t).length > 0 && (
                  <div className="flex gap-2 !mt-2 flex-wrap">
                    {tags
                      .filter((t) => t)
                      .map((tag, index) => (
                        <span
                          key={index}
                          className="!px-3 !py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm"
                        >
                          {tag}
                        </span>
                      ))}
                  </div>
                )}
              </div>
            </div>

            {/* Questions */}
            <div className="!space-y-6">
              <h3 className="text-lg font-semibold text-slate-200">
                Questions
              </h3>

              {questions.map((q, qIndex) => (
                <div
                  key={q.id}
                  className="bg-slate-800/50 !p-5 rounded-xl border border-slate-700/50"
                >
                  <div className="flex items-start justify-between !mb-4">
                    <h4 className="text-sm font-medium text-slate-300">
                      Question {qIndex + 1}
                    </h4>
                    {questions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeQuestion(q.id)}
                        className="!p-1 text-slate-400 hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>

                  <Textarea
                    label="Question"
                    placeholder="Enter your question..."
                    value={q.question}
                    onChange={(e) =>
                      updateQuestion(q.id, "question", e.target.value)
                    }
                    rows={2}
                    required
                  />

                  <div className="!mt-4">
                    <label className="block text-sm font-medium text-slate-300 !mb-3">
                      Options (check all correct answers)
                    </label>
                    <div className="space-y-2">
                      {q.options.map((option, optIndex) => {
                        const correctAnswers = Array.isArray(q.correctAnswer)
                          ? q.correctAnswer
                          : [q.correctAnswer];
                        return (
                          <div
                            key={optIndex}
                            className="flex items-center gap-3"
                          >
                            <input
                              type="checkbox"
                              checked={correctAnswers.includes(optIndex)}
                              onChange={() =>
                                toggleCorrectAnswer(q.id, optIndex)
                              }
                              className="w-4 h-4 text-purple-600 focus:ring-purple-500 focus:ring-2 rounded"
                            />
                            <Input
                              placeholder={`Option ${optIndex + 1}`}
                              value={option}
                              onChange={(e) =>
                                updateOption(q.id, optIndex, e.target.value)
                              }
                              required
                              className="flex-1"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="!mt-4">
                    <Textarea
                      label="Explanation (Optional)"
                      placeholder="Provide an explanation for the correct answer..."
                      value={q.explanation || ""}
                      onChange={(e) =>
                        updateQuestion(q.id, "explanation", e.target.value)
                      }
                      rows={2}
                    />
                  </div>
                </div>
              ))}

              <Button
                type="button"
                variant="secondary"
                onClick={addQuestion}
                className="w-full"
              >
                <Plus size={16} />
                Add Question
              </Button>
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-end !mt-8 !pt-6 border-t border-slate-700/50">
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={!quizTitle.trim()}>
                {initialData ? "Update Quiz" : "Create Quiz"} (
                {questions.length} question
                {questions.length !== 1 ? "s" : ""})
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}
