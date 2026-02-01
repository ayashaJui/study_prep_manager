"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import ProgressBar from "@/components/ui/ProgressBar";
import {
  Clock,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number | number[]; // Support both single and multiple
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
  const [selectedAnswers, setSelectedAnswers] = useState<(number[] | null)[]>(
    Array(quiz.questions.length).fill(null),
  );
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(
    quiz.timeLimit ? quiz.timeLimit * 60 : null,
  );

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

  // Timer
  useEffect(() => {
    if (timeRemaining === null || timeRemaining <= 0 || isSubmitted) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === null || prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, isSubmitted]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleAnswerSelect = (optionIndex: number) => {
    if (isSubmitted) return;
    const newAnswers = [...selectedAnswers];
    const currentAnswers = newAnswers[currentQuestionIndex] || [];

    // Toggle selection
    const updatedAnswers = currentAnswers.includes(optionIndex)
      ? currentAnswers.filter((idx) => idx !== optionIndex)
      : [...currentAnswers, optionIndex];

    newAnswers[currentQuestionIndex] =
      updatedAnswers.length > 0 ? updatedAnswers : null;
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
    const sortedA = [...a].sort();
    const sortedB = [...b].sort();
    return sortedA.every((val, idx) => val === sortedB[idx]);
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
    const score = selectedAnswers.reduce<number>((acc, answer, index) => {
      if (answer === null) return acc;
      const correctAnswer = quiz.questions[index].correctAnswer;
      const correctAnswers = Array.isArray(correctAnswer)
        ? correctAnswer
        : [correctAnswer];
      const isCorrect = arraysEqual(answer, correctAnswers);
      return acc + (isCorrect ? 1 : 0);
    }, 0);
    onComplete((score / quiz.questions.length) * 100);
  };

  const getScore = (): number => {
    return selectedAnswers.reduce<number>((acc, answer, index) => {
      if (answer === null) return acc;
      const correctAnswer = quiz.questions[index].correctAnswer;
      const correctAnswers = Array.isArray(correctAnswer)
        ? correctAnswer
        : [correctAnswer];
      const isCorrect = arraysEqual(answer, correctAnswers);
      return acc + (isCorrect ? 1 : 0);
    }, 0);
  };

  const isAnswerCorrect = (questionIndex: number) => {
    const answer = selectedAnswers[questionIndex];
    if (!answer) return false;
    const correctAnswer = quiz.questions[questionIndex].correctAnswer;
    const correctAnswers = Array.isArray(correctAnswer)
      ? correctAnswer
      : [correctAnswer];
    return arraysEqual(answer, correctAnswers);
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

              <div className="!space-y-3">
                {currentQuestion.options.map((option, index) => {
                  const currentAnswers =
                    selectedAnswers[currentQuestionIndex] || [];
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
                  disabled={selectedAnswers.some((a) => a === null)}
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
                  const isCorrect = isAnswerCorrect(qIndex);
                  const userAnswer = selectedAnswers[qIndex];
                  const correctAnswer = question.correctAnswer;
                  const userAnswerArr = Array.isArray(userAnswer)
                    ? userAnswer
                    : typeof userAnswer === "number"
                      ? [userAnswer]
                      : [];
                  const correctAnswerArr = Array.isArray(correctAnswer)
                    ? correctAnswer
                    : [correctAnswer];

                  return (
                    <div
                      key={question.id}
                      className="bg-slate-800/50 !p-5 rounded-xl border border-slate-700/50"
                    >
                      <div className="flex items-start gap-3 !mb-4">
                        {isCorrect ? (
                          <CheckCircle2
                            size={24}
                            className="text-green-500 flex-shrink-0 !mt-0.5"
                          />
                        ) : (
                          <XCircle
                            size={24}
                            className="text-red-500 flex-shrink-0 !mt-0.5"
                          />
                        )}
                        <div className="flex-1">
                          <h5 className="font-medium text-slate-200 !mb-3">
                            Question {qIndex + 1}: {question.question}
                          </h5>

                          <div className="!space-y-2">
                            {question.options.map((option, oIndex) => {
                              const isUserAnswer =
                                userAnswerArr.includes(oIndex);
                              const isCorrectAnswer =
                                correctAnswerArr.includes(oIndex);

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
                                    {isCorrectAnswer && (
                                      <CheckCircle2
                                        size={16}
                                        className="text-green-500"
                                      />
                                    )}
                                    {isUserAnswer && !isCorrectAnswer && (
                                      <XCircle
                                        size={16}
                                        className="text-red-500"
                                      />
                                    )}
                                    <span
                                      className={
                                        isCorrectAnswer
                                          ? "text-green-300"
                                          : isUserAnswer
                                            ? "text-red-300"
                                            : "text-slate-400"
                                      }
                                    >
                                      {option}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {question.explanation && (
                            <div className="!mt-3 !p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                              <p className="text-sm text-blue-300">
                                <strong>Explanation:</strong>{" "}
                                {question.explanation}
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
