import { Edit2, Trash2, BookOpen, Clock, Pin, PinOff } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  deriveNoteTitle,
  estimateReadingMinutes,
  stripLeadingHeading,
} from "@/lib/noteUtils";
import Badge from "@/components/ui/Badge";

interface Note {
  id: string;
  content: string;
  date: string;
  editedDate?: string;
  tags?: string[];
  pinned?: boolean;
}

interface NoteListProps {
  notes: Note[];
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onReadMore?: (id: string) => void;
  onTogglePin?: (id: string, pinned: boolean) => void;
}

export default function NoteList({
  notes,
  onEdit,
  onDelete,
  onReadMore,
  onTogglePin,
}: NoteListProps) {
  return (
    <div className="!space-y-3 md:!space-y-4">
      {notes.map((note) => {
        const content = note.content || "";
        const title = deriveNoteTitle(content);
        const body = stripLeadingHeading(content);
        // Truncate content for preview (first 300 characters)
        const preview =
          body.length > 300 ? body.substring(0, 300) + "..." : body;
        const readingMinutes = estimateReadingMinutes(content);

        return (
          <div
            key={note.id}
            className={`bg-slate-800/80 backdrop-blur-sm !p-5 rounded-xl border-l-4 hover:shadow-lg hover:shadow-purple-500/10 transition-all ${
              note.pinned ? "border-yellow-500" : "border-purple-500"
            }`}
          >
            <div className="flex items-start justify-between gap-2 !mb-2">
              <h3 className="text-base font-semibold text-slate-100">
                {title}
              </h3>
              {onTogglePin && (
                <button
                  onClick={() => onTogglePin(note.id, !note.pinned)}
                  className={`!p-1 shrink-0 transition-colors ${
                    note.pinned
                      ? "text-yellow-400 hover:text-yellow-300"
                      : "text-slate-400 hover:text-yellow-400"
                  }`}
                  aria-label={note.pinned ? "Unpin note" : "Pin note"}
                >
                  {note.pinned ? <Pin size={16} /> : <PinOff size={16} />}
                </button>
              )}
            </div>
            <div
              className="prose prose-slate dark:prose-invert prose-sm max-w-none"
              style={
                {
                  "--tw-prose-bullets": "#a78bfa",
                  "--tw-prose-counters": "#a78bfa",
                } as React.CSSProperties
              }
            >
              <style jsx>{`
                div :global(ul) {
                  list-style-type: disc !important;
                  padding-left: 1.5rem !important;
                  margin: 0.75rem 0 !important;
                }
                div :global(ol) {
                  list-style-type: decimal !important;
                  padding-left: 1.5rem !important;
                  margin: 0.75rem 0 !important;
                }
                div :global(li) {
                  display: list-item !important;
                  margin: 0.25rem 0 !important;
                  line-height: 1.6 !important;
                  font-size: 0.8125rem !important;
                }
                div :global(p) {
                  margin: 0.75rem 0 !important;
                  line-height: 1.6 !important;
                }
              `}</style>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {preview}
              </ReactMarkdown>
            </div>

            {!!note.tags?.length && (
              <div className="flex flex-wrap gap-2 !mt-3">
                {note.tags.map((tag) => (
                  <Badge key={tag} className="!bg-slate-700/60">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {onReadMore && (
              <button
                onClick={() => onReadMore(note.id)}
                className="flex items-center gap-2 !mt-3 text-sm text-purple-400 hover:text-purple-300 transition-colors font-medium"
              >
                <BookOpen size={16} />
                Read More
              </button>
            )}

            <div className="flex justify-between items-center !mt-3 text-xs text-slate-500">
              <div className="flex items-center gap-3">
                <span>
                  {note.editedDate
                    ? `Edited on ${note.editedDate}`
                    : `Added on ${note.date}`}
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={12} />
                  {readingMinutes} min read
                </span>
              </div>
              <div className="flex gap-2">
                {onEdit && (
                  <button
                    onClick={() => onEdit(note.id)}
                    className="!p-1 text-slate-400 hover:text-purple-600 transition-colors"
                  >
                    <Edit2 size={16} />
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => onDelete(note.id)}
                    className="!p-1 text-slate-400 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}