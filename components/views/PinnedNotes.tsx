"use client";

import { useEffect, useState } from "react";
import { Pin, BookOpen, Clock } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { notesAPI, PinnedNote } from "@/lib/api";
import { useToast } from "@/contexts/ToastContext";
import {
  deriveNoteTitle,
  estimateReadingMinutes,
  stripLeadingHeading,
} from "@/lib/noteUtils";

interface PinnedNotesProps {
  onOpenNote: (topicId: string, noteId: string) => void;
}

export default function PinnedNotes({ onOpenNote }: PinnedNotesProps) {
  const [notes, setNotes] = useState<PinnedNote[]>([]);
  const [loading, setLoading] = useState(true);
  const { showError } = useToast();

  useEffect(() => {
    fetchPinned();
  }, []);

  const fetchPinned = async () => {
    try {
      setLoading(true);
      const data = await notesAPI.getPinned();
      setNotes(Array.isArray(data) ? data : []);
    } catch (error) {
      showError(
        error instanceof Error ? error.message : "Failed to load pinned notes",
      );
      setNotes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUnpin = async (id: string) => {
    try {
      await notesAPI.update(id, { pinned: false });
      setNotes((prev) => prev.filter((n) => n._id !== id));
    } catch (error) {
      showError(error instanceof Error ? error.message : "Failed to unpin note");
    }
  };

  if (loading) {
    return (
      <Card>
        <CardTitle>
          <div className="flex items-center gap-2">
            <Pin size={20} className="text-yellow-400" />
            Pinned Notes
          </div>
        </CardTitle>
        <div className="text-center py-8 text-slate-400">
          Loading pinned notes...
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <CardTitle>
        <div className="flex items-center gap-2">
          <Pin size={20} className="text-yellow-400" />
          Pinned Notes ({notes.length})
        </div>
      </CardTitle>

      {notes.length === 0 ? (
        <p className="text-slate-400 text-center py-8">
          No pinned notes yet. Pin a note from any topic to see it here.
        </p>
      ) : (
        <div className="!space-y-3 md:!space-y-4">
          {notes.map((note) => {
            const topic =
              typeof note.topicId === "object" ? note.topicId : null;
            const topicId = topic?._id ||
              (typeof note.topicId === "string" ? note.topicId : "");
            const title = deriveNoteTitle(note.content || "");
            const body = stripLeadingHeading(note.content || "");
            const preview =
              body.length > 200 ? `${body.slice(0, 200)}...` : body;
            const readingMinutes = estimateReadingMinutes(note.content || "");

            return (
              <div
                key={note._id}
                className="bg-slate-800/80 backdrop-blur-sm !p-5 rounded-xl border-l-4 border-yellow-500"
              >
                <div className="flex items-start justify-between gap-2 !mb-2">
                  <div>
                    <h3 className="text-base font-semibold text-slate-100">
                      {title}
                    </h3>
                    {topic?.name && (
                      <Badge className="!mt-2 !bg-slate-700/60">
                        {topic.name}
                      </Badge>
                    )}
                  </div>
                  <button
                    onClick={() => handleUnpin(note._id)}
                    className="!p-1 text-yellow-400 hover:text-yellow-300 transition-colors shrink-0"
                    aria-label="Unpin note"
                  >
                    <Pin size={16} />
                  </button>
                </div>
                <p className="text-sm text-slate-400 !mb-3">{preview}</p>
                <div className="flex justify-between items-center text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {readingMinutes} min read
                  </span>
                  <button
                    onClick={() => topicId && onOpenNote(topicId, note._id)}
                    disabled={!topicId}
                    className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors font-medium disabled:opacity-50"
                  >
                    <BookOpen size={16} />
                    Open
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
