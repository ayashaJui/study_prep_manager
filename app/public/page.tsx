"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, FileText, Layers, HelpCircle, Globe } from "lucide-react";
import { Card } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { useAuth } from "@/contexts/AuthContext";

interface PublicTopic {
  shareId: string;
  name: string;
  description: string | null;
  tags: string[];
  stats: {
    notesCount: number;
    flashcardsCount: number;
    quizzesCount: number;
  };
  authorName: string | null;
  createdAt: string;
}

interface Pagination {
  page: number;
  pages: number;
  total: number;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

export default function ExplorePage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [topics, setTopics] = useState<PublicTopic[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/public/topics?page=${page}&limit=20`)
      .then((r) => r.json())
      .then((res) => {
        if (!res.success) throw new Error(res.message || "Failed to load");
        setTopics(res.data);
        setPagination(res.pagination);
        setError(null);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div className="min-h-screen" style={{ background: "#0f1419" }}>
      {/* Header */}
      <div
        className="border-b border-slate-700/50 !px-6 !py-5"
        style={{ background: "#8b5cf6" }}
      >
        <div className="flex items-center justify-between gap-4">
          {/* Left: brand */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 rounded-xl">
              <Globe size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Explore</h1>
              <p className="text-xs text-white/75 !mt-0.5">
                Publicly shared study topics from the community
              </p>
            </div>
          </div>

          {/* Right: auth links or dashboard */}
          <div className="flex items-center gap-3">
            {!authLoading && !isAuthenticated && (
              <>
                <Link
                  href="/auth/login"
                  className="text-sm text-white/80 hover:text-white transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  href="/auth/register"
                  className="text-sm font-medium !px-4 !py-1.5 rounded-lg transition-colors"
                  style={{ background: "rgba(255,255,255,0.2)", color: "white", border: "1px solid rgba(255,255,255,0.3)" }}
                >
                  Create account
                </Link>
              </>
            )}
            {!authLoading && isAuthenticated && (
              <Link
                href="/"
                className="text-sm font-medium !px-4 !py-1.5 rounded-lg transition-colors"
                style={{ background: "rgba(255,255,255,0.2)", color: "white", border: "1px solid rgba(255,255,255,0.3)" }}
              >
                Go to Dashboard
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="!px-6 !py-10">
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-48 rounded-2xl animate-pulse"
                style={{ background: "rgba(30, 41, 66, 0.6)" }}
              />
            ))}
          </div>
        )}

        {error && (
          <div className="text-center !py-24 text-red-400">{error}</div>
        )}

        {!loading && !error && topics.length === 0 && (
          <div className="text-center !py-24">
            <BookOpen size={52} className="mx-auto !mb-5 text-slate-700" />
            <p className="text-slate-400 text-lg font-medium">No shared topics yet.</p>
            <p className="text-slate-500 text-sm !mt-2">
              Be the first to share a topic with the community.
            </p>
          </div>
        )}

        {!loading && !error && topics.length > 0 && (
          <>
            {pagination && (
              <p className="text-slate-500 text-sm !mb-6">
                {pagination.total} topic{pagination.total !== 1 ? "s" : ""} shared
              </p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {topics.map((topic) => (
                <Link
                  key={topic.shareId}
                  href={`/public/topic/${topic.shareId}`}
                  className="block group"
                >
                  <Card className="h-full transition-all duration-200 group-hover:border-violet-500/50 group-hover:shadow-lg group-hover:shadow-violet-900/20 !p-6">
                    <div className="flex flex-col h-full gap-3">
                      <h2 className="text-base font-semibold text-slate-100 group-hover:text-violet-300 transition-colors leading-snug">
                        {topic.name}
                      </h2>

                      {topic.description && (
                        <p className="text-sm text-slate-400 line-clamp-2">
                          {topic.description}
                        </p>
                      )}

                      {topic.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {topic.tags.slice(0, 4).map((tag) => (
                            <Badge key={tag} className="!bg-slate-700/80 !text-slate-300">
                              {tag}
                            </Badge>
                          ))}
                          {topic.tags.length > 4 && (
                            <span className="text-xs text-slate-500 self-center">
                              +{topic.tags.length - 4}
                            </span>
                          )}
                        </div>
                      )}

                      <div className="mt-auto flex items-center justify-between !pt-4 border-t border-slate-700/50">
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                          {topic.stats.notesCount > 0 && (
                            <span className="flex items-center gap-1.5">
                              <FileText size={12} />
                              {topic.stats.notesCount}
                            </span>
                          )}
                          {topic.stats.flashcardsCount > 0 && (
                            <span className="flex items-center gap-1.5">
                              <Layers size={12} />
                              {topic.stats.flashcardsCount}
                            </span>
                          )}
                          {topic.stats.quizzesCount > 0 && (
                            <span className="flex items-center gap-1.5">
                              <HelpCircle size={12} />
                              {topic.stats.quizzesCount}
                            </span>
                          )}
                        </div>

                        <div className="text-xs text-slate-500 flex items-center gap-2">
                          {topic.authorName && (
                            <span className="text-slate-400 font-medium">{topic.authorName}</span>
                          )}
                          <span>{timeAgo(topic.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>

            {pagination && pagination.pages > 1 && (
              <div className="flex items-center justify-center gap-4 !mt-10">
                <button
                  onClick={() => { setLoading(true); setPage((p) => Math.max(1, p - 1)); }}
                  disabled={page === 1}
                  className="!px-5 !py-2.5 rounded-xl text-sm text-slate-300 border border-slate-700 hover:border-violet-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  style={{ background: "rgba(30, 41, 66, 0.6)" }}
                >
                  Previous
                </button>
                <span className="text-sm text-slate-500">
                  Page {page} of {pagination.pages}
                </span>
                <button
                  onClick={() => { setLoading(true); setPage((p) => Math.min(pagination.pages, p + 1)); }}
                  disabled={page === pagination.pages}
                  className="!px-5 !py-2.5 rounded-xl text-sm text-slate-300 border border-slate-700 hover:border-violet-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  style={{ background: "rgba(30, 41, 66, 0.6)" }}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
