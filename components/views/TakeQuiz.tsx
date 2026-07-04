"use client";

import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import ProgressBar from "@/components/ui/ProgressBar";
import { quizzesAPI } from "@/lib/api";
import {
  Clock,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";

interface QuizQuestion {
  id: string;
  kind?: "multiple-choice" | "true-false" | "short-answer";
  question: string;
  options: string[];
  correctAnswer: number | number[] | string;
  explanation?: string;
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  timeLimit?: number;
  questions: QuizQuestion[];
}

interface TakeQuizProps {
  quiz: Quiz;
  onClose: () => void;
  onComplete: (score: number) => void;
}

export default function TakeQuiz({ quiz, onClose, onComplete }: TakeQuizProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  // number[] for MC/TF, string for short-answer, null = unanswered
  const [selectedAnswers, setSelectedAnswers] = useState<(number[] | string | null)[]>(
    Array(quiz.questions.length).fill(null),
  );
  // Post-submit manual overrides for short-answer questions
  const [manualOverrides, setManualOverrides] = useState<Record<number, boolean>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(
    quiz.timeLimit ? quiz.timeLimit * 60 : null,
  );
  const [startedAt] = useState(() => Date.now());

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

  // Timer — only decrements, submit is handled by a separate effect
  useEffect(() => {
    if (timeRemaining === null || timeRemaining <= 0 || isSubmitted) return;
    const timer = setInterval(() => {
      setTimeRemaining((prev) => (prev !== null && prev > 1 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [timeRemaining, isSubmitted]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const isShortAnswer = (q: QuizQuestion) =>
    q.kind === "short-answer" || typeof q.correctAnswer === "string";

  const handleAnswerSelect = (optionIndex: number) => {
    if (isSubmitted) return;
    const newAnswers = [...selectedAnswers];
    const currentAnswers = (newAnswers[currentQuestionIndex] as number[]) || [];
    const updatedAnswers = currentAnswers.includes(optionIndex)
      ? currentAnswers.filter((idx) => idx !== optionIndex)
      : [...currentAnswers, optionIndex];
    newAnswers[currentQuestionIndex] = updatedAnswers.length > 0 ? updatedAnswers : null;
    setSelectedAnswers(newAnswers);
  };

  const handleShortAnswerChange = (value: string) => {
    if (isSubmitted) return;
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestionIndex] = value;
    setSelectedAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const arraysEqual = (a: number[], b: number[]) => {
    if (a.length !== b.length) return false;
    const sortedA = [...a].sort((x, y) => x - y);
    const sortedB = [...b].sort((x, y) => x - y);
    return sortedA.every((val, idx) => val === sortedB[idx]);
  };

  const gradeShortAnswer = (typed: string | null, correct: string) => {
    if (!typed || typeof typed !== "string") return false;
    return typed.trim().toLowerCase() === correct.trim().toLowerCase();
  };

  const handleSubmit = useCallback(() => {
    setIsSubmitted(true);
    const score = selectedAnswers.reduce<number>((acc, answer, index) => {
      if (answer === null) return acc;
      const q = quiz.questions[index];
      if (isShortAnswer(q)) {
        return acc + (gradeShortAnswer(answer as string, q.correctAnswer as string) ? 1 : 0);
      }
      const correctAnswer = q.correctAnswer;
      const correctAnswers = Array.isArray(correctAnswer) ? correctAnswer : [correctAnswer as number];
      const isCorrect = arraysEqual(answer as number[], correctAnswers);
      return acc + (isCorrect ? 1 : 0);
    }, 0);

    const timeTaken = Math.round((Date.now() - startedAt) / 1000);
    quizzesAPI
      .submit(
        quiz.id,
        quiz.questions.map((q, index) => ({
          questionId: q.id,
          selectedAnswer: (isShortAnswer(q) ? -1 : selectedAnswers[index]) as number | number[] | null,
        })),
        timeTaken,
      )
      .catch((err) => console.error("Failed to log quiz attempt", err));

    onComplete((score / quiz.questions.length) * 100);
  }, [selectedAnswers, quiz.questions, quiz.id, startedAt, onComplete]);

  // Auto-submit when the countdown reaches zero
  useEffect(() => {
    if (timeRemaining !== 0 || isSubmitted) return;
    const id = setTimeout(handleSubmit, 0);
    return () => clearTimeout(id);
  }, [timeRemaining, isSubmitted, handleSubmit]);

  const getScore = (): number => {
    return selectedAnswers.reduce<number>((acc, answer, index) => {
      if (answer === null) return acc;
      const q = quiz.questions[index];
      if (isShortAnswer(q)) {
        const autoCorrect = gradeShortAnswer(answer as string, q.correctAnswer as string);
        return acc + ((manualOverrides[index] ?? autoCorrect) ? 1 : 0);
      }
      const correctAnswers = Array.isArray(q.correctAnswer) ? q.correctAnswer : [q.correctAnswer as number];
      return acc + (arraysEqual(answer as number[], correctAnswers) ? 1 : 0);
    }, 0);
  };

  const isAnswerCorrect = (questionIndex: number) => {
    const answer = selectedAnswers[questionIndex];
    if (answer === null) return false;
    const q = quiz.questions[questionIndex];
    if (isShortAnswer(q)) {
      const autoCorrect = gradeShortAnswer(answer as string, q.correctAnswer as string);
      return manualOverrides[questionIndex] ?? autoCorrect;
    }
    if (!answer) return false;
    const correctAnswers = Array.isArray(q.correctAnswer) ? q.correctAnswer : [q.correctAnswer as number];
    return arraysEqual(answer as number[], correctAnswers);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 overflow-y-auto flex items-start justify-center !p-4">
      <Card className="w-full max-w-4xl !my-8">
        {/* Header */}
        <div className="!pb-6 border-b border-slate-700/50">
          <div className="flex items-start justify-between !mb-4">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-slate-100 !mb-2">
                {quiz.title}
              </h2>
              <div className="flex items-center gap-3 flex-wrap">
                <Badge
                  variant={
                    quiz.difficulty === "easy"
                      ? "mastered"
                      : quiz.difficulty === "medium"
                        ? "in-progress"
                        : "review"
                  }
                >
                  {quiz.difficulty.charAt(0).toUpperCase() +
                    quiz.difficulty.slice(1)}
                </Badge>
                <span className="text-sm text-slate-400">
                  {quiz.questions.length} Questions
                </span>
                {timeRemaining !== null && !isSubmitted && (
                  <span
                    className={`text-sm font-medium inline-flex items-center gap-1 ${
                      timeRemaining < 60 ? "text-red-400" : "text-slate-300"
                    }`}
                  >
                    <Clock size={16} />
                    {formatTime(timeRemaining)}
                  </span>
                )}
              </div>
            </div>
            {!isSubmitted && (
              <Button variant="secondary" onClick={onClose}>
                <ArrowLeft size={16} />
                Exit
              </Button>
            )}
          </div>

          {!isSubmitted && (
            <div>
              <div className="flex items-center justify-between text-sm text-slate-400 !mb-2">
                <span>
                  Question {currentQuestionIndex + 1} of {quiz.questions.length}
                </span>
                <span>{Math.round(progress)}% Complete</span>
              </div>
              <ProgressBar value={progress} />
            </div>
          )}
        </div>

        {!isSubmitted ? (
          <>
            {/* Question */}
            <div className="!py-8">
              <h3 className="text-xl font-medium text-slate-100 !mb-6">
                {currentQuestion.question}
              </h3>

              {isShortAnswer(currentQuestion) ? (
                <div>
                  <textarea
                    value={typeof selectedAnswers[currentQuestionIndex] === "string"
                      ? (selectedAnswers[currentQuestionIndex] as string)
                      : ""}
                    onChange={(e) => handleShortAnswerChange(e.target.value)}
                    placeholder="Type your answer here..."
                    rows={4}
                    className="w-full !px-4 !py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-sm"
                  />
                  <p className="text-xs text-slate-500 !mt-1.5">Grading is case-insensitive. You can adjust the result in the review.</p>
                </div>
              ) : (
                <div className="!space-y-3">
                  {currentQuestion.options.map((option, index) => {
                    const currentAnswers =
                      (selectedAnswers[currentQuestionIndex] as number[]) || [];
                    const isSelected = currentAnswers.includes(index);
                    return (
                      <button
                        key={index}
                        onClick={() => handleAnswerSelect(index)}
                        className={`w-full !p-4 text-left rounded-lg border-2 transition-all ${
                          isSelected
                            ? "border-purple-500 bg-purple-500/20"
                            : "border-slate-700 bg-slate-800/50 hover:border-slate-600"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0 !mt-0.5 ${
                              isSelected
                                ? "border-purple-500 bg-purple-500"
                                : "border-slate-600"
                            }`}
                          >
                            {isSelected && (
                              <CheckCircle2 size={16} className="text-white" />
                            )}
                          </div>
                          <span className="text-slate-200 flex-1">{option}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="!pt-6 border-t border-slate-700/50 flex items-center justify-between">
              <Button
                variant="secondary"
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
              >
                <ArrowLeft size={16} />
                Previous
              </Button>

              {currentQuestionIndex === quiz.questions.length - 1 ? (
                <Button
                  onClick={handleSubmit}
                  disabled={selectedAnswers.some((a, i) =>
                    isShortAnswer(quiz.questions[i])
                      ? !a || (typeof a === "string" && !a.trim())
                      : a === null
                  )}
                >
                  Submit Quiz
                </Button>
              ) : (
                <Button onClick={handleNext}>
                  Next
                  <ArrowRight size={16} />
                </Button>
              )}
            </div>
          </>
        ) : (
          <>
            {/* Results */}
            <div className="!py-8">
              <div className="text-center !mb-8">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 !mb-4">
                  <span className="text-4xl font-bold text-white">
                    {Math.round((getScore() / quiz.questions.length) * 100)}%
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-slate-100 !mb-2">
                  Quiz Complete!
                </h3>
                <p className="text-slate-400">
                  You got {getScore()} out of {quiz.questions.length} questions
                  correct
                </p>
              </div>

              {/* Question Review */}
              <div className="!space-y-6">
                <h4 className="text-lg font-semibold text-slate-200">
                  Review Answers
                </h4>

                {quiz.questions.map((question, qIndex) => {
                  const correct = isAnswerCorrect(qIndex);
                  const userAnswer = selectedAnswers[qIndex];
                  const sa = isShortAnswer(question);

                  // MC/TF answer arrays
                  const userAnswerArr: number[] = !sa && Array.isArray(userAnswer) ? userAnswer as number[] : [];
                  const correctAnswerArr: number[] = !sa
                    ? (Array.isArray(question.correctAnswer)
                        ? question.correctAnswer as number[]
                        : [question.correctAnswer as number])
                    : [];

                  return (
                    <div
                      key={question.id}
                      className="bg-slate-800/50 !p-5 rounded-xl border border-slate-700/50"
                    >
                      <div className="flex items-start gap-3 !mb-4">
                        {correct ? (
                          <CheckCircle2 size={24} className="text-green-500 flex-shrink-0 !mt-0.5" />
                        ) : (
                          <XCircle size={24} className="text-red-500 flex-shrink-0 !mt-0.5" />
                        )}
                        <div className="flex-1">
                          <h5 className="font-medium text-slate-200 !mb-3">
                            Question {qIndex + 1}: {question.question}
                          </h5>

                          {sa ? (
                            <div className="!space-y-2">
                              <div className="!p-3 rounded-lg bg-slate-700/50 border border-slate-600">
                                <p className="text-xs text-slate-400 !mb-1">Your answer</p>
                                <p className="text-slate-200 text-sm">
                                  {userAnswer as string || <em className="text-slate-500">No answer</em>}
                                </p>
                              </div>
                              <div className="!p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                                <p className="text-xs text-slate-400 !mb-1">Expected answer</p>
                                <p className="text-green-300 text-sm">{question.correctAnswer as string}</p>
                              </div>
                              <button
                                type="button"
                                onClick={() =>
                                  setManualOverrides((prev) => ({
                                    ...prev,
                                    [qIndex]: !(prev[qIndex] ?? gradeShortAnswer(userAnswer as string, question.correctAnswer as string)),
                                  }))
                                }
                                className={`text-xs !px-3 !py-1.5 rounded-lg border transition-colors ${
                                  correct
                                    ? "border-green-500/50 text-green-400 hover:bg-green-500/10"
                                    : "border-red-500/50 text-red-400 hover:bg-red-500/10"
                                }`}
                              >
                                {correct ? "Mark as incorrect" : "Mark as correct"}
                              </button>
                            </div>
                          ) : (
                            <div className="!space-y-2">
                              {question.options.map((option, oIndex) => {
                                const isUserAnswer = userAnswerArr.includes(oIndex);
                                const isCorrectAnswer = correctAnswerArr.includes(oIndex);
                                return (
                                  <div
                                    key={oIndex}
                                    className={`!p-3 rounded-lg ${
                                      isCorrectAnswer
                                        ? "bg-green-500/20 border border-green-500/50"
                                        : isUserAnswer
                                          ? "bg-red-500/20 border border-red-500/50"
                                          : "bg-slate-800/50"
                                    }`}
                                  >
                                    <div className="flex items-center gap-2">
                                      {isCorrectAnswer && <CheckCircle2 size={16} className="text-green-500" />}
                                      {isUserAnswer && !isCorrectAnswer && <XCircle size={16} className="text-red-500" />}
                                      <span className={isCorrectAnswer ? "text-green-300" : isUserAnswer ? "text-red-300" : "text-slate-400"}>
                                        {option}
                                      </span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {question.explanation && (
                            <div className="!mt-3 !p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                              <p className="text-sm text-blue-300">
                                <strong>Explanation:</strong> {question.explanation}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Close Button */}
            <div className="!pt-6 border-t border-slate-700/50">
              <Button onClick={onClose} className="w-full">
                Close
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
