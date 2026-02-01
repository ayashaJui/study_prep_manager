import { Edit2, Trash2, BookOpen } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Note {
  id: string;
  content: string;
  date: string;
}

interface NoteListProps {
  notes: Note[];
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onReadMore?: (id: string) => void;
}

export default function NoteList({
  notes,
  onEdit,
  onDelete,
  onReadMore,
}: NoteListProps) {
  return (
    <div className="!space-y-3 md:!space-y-4">
      {notes.map((note) => {
        // Truncate content for preview (first 300 characters)
        const content = note.content || "";
        const preview =
          content.length > 300 ? content.substring(0, 300) + "..." : content;
        const showReadMore = content.length > 300;

        return (
          <div
            key={note.id}
            className="bg-slate-800/80 backdrop-blur-sm !p-5 rounded-xl border-l-4 border-purple-500 hover:shadow-lg hover:shadow-purple-500/10 transition-all"
          >
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
              <span>Added on {note.date}</span>
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
