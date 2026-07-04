"use client";

import { useState } from "react";
import { Plus, Trash2, X } from "lucide-react";
import Button from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import TagInput from "@/components/ui/TagInput";

interface Question {
  id: string;
  kind?: "multiple-choice" | "true-false" | "short-answer";
  question: string;
  options: string[];
  correctAnswer: number | number[] | string;
  explanation?: string;
}

const TRUE_FALSE_OPTIONS = ["True", "False"];

function isTrueFalseShaped(q: Question) {
  return (
    q.options.length === 2 &&
    q.options[0]?.trim().toLowerCase() === "true" &&
    q.options[1]?.trim().toLowerCase() === "false"
  );
}

function blankMultipleChoiceQuestion(q: Question): Question {
  return { ...q, kind: "multiple-choice" as const, options: ["", "", "", ""], correctAnswer: [] as number[] };
}

function blankTrueFalseQuestion(q: Question): Question {
  return {
    ...q,
    kind: "true-false" as const,
    options: [...TRUE_FALSE_OPTIONS],
    correctAnswer: typeof q.correctAnswer === "number" ? q.correctAnswer : 0,
  };
}

function blankShortAnswerQuestion(q: Question): Question {
  return { ...q, kind: "short-answer" as const, options: [] as string[], correctAnswer: "" };
}

export interface QuizFormData {
  title: string;
  description: string;
  source: string;
  difficulty: "easy" | "medium" | "hard";
  type: "multiple-choice" | "true-false" | "mixed" | "short-answer";
  timeLimit?: number;
  tags: string[];
  questions: Question[];
}

interface AddQuizFormProps {
  onClose: () => void;
  onSave: (quiz: QuizFormData) => void;
  initialData?: QuizFormData;
  tagSuggestions?: string[];
}

