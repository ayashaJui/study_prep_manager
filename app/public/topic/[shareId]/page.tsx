"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardTitle } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { usePathname } from "next/navigation";

export default function PublicTopicPage() {
  const pathname = usePathname();
  const parts = pathname.split("/");
  const shareId = parts[parts.length - 1];
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!shareId) return;
    setLoading(true);
    fetch(`/api/public/topics/${shareId}`)
      .then((r) => r.json())
      .then((res) => {
        if (!res.success) throw new Error(res.message || "Not found");
        setData(res.data);
      })
      .catch((err) => setError(err.message || "Failed to load"))
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
                {notes.map((n: any) => (
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
                {flashcards.map((f: any) => (
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
                {quizzes.map((q: any) => (
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
