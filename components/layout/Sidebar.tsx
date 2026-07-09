"use client";

import { useState } from "react";
import SearchBox from "@/components/ui/SearchBox";
import Button from "@/components/ui/Button";
import {
  Plus,
  ChevronRight,
  LayoutDashboard,
  Pin,
  History,
  Star,
  ArrowUpDown,
  Code2,
  Play,
  Square,
  Timer,
} from "lucide-react";

type SortOrder = "newest" | "oldest" | "az" | "za";

interface Topic {
  id: string;
  name: string;
  slug?: string;
  favorite?: boolean;
  createdAt?: string;
  subtopics?: Subtopic[];
}

interface Subtopic {
  id: string;
  name: string;
  slug?: string;
  count?: number;
}

interface SidebarProps {
  topics: Topic[];
  activeTopic?: string;
  activeSubtopic?: string;
  activeView?: "dashboard" | "pinned" | "sessions" | "favorites" | "problems";
  dueProblemsCount?: number;
  sessionStartedAt: number | null;
  sessionElapsedMs: number;
  loggingSession: boolean;
  onStartSession: () => void;
  onStopSession: () => void;
  onDashboardSelect: () => void;
  onPinnedNotesSelect: () => void;
  onSessionHistorySelect: () => void;
  onFavoritesSelect: () => void;
  onProblemsSelect: () => void;
  onToggleFavorite: (topicId: string, current: boolean) => void;
  onTopicSelect: (topicSlug: string) => void;
  onSubtopicSelect: (topicSlug: string, subtopicSlug: string) => void;
  onAddTopic: () => void;
}

