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
} from "lucide-react";

interface Topic {
  id: string;
  name: string;
  slug?: string;
  favorite?: boolean;
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
  activeView?: "dashboard" | "pinned" | "sessions" | "favorites";
  onDashboardSelect: () => void;
  onPinnedNotesSelect: () => void;
  onSessionHistorySelect: () => void;
  onFavoritesSelect: () => void;
  onToggleFavorite: (topicId: string, current: boolean) => void;
  onTopicSelect: (topicSlug: string) => void;
  onSubtopicSelect: (topicSlug: string, subtopicSlug: string) => void;
  onAddTopic: () => void;
}

export default function Sidebar({
  topics,
  activeTopic,
  activeSubtopic,
  activeView,
  onDashboardSelect,
  onPinnedNotesSelect,
  onSessionHistorySelect,
  onFavoritesSelect,
  onToggleFavorite,
  onTopicSelect,
  onSubtopicSelect,
  onAddTopic,
}: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
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

  const filteredTopics = topics.filter((topic) =>
    topic.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <aside
      className="w-full h-full overflow-y-auto flex-shrink-0 border-r border-slate-700/50 !p-3"
      style={{
        background: "#1a1f2e",
      }}
    >
      <SearchBox
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search topics..."
      />

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
    </aside>
  );
}
