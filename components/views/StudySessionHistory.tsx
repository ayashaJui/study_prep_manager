"use client";

import { useCallback, useEffect, useState } from "react";
import { History, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { studySessionsAPI, ApiStudySession } from "@/lib/api";
import { useToast } from "@/contexts/ToastContext";

const PAGE_SIZE = 10;

const ACTIVITY_LABELS: Record<ApiStudySession["activityType"], string> = {
  flashcard: "Flashcards",
  quiz: "Quiz",
  note: "Note",
  review: "Review",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function StudySessionHistory() {
  const { showError } = useToast();
  const [sessions, setSessions] = useState<ApiStudySession[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = useCallback(async (pageToLoad: number) => {
    try {
      setLoading(true);
      setError(null);
      const res = await studySessionsAPI.getHistory({
        limit: PAGE_SIZE,
        page: pageToLoad,
      });
      if (res.success) {
        setSessions(res.data || []);
        setTotalPages(res.pagination?.totalPages || 1);
      } else {
        setError(res.message || "Failed to load study sessions");
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load study sessions";
      setError(message);
      showError(message);
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    fetchSessions(page);
  }, [page, fetchSessions]);

  if (loading) {
    return (
      <div className="!space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-16 rounded-lg animate-pulse"
            style={{ background: "rgba(45, 55, 72, 0.5)" }}
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p style={{ color: "#fc8181" }}>Error: {error}</p>
        <button
          onClick={() => fetchSessions(page)}
          className="mt-4 px-4 py-2 rounded-lg"
          style={{ background: "#667eea", color: "white" }}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <Card>
      <CardTitle>
        <div className="flex items-center gap-2">
          <History size={20} className="text-purple-400" />
          Study Session History
        </div>
      </CardTitle>

      {sessions.length === 0 ? (
        <p className="text-slate-400 text-center py-8">
          No study sessions logged yet. Start a session from the Dashboard to
          see it here.
        </p>
      ) : (
        <div className="!space-y-3">
          {sessions.map((session) => (
            <div
              key={session._id}
              className="flex items-center justify-between !p-4 rounded-xl"
              style={{ background: "rgba(45, 55, 72, 0.4)" }}
            >
              <div className="flex items-center gap-3">
                <Badge variant={session.activityType}>
                  {ACTIVITY_LABELS[session.activityType]}
                </Badge>
                {typeof session.score === "number" && (
                  <Badge variant="default">{session.score}%</Badge>
                )}
              </div>
              <div className="flex items-center gap-4">
                <span
                  className="flex items-center gap-1 text-xs md:text-sm"
                  style={{ color: "#cbd5e0" }}
                >
                  <Clock size={14} />
                  {session.duration} min
                </span>
                <span className="text-xs" style={{ color: "#a0aec0" }}>
                  {formatDate(session.createdAt)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between !mt-6 !pt-4 border-t border-slate-700/50">
          <Button
            variant="secondary"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            <ChevronLeft size={16} />
            Previous
          </Button>
          <span className="text-xs" style={{ color: "#a0aec0" }}>
            Page {page} of {totalPages}
          </span>
          <Button
            variant="secondary"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
            <ChevronRight size={16} />
          </Button>
        </div>
      )}
    </Card>
  );
}