export default function AddQuizForm({
  onClose,
  onSave,
  initialData,
  tagSuggestions = [],
}: AddQuizFormProps) {
  const [quizTitle, setQuizTitle] = useState(initialData?.title || "");
  const [quizDescription, setQuizDescription] = useState(
    initialData?.description || "",
  );
  const [source, setSource] = useState(initialData?.source || "");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">(
    initialData?.difficulty || "medium",
  );
  const [type, setType] = useState<"multiple-choice" | "true-false" | "mixed" | "short-answer">(
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
  // Per-question kind, only meaningful (and shown) when the overall quiz
  // type is "mixed" — multiple-choice and true-false otherwise share the
  // same shape, so this is inferred once from existing data and updated
  // explicitly when the user switches a question's kind.
  const [questionKinds, setQuestionKinds] = useState<
    Record<string, "multiple-choice" | "true-false" | "short-answer">
  >(() => {
    const map: Record<string, "multiple-choice" | "true-false" | "short-answer"> = {};
    (initialData?.questions || []).forEach((q) => {
      map[q.id] = q.kind === "short-answer"
        ? "short-answer"
        : isTrueFalseShaped(q) ? "true-false" : "multiple-choice";
    });
    return map;
  });

  const getQuestionKind = (q: Question): "multiple-choice" | "true-false" | "short-answer" => {
    if (type === "true-false") return "true-false";
    if (type === "multiple-choice") return "multiple-choice";
    if (type === "short-answer") return "short-answer";
    return questionKinds[q.id] || (
      q.kind === "short-answer" ? "short-answer" :
      isTrueFalseShaped(q) ? "true-false" : "multiple-choice"
    );
  };

  const setQuestionKind = (
    questionId: string,
    kind: "multiple-choice" | "true-false" | "short-answer",
  ) => {
    setQuestionKinds((prev) => ({ ...prev, [questionId]: kind }));
    setQuestions(
      questions.map((q) => {
        if (q.id !== questionId) return q;
        if (kind === "true-false") return blankTrueFalseQuestion(q);
        if (kind === "short-answer") return blankShortAnswerQuestion(q);
        return blankMultipleChoiceQuestion(q);
      }),
    );
  };

  const handleTypeChange = (
    nextType: "multiple-choice" | "true-false" | "mixed" | "short-answer",
  ) => {
    setType(nextType);
    if (nextType === "true-false") {
      setQuestions(questions.map((q) => blankTrueFalseQuestion(q)));
    } else if (nextType === "short-answer") {
      setQuestions(questions.map((q) => blankShortAnswerQuestion(q)));
    } else if (nextType === "multiple-choice") {
      setQuestions(
        questions.map((q) =>
          isTrueFalseShaped(q) || q.kind === "short-answer"
            ? blankMultipleChoiceQuestion(q)
            : q,
        ),
      );
    }
  };

  const addQuestion = () => {
    const newId = Date.now().toString();
    const isShortAnswer = type === "short-answer";
    const isTrueFalse = type === "true-false";
    const newQuestion: Question = {
      id: newId,
      kind: isShortAnswer ? "short-answer" : isTrueFalse ? "true-false" : "multiple-choice",
      question: "",
      options: isShortAnswer ? [] : isTrueFalse ? [...TRUE_FALSE_OPTIONS] : ["", "", "", ""],
      correctAnswer: isShortAnswer ? "" : isTrueFalse ? 0 : [],
      explanation: "",
    };
    setQuestions([...questions, newQuestion]);
    setQuestionKinds((prev) => ({
      ...prev,
      [newId]: isShortAnswer ? "short-answer" : isTrueFalse ? "true-false" : "multiple-choice",
    }));
  };

  const removeQuestion = (id: string) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((q) => q.id !== id));
    }
  };

  const updateQuestion = (
    id: string,
    field: keyof Question,
    value: Question[keyof Question],
  ) => {
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

  const setSingleCorrectAnswer = (questionId: string, optionIndex: number) => {
    setQuestions(
      questions.map((q) =>
        q.id === questionId ? { ...q, correctAnswer: optionIndex } : q,
      ),
    );
  };

  const toggleCorrectAnswer = (questionId: string, optionIndex: number) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId) {
          const currentAnswers: number[] = Array.isArray(q.correctAnswer)
            ? (q.correctAnswer as number[])
            : typeof q.correctAnswer === "number" ? [q.correctAnswer] : [];
          const newAnswers: number[] = currentAnswers.includes(optionIndex)
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
      if (!q.question.trim()) return false;
      if (getQuestionKind(q) === "short-answer") {
        return typeof q.correctAnswer === "string" && q.correctAnswer.trim().length > 0;
      }
      const correctAnswers = Array.isArray(q.correctAnswer)
        ? q.correctAnswer
        : [q.correctAnswer];
      const hasCorrectAnswer =
        correctAnswers.length > 0 &&
        correctAnswers.every((idx) => typeof idx === "number");
      return q.options.every((o) => o.trim()) && hasCorrectAnswer;
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
                    onChange={(e) =>
                      setDifficulty(
                        e.target.value as "easy" | "medium" | "hard",
                      )
                    }
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
                    onChange={(e) =>
                      handleTypeChange(
                        e.target.value as
                          | "multiple-choice"
                          | "true-false"
                          | "mixed"
                          | "short-answer",
                      )
                    }
                    className="w-full !px-4 !py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="multiple-choice">Multiple Choice</option>
                    <option value="true-false">True/False</option>
                    <option value="short-answer">Short Answer</option>
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
                  Tags
                </label>
                <TagInput
                  tags={tags}
                  onChange={setTags}
                  suggestions={tagSuggestions}
                  placeholder="Add tags (Enter or , to confirm)..."
                />
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

                  {type === "mixed" && (
                    <div className="!mb-4">
                      <label className="block text-sm font-medium text-slate-300 !mb-2">
                        Question Type
                      </label>
                      <select
                        value={getQuestionKind(q)}
                        onChange={(e) =>
                          setQuestionKind(
                            q.id,
                            e.target.value as "multiple-choice" | "true-false" | "short-answer",
                          )
                        }
                        className="w-full !px-4 !py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="multiple-choice">Multiple Choice</option>
                        <option value="true-false">True/False</option>
                        <option value="short-answer">Short Answer</option>
                      </select>
                    </div>
                  )}

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

                  {getQuestionKind(q) === "short-answer" ? (
                    <div className="!mt-4">
                      <Input
                        label="Correct Answer"
                        placeholder="Type the expected answer..."
                        value={typeof q.correctAnswer === "string" ? q.correctAnswer : ""}
                        onChange={(e) => updateQuestion(q.id, "correctAnswer", e.target.value)}
                        required
                      />
                      <p className="text-xs text-slate-500 !mt-1.5">
                        Grading is case-insensitive. Players can also manually mark their answer correct after submitting.
                      </p>
                    </div>
                  ) : getQuestionKind(q) === "true-false" ? (
                    <div className="!mt-4">
                      <label className="block text-sm font-medium text-slate-300 !mb-3">
                        Correct Answer
                      </label>
                      <div className="space-y-2">
                        {q.options.map((option, optIndex) => (
                          <div
                            key={optIndex}
                            className="flex items-center gap-3"
                          >
                            <input
                              type="radio"
                              name={`correct-answer-${q.id}`}
                              checked={q.correctAnswer === optIndex || (Array.isArray(q.correctAnswer) && (q.correctAnswer as number[]).includes(optIndex))}
                              onChange={() =>
                                setSingleCorrectAnswer(q.id, optIndex)
                              }
                              className="w-4 h-4 text-purple-600 focus:ring-purple-500 focus:ring-2"
                            />
                            <span className="flex-1 !px-4 !py-2.5 bg-slate-800/60 border border-slate-700 rounded-lg text-slate-200">
                              {option}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="!mt-4">
                      <label className="block text-sm font-medium text-slate-300 !mb-3">
                        Options (check all correct answers)
                      </label>
                      <div className="space-y-2">
                        {q.options.map((option, optIndex) => {
                          const correctAnswers = Array.isArray(q.correctAnswer)
                            ? q.correctAnswer as number[]
                            : typeof q.correctAnswer === "number" ? [q.correctAnswer] : [];
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
                  )}

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