function formatElapsed(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export default function Sidebar({
  topics,
  activeTopic,
  activeSubtopic,
  activeView,
  dueProblemsCount = 0,
  sessionStartedAt,
  sessionElapsedMs,
  loggingSession,
  onStartSession,
  onStopSession,
  onDashboardSelect,
  onPinnedNotesSelect,
  onSessionHistorySelect,
  onFavoritesSelect,
  onProblemsSelect,
  onToggleFavorite,
  onTopicSelect,
  onSubtopicSelect,
  onAddTopic,
}: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());
  const [initialExpanded, setInitialExpanded] = useState(false);

  if (!initialExpanded && topics.length > 0) {
    setInitialExpanded(true);
    setExpandedTopics(new Set([topics[0].id]));
  }

  const toggleExpand = (topicId: string) => {
    setExpandedTopics((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(topicId)) {
        newSet.delete(topicId);
      } else {
        newSet.add(topicId);
      }
      return newSet;
    });
  };

  const filteredTopics = topics
    .filter((topic) =>
      topic.name.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    .sort((a, b) => {
      switch (sortOrder) {
        case "az":
          return a.name.localeCompare(b.name);
        case "za":
          return b.name.localeCompare(a.name);
        case "oldest":
          return (a.createdAt ?? "") < (b.createdAt ?? "") ? -1 : 1;
        default: // newest
          return (a.createdAt ?? "") > (b.createdAt ?? "") ? -1 : 1;
      }
    });

  return (
    <aside
      className="w-full h-full flex flex-col flex-shrink-0 border-r border-slate-700/50"
      style={{ background: "#1a1f2e" }}
    >
      <div className="flex-1 overflow-y-auto !p-3">
      <SearchBox
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search topics..."
      />

      <div className="flex items-center gap-2 !mb-3">
        <ArrowUpDown size={13} className="text-slate-500 flex-shrink-0" />
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value as SortOrder)}
          className="flex-1 text-xs rounded-md !px-2 !py-1.5 focus:outline-none focus:border-slate-500 border"
          style={{
            background: "rgba(30, 41, 59, 0.6)",
            borderColor: "rgba(71, 85, 105, 0.5)",
            color: "#94a3b8",
          }}
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="az">A → Z</option>
          <option value="za">Z → A</option>
        </select>
      </div>

      <Button className="w-full mb-4" onClick={onAddTopic}>
        <Plus size={18} />
        Add New Topic
      </Button>

      <ul className="space-y-0.5 !mt-5">
        {/* Dashboard Item */}
        <li>
          <div
            className={`flex items-center gap-2 !px-3 !py-2.5 rounded-md cursor-pointer transition-all border-l-3 ${
              !activeTopic && activeView !== "pinned" && activeView !== "sessions" && activeView !== "favorites"
                ? "border-purple-500 bg-purple-500/10 text-white"
                : "border-transparent text-slate-300 hover:bg-slate-700/50 hover:border-slate-600"
            }`}
            onClick={onDashboardSelect}
          >
            <LayoutDashboard size={16} className="flex-shrink-0" />
            <span className="flex-1 text-sm font-medium">Dashboard</span>
          </div>
        </li>

        {/* Pinned Notes Item */}
        <li>
          <div
            className={`flex items-center gap-2 !px-3 !py-2.5 rounded-md cursor-pointer transition-all border-l-3 ${
              !activeTopic && activeView === "pinned"
                ? "border-purple-500 bg-purple-500/10 text-white"
                : "border-transparent text-slate-300 hover:bg-slate-700/50 hover:border-slate-600"
            }`}
            onClick={onPinnedNotesSelect}
          >
            <Pin size={16} className="flex-shrink-0" />
            <span className="flex-1 text-sm font-medium">Pinned Notes</span>
          </div>
        </li>

        {/* Session History Item */}
        <li>
          <div
            className={`flex items-center gap-2 !px-3 !py-2.5 rounded-md cursor-pointer transition-all border-l-3 ${
              !activeTopic && activeView === "sessions"
                ? "border-purple-500 bg-purple-500/10 text-white"
                : "border-transparent text-slate-300 hover:bg-slate-700/50 hover:border-slate-600"
            }`}
            onClick={onSessionHistorySelect}
          >
            <History size={16} className="flex-shrink-0" />
            <span className="flex-1 text-sm font-medium">Session History</span>
          </div>
        </li>

        {/* Favorites Item */}
        <li>
          <div
            className={`flex items-center gap-2 !px-3 !py-2.5 rounded-md cursor-pointer transition-all border-l-3 ${
              !activeTopic && activeView === "favorites"
                ? "border-purple-500 bg-purple-500/10 text-white"
                : "border-transparent text-slate-300 hover:bg-slate-700/50 hover:border-slate-600"
            }`}
            onClick={onFavoritesSelect}
          >
            <Star size={16} className="flex-shrink-0" />
            <span className="flex-1 text-sm font-medium">Favorites</span>
          </div>
        </li>

        {/* Problems Item */}
        <li>
          <div
            className={`flex items-center gap-2 !px-3 !py-2.5 rounded-md cursor-pointer transition-all border-l-3 ${
              !activeTopic && activeView === "problems"
                ? "border-purple-500 bg-purple-500/10 text-white"
                : "border-transparent text-slate-300 hover:bg-slate-700/50 hover:border-slate-600"
            }`}
            onClick={onProblemsSelect}
          >
            <Code2 size={16} className="flex-shrink-0" />
            <span className="flex-1 text-sm font-medium">Problems</span>
            {dueProblemsCount > 0 && (
              <span className="bg-amber-500 text-white text-xs rounded-full !px-1.5 !py-0.5 leading-none">
                {dueProblemsCount}
              </span>
            )}
          </div>
        </li>

        {/* Topics List */}
        {filteredTopics.map((topic) => (
          <li key={topic.id}>
            <div
              className={`flex items-center gap-2 !px-3 !py-2.5 rounded-md cursor-pointer transition-all border-l-3 ${
                (activeTopic === topic.slug || activeTopic === topic.id) && !activeSubtopic
                  ? "border-purple-500 bg-purple-500/10 text-white"
                  : "border-transparent text-slate-300 hover:bg-slate-700/50 hover:border-slate-600"
              }`}
              onClick={() => onTopicSelect(topic.slug || topic.id)}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (topic.subtopics && topic.subtopics.length > 0) {
                    toggleExpand(topic.id);
                  }
                }}
                className="transition-transform duration-200 flex-shrink-0"
                style={{
                  transform: expandedTopics.has(topic.id)
                    ? "rotate(90deg)"
                    : "rotate(0deg)",
                  opacity:
                    topic.subtopics && topic.subtopics.length > 0 ? 1 : 0.3,
                }}
              >
                <ChevronRight size={14} />
              </button>
              <span className="flex-1 text-sm font-medium truncate">
                {topic.name}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(topic.id, !!topic.favorite);
                }}
                className="flex-shrink-0 transition-colors"
                style={{ color: topic.favorite ? "#facc15" : "#475569" }}
                title={topic.favorite ? "Remove from favorites" : "Add to favorites"}
              >
                <Star size={13} fill={topic.favorite ? "#facc15" : "none"} />
              </button>
            </div>

            {topic.subtopics && expandedTopics.has(topic.id) && (
              <ul className="!ml-5 !pl-3 border-l-2 border-slate-600/50 mt-0.5 mb-0.5 space-y-0.5">
                {topic.subtopics.map((subtopic) => (
                  <li key={subtopic.id}>
                    <div
                      className={`flex items-center justify-between gap-2 !px-3 !py-2 rounded-md cursor-pointer transition-all border-l-2 ${
                        (activeSubtopic === subtopic.slug || activeSubtopic === subtopic.id)
                          ? "border-purple-500 bg-purple-500/10 text-white"
                          : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-700/30 hover:border-slate-600"
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSubtopicSelect(topic.slug || topic.id, subtopic.slug || subtopic.id);
                      }}
                    >
                      <span className="text-xs font-medium truncate">
                        {subtopic.name}
                      </span>
                      <span className="bg-slate-600/70 text-slate-200 !px-1.5 !py-0.5 rounded text-xs font-medium flex-shrink-0">
                        {subtopic.count}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
      </div>{/* end scrollable area */}

      {/* Study Session Timer — always pinned to bottom */}
      <div className="flex-shrink-0 !px-3 !pb-3 !pt-3 border-t border-slate-700/50">
        {sessionStartedAt === null ? (
          <button
            onClick={onStartSession}
            className="w-full flex items-center justify-center !gap-2 !py-2.5 rounded-lg text-sm font-medium transition-all"
            style={{ background: "rgba(124,58,237,0.15)", color: "#a78bfa", border: "1px solid rgba(124,58,237,0.25)" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(124,58,237,0.25)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(124,58,237,0.15)"; }}
          >
            <Play size={14} />
            Start Studying
          </button>
        ) : (
          <div className="flex items-center !gap-2">
            <div
              className="flex-1 flex items-center !gap-2 !px-3 !py-2 rounded-lg"
              style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)" }}
            >
              <Timer size={13} style={{ color: "#4ade80" }} />
              <span className="text-sm font-mono font-semibold" style={{ color: "#4ade80" }}>
                {formatElapsed(sessionElapsedMs)}
              </span>
            </div>
            <button
              onClick={onStopSession}
              disabled={loggingSession}
              className="flex items-center !gap-1.5 !px-3 !py-2 rounded-lg text-xs font-medium transition-all"
              style={{ background: "rgba(239,68,68,0.15)", color: "#f87171", border: "1px solid rgba(239,68,68,0.25)" }}
              onMouseEnter={(e) => { if (!loggingSession) e.currentTarget.style.background = "rgba(239,68,68,0.25)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(239,68,68,0.15)"; }}
            >
              <Square size={12} />
              {loggingSession ? "..." : "Stop"}
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
