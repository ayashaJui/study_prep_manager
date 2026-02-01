"use client";

import { X, Calendar, ArrowLeft, Edit2 } from "lucide-react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Button from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Textarea } from "@/components/ui/Input";

interface NoteArticleProps {
  note: {
    id: string;
    content: string;
    date: string;
  };
  onClose: () => void;
  onSave?: (id: string, content: string) => void;
}

export default function NoteArticle({
  note,
  onClose,
  onSave,
}: NoteArticleProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(note.content || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!onSave) return;

    setSaving(true);
    try {
      await onSave(note.id, editedContent);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to save note:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedContent(note.content || "");
    setIsEditing(false);
  };

  return (
    <Card>
      <div className="overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between !mb-6 !pb-4 border-b border-slate-700/50">
          <Button variant="secondary" onClick={onClose} className="!px-3 !py-2">
            <ArrowLeft size={18} />
            Back to Notes
          </Button>
          <div className="flex items-center gap-3">
            {!isEditing && onSave && (
              <Button
                onClick={() => setIsEditing(true)}
                className="!px-3 !py-2"
              >
                <Edit2 size={16} />
                Edit Note
              </Button>
            )}
            {isEditing && (
              <>
                <Button
                  variant="secondary"
                  onClick={handleCancel}
                  className="!px-3 !py-2"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="!px-3 !py-2"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </>
            )}
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Calendar size={16} />
              <span>{note.date}</span>
            </div>
            <button
              onClick={onClose}
              className="!p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-800"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Article Content */}
        <article className="!pb-8">
          {isEditing ? (
            <Textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              rows={20}
              className="!p-4 font-mono text-sm"
              placeholder="Write your note in Markdown..."
            />
          ) : (
            <div
              className="prose prose-slate dark:prose-invert max-w-none"
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
                  padding-left: 1.75rem !important;
                  margin: 1.25rem 0 !important;
                }
                div :global(ol) {
                  list-style-type: decimal !important;
                  padding-left: 1.75rem !important;
                  margin: 1.25rem 0 !important;
                }
                div :global(li) {
                  display: list-item !important;
                  margin: 0.375rem 0 !important;
                  line-height: 1.8 !important;
                }
                div :global(p) {
                  margin: 1.25rem 0 !important;
                  line-height: 1.8 !important;
                }
                div :global(h1) {
                  margin-top: 2rem !important;
                  margin-bottom: 1rem !important;
                  line-height: 1.3 !important;
                }
                div :global(h2) {
                  margin-top: 1.75rem !important;
                  margin-bottom: 0.875rem !important;
                  line-height: 1.3 !important;
                }
                div :global(h3) {
                  margin-top: 1.5rem !important;
                  margin-bottom: 0.75rem !important;
                  line-height: 1.3 !important;
                }
                div :global(code) {
                  font-size: 0.9em !important;
                  padding: 0.2em 0.4em !important;
                  border-radius: 0.25rem !important;
                }
                div :global(pre) {
                  margin: 1.5rem 0 !important;
                  padding: 1rem !important;
                  line-height: 1.6 !important;
                }
                div :global(blockquote) {
                  margin: 1.5rem 0 !important;
                  padding: 1rem !important;
                }
                div :global(table) {
                  margin: 1.5rem 0 !important;
                }
              `}</style>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {note.content || ""}
              </ReactMarkdown>
            </div>
          )}
        </article>
      </div>
    </Card>
  );
}
