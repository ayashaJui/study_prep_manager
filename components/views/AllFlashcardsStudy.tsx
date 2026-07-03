"use client";

import { useState } from "react";
import { Brain, X, RotateCcw, Layers } from "lucide-react";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { flashcardsAPI, ApiFlashcard } from "@/lib/api";
import { useToast } from "@/contexts/ToastContext";

type StudyCard = ApiFlashcard & { topicName?: string };

export default function AllFlashcardsStudy() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [queue, setQueue] = useState<StudyCard[]>([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [done, setDone] = useState(false);
  const { showError } = useToast();

  const open = async () => {
    setLoading(true);
    setIsOpen(true);
    setDone(false);
    try {
      const cards = (await flashcardsAPI.getAllForUser()) as StudyCard[];
      if (cards.length === 0) {
        showError("No flashcards yet — create some first!");
        setIsOpen(false);
        return;
      }
      const now = Date.now();
      const due = cards.filter(
        (c) => !c.nextReview || new Date(c.nextReview).getTime() <= now,
      );
      const notDue = cards.filter(
        (c) => c.nextReview && new Date(c.nextReview).getTime() > now,
      );
      setQueue(due.length > 0 ? [...due, ...notDue] : cards);
      setIndex(0);
      setFlipped(false);
    } catch (err) {
      showError(
        err instanceof Error ? err.message : "Failed to load flashcards",
      );
      setIsOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const close = () => {
    setIsOpen(false);
    setDone(false);
    setQueue([]);
  };

  const advance = () => {
    const next = index + 1;
    if (next >= queue.length) {
      setDone(true);
    } else {
      setIndex(next);
      setFlipped(false);
    }
  };

  const handleReview = async (quality: number) => {
    const card = queue[index];
    if (!card) return;
    setReviewing(true);
    try {
      await flashcardsAPI.review(card._id, quality, 0);
    } catch {
      // non-fatal — still advance
    } finally {
      setReviewing(false);
      advance();
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={open}
        className="flex items-center justify-center gap-2 w-full !mt-3 !px-4 !py-2.5 rounded-xl border border-indigo-400/30 bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20 hover:text-indigo-200 transition-colors text-sm font-medium"
      >
        <Layers size={15} />
        Study All Flashcards
      </button>
    );
  }

  const current = queue[index];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center !p-4">
      <div className="w-full max-w-xl bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl">
        <div className="flex items-center justify-between !p-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <Brain size={20} className="text-indigo-400" />
            <h2 className="text-lg font-semibold text-slate-100">
              Study All Flashcards
            </h2>
          </div>
          <button
            onClick={close}
            className="!p-1.5 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-800"
          >
            <X size={18} />
          </button>
        </div>

        <div className="!p-5">
          {loading ? (
            <div className="text-center !py-12 text-slate-400">
              Loading flashcards...
            </div>
          ) : done ? (
            <div className="text-center !py-12 !space-y-4">
              <div className="text-5xl">🎉</div>
              <p className="text-xl font-semibold text-slate-100">
                Session complete!
              </p>
              <p className="text-slate-400">
                You reviewed {queue.length} flashcard
                {queue.length !== 1 ? "s" : ""} across all topics.
              </p>
              <div className="flex gap-3 justify-center !pt-2">
                <Button variant="secondary" onClick={close}>
                  Close
                </Button>
                <Button onClick={open}>
                  <RotateCcw size={15} />
                  Study Again
                </Button>
              </div>
            </div>
          ) : current ? (
            <div className="!space-y-4">
              <div className="flex items-center justify-between text-sm text-slate-400">
                <span>
                  Card {index + 1} of {queue.length}
                </span>
                {current.topicName && (
                  <Badge variant="default" className="!text-xs">
                    {current.topicName}
                  </Badge>
                )}
                <span>{flipped ? "Answer" : "Question"}</span>
              </div>

              <div className="w-full h-1.5 rounded-full bg-slate-800">
                <div
                  className="h-1.5 rounded-full bg-indigo-500 transition-all duration-300"
                  style={{ width: `${(index / queue.length) * 100}%` }}
                />
              </div>

              <div
                className="rounded-xl border border-slate-700 bg-slate-800/60 !p-6 text-center min-h-[160px] flex items-center justify-center cursor-pointer select-none"
                onClick={() => setFlipped((f) => !f)}
              >
                <p className="text-base text-slate-100 whitespace-pre-wrap leading-relaxed">
                  {flipped ? current.back : current.front}
                </p>
              </div>

              <div className="flex justify-between">
                <Button variant="secondary" onClick={advance}>
                  Skip
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setFlipped((f) => !f)}
                >
                  {flipped ? "Show Question" : "Show Answer"}
                </Button>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {[
                  { value: 0, label: "Again" },
                  { value: 1, label: "Hard" },
                  { value: 2, label: "Difficult" },
                  { value: 3, label: "Okay" },
                  { value: 4, label: "Good" },
                  { value: 5, label: "Easy" },
                ].map((opt) => (
                  <Button
                    key={opt.value}
                    variant="secondary"
                    onClick={() => handleReview(opt.value)}
                    disabled={!flipped || reviewing}
                  >
                    {opt.label}
                  </Button>
                ))}
              </div>
              <p className="text-xs text-slate-500 text-center">
                Flip the card first, then rate your recall
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
