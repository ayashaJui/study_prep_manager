"use client";

import { Star, BookOpen, FileText, Layers, HelpCircle } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/Card";

export interface FavoriteTopic {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  notesCount?: number;
  flashcardsCount?: number;
  quizzesCount?: number;
}

interface FavoriteTopicsProps {
  topics: FavoriteTopic[];
  onTopicSelect: (slug: string) => void;
  onUnfavorite: (topicId: string) => void;
}

export default function FavoriteTopics({
  topics,
  onTopicSelect,
  onUnfavorite,
}: FavoriteTopicsProps) {
  return (
    <Card>
      <CardTitle>
        <div className="flex items-center gap-2">
          <Star size={20} className="text-yellow-400" fill="#facc15" />
          Favorites ({topics.length})
        </div>
      </CardTitle>

      {topics.length === 0 ? (
        <p className="text-slate-400 text-center py-8">
          No favorites yet. Star a topic from the sidebar to see it here.
        </p>
      ) : (
        <div className="!space-y-3 md:!space-y-4">
          {topics.map((topic) => (
            <div
              key={topic.id}
              className="bg-slate-800/80 backdrop-blur-sm !p-5 rounded-xl border-l-4 border-yellow-500"
            >
              <div className="flex items-start justify-between gap-2 !mb-2">
                <div>
                  <h3 className="text-base font-semibold text-slate-100">
                    {topic.name}
                  </h3>
                  {topic.description && (
                    <p className="text-sm text-slate-400 !mt-1 line-clamp-2">
                      {topic.description}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => onUnfavorite(topic.id)}
                  className="!p-1 text-yellow-400 hover:text-slate-400 transition-colors shrink-0"
                  title="Remove from favorites"
                >
                  <Star size={16} fill="#facc15" />
                </button>
              </div>

              <div className="flex items-center justify-between !mt-3 text-xs text-slate-500">
                <div className="flex items-center gap-3">
                  {(topic.notesCount ?? 0) > 0 && (
                    <span className="flex items-center gap-1">
                      <FileText size={11} /> {topic.notesCount}
                    </span>
                  )}
                  {(topic.flashcardsCount ?? 0) > 0 && (
                    <span className="flex items-center gap-1">
                      <Layers size={11} /> {topic.flashcardsCount}
                    </span>
                  )}
                  {(topic.quizzesCount ?? 0) > 0 && (
                    <span className="flex items-center gap-1">
                      <HelpCircle size={11} /> {topic.quizzesCount}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => onTopicSelect(topic.slug || topic.id)}
                  className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors font-medium"
                >
                  <BookOpen size={16} />
                  Open
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
