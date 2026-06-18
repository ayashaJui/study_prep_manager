"use client";

import { useEffect, useState } from "react";
import { Card, CardTitle } from "@/components/ui/Card";
import { usePathname } from "next/navigation";

interface PublicNote {
  id: string;
  title?: string;
  content?: string;
}

interface PublicFlashcard {
  id: string;
  front: string;
  back?: string;
}

interface PublicQuiz {
  id: string;
  title: string;
  questionsCount: number;
}

interface PublicTopicData {
  topic: { name: string; description?: string };
  notes: PublicNote[];
  flashcards: PublicFlashcard[];
  quizzes: PublicQuiz[];
}

export default function PublicTopicPage() {
  const pathname = usePathname();
  const parts = pathname.split("/");
  const shareId = parts[parts.length - 1];
  const [data, setData] = useState<PublicTopicData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!shareId) return;
    fetch(`/api/public/topics/${shareId}`)
      .then((r) => r.json())
      .then((res) => {
        if (!res.success) throw new Error(res.message || "Not found");
        setData(res.data);
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load"),
      )
      .finally(() => setLoading(false));
  }, [shareId]);

  if (loading) return <div className="p-6">Loading public topic...</div>;
  if (error) return <div className="p-6 text-red-400">Error: {error}</div>;
  if (!data) return null;

  const { topic, notes, flashcards, quizzes } = data;

  return (
    <div
      className="h-screen w-screen flex flex-col items-center !p-6"
      style={{ background: "#0f1419" }}
    >
      <div className="w-full max-w-4xl">
        <Card>
          <CardTitle>{topic.name}</CardTitle>
          <p className="text-sm text-slate-300">{topic.description}</p>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 !mt-6">
          <Card>
            <CardTitle>Notes</CardTitle>
            {notes.length === 0 ? (
              <p className="text-sm text-slate-400">No notes</p>
            ) : (
              <ul className="!space-y-2">
                {notes.map((n) => (
                  <li key={n.id} className="text-sm text-slate-200">
                    <div className="font-semibold">{n.title || "Untitled"}</div>
                    <div className="text-xs text-slate-400">
                      {n.content?.slice(0, 120)}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card>
            <CardTitle>Flashcards</CardTitle>
            {flashcards.length === 0 ? (
              <p className="text-sm text-slate-400">No flashcards</p>
            ) : (
              <ul className="!space-y-2">
                {flashcards.map((f) => (
                  <li key={f.id} className="text-sm text-slate-200">
                    <div className="font-semibold">{f.front}</div>
                    <div className="text-xs text-slate-400">
                      {f.back?.slice(0, 120)}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card>
            <CardTitle>Quizzes</CardTitle>
            {quizzes.length === 0 ? (
              <p className="text-sm text-slate-400">No quizzes</p>
            ) : (
              <ul className="!space-y-2">
                {quizzes.map((q) => (
                  <li key={q.id} className="text-sm text-slate-200">
                    <div className="font-semibold">{q.title}</div>
                    <div className="text-xs text-slate-400">
                      {q.questionsCount} questions
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
