"use client";

import { useState } from "react";
import SearchBox from "@/components/ui/SearchBox";
import Button from "@/components/ui/Button";
import { Plus, ChevronRight, Trash2, LayoutDashboard } from "lucide-react";

interface Topic {
  id: string;
  name: string;
  slug?: string;
  subtopics?: Subtopic[];
}

interface Subtopic {
  id: string;
  name: string;
  slug?: string;
  count: number;
}

interface SidebarProps {
  topics: Topic[];
  activeTopic?: string;
  activeSubtopic?: string;
  onDashboardSelect: () => void;
  onTopicSelect: (topicSlug: string) => void;
  onSubtopicSelect: (topicSlug: string, subtopicSlug: string) => void;
  onAddTopic: () => void;
}

export default function Sidebar({
  topics,
  activeTopic,
  activeSubtopic,
  onDashboardSelect,
  onTopicSelect,
  onSubtopicSelect,
  onAddTopic,
}: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(
    new Set([topics[0]?.id]),
  );

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
              !activeTopic
                ? "border-purple-500 bg-purple-500/10 text-white"
                : "border-transparent text-slate-300 hover:bg-slate-700/50 hover:border-slate-600"
            }`}
            onClick={onDashboardSelect}
          >
            <LayoutDashboard size={16} className="flex-shrink-0" />
            <span className="flex-1 text-sm font-medium">Dashboard</span>
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
