"use client";

import {
  X,
  Calendar,
  Clock,
  ArrowLeft,
  Edit2,
  Image as ImageIcon,
  Pin,
  PinOff,
} from "lucide-react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Button from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Textarea } from "@/components/ui/Input";
import {
  deriveNoteTitle,
  estimateReadingMinutes,
  stripLeadingHeading,
} from "@/lib/noteUtils";

interface NoteArticleProps {
  note: {
    id: string;
    content: string;
    date: string;
    editedDate?: string;
    pinned?: boolean;
  };
  onClose: () => void;
  onSave?: (id: string, content: string) => void | Promise<void>;
  onTogglePin?: (id: string, pinned: boolean) => void;
}

export default function NoteArticle({
  note,
  onClose,
  onSave,
  onTogglePin,
}: NoteArticleProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(note.content || "");
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [showImageInsert, setShowImageInsert] = useState(false);
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
    setShowImageInsert(false);
    setIsEditing(false);
  };

  const insertImageMarkdown = (url: string) => {
    const markdown = `![](${url})`;
    setEditedContent((prev) =>
      prev.trim().length > 0 ? `${prev}\n\n${markdown}\n` : `${markdown}\n`,
    );
  };

  const handleInsertImageUrl = () => {
    if (!imageUrlInput.trim()) return;
    insertImageMarkdown(imageUrlInput.trim());
    setImageUrlInput("");
    setShowImageInsert(false);
  };

  const readingMinutes = estimateReadingMinutes(note.content || "");
  const title = deriveNoteTitle(note.content || "");
  const bodyContent = stripLeadingHeading(note.content || "");

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
            {!isEditing && onTogglePin && (
              <button
                onClick={() => onTogglePin(note.id, !note.pinned)}
                className={`!p-2 rounded-lg transition-colors ${
                  note.pinned
                    ? "text-yellow-400 hover:text-yellow-300 hover:bg-slate-800"
                    : "text-slate-400 hover:text-yellow-400 hover:bg-slate-800"
                }`}
                aria-label={note.pinned ? "Unpin note" : "Pin note"}
              >
                {note.pinned ? <Pin size={18} /> : <PinOff size={18} />}
              </button>
            )}
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
            {!isEditing && (
              <div className="flex items-center gap-3 text-sm text-slate-400">
                <span className="flex items-center gap-2">
                  <Calendar size={16} />
                  {note.editedDate ? `Edited ${note.editedDate}` : note.date}
                </span>
                <span className="flex items-center gap-2">
                  <Clock size={16} />
                  {readingMinutes} min read
                </span>
              </div>
            )}
            <button
              onClick={onClose}
              className="!p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-800"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {isEditing ? (
          <div className="!pb-4">
            <div className="!mb-2 flex items-center justify-between">
              <label className="block font-medium text-sm text-slate-200">
                Content (Markdown — start with a heading to give the note a
                title)
              </label>
              <Button
                type="button"
                variant="secondary"
                className="!px-2 !py-1 text-xs"
                onClick={() => setShowImageInsert((v) => !v)}
              >
                <ImageIcon size={14} />
                Insert image / GIF
              </Button>
            </div>

            {showImageInsert && (
              <div className="flex gap-3 !mb-3 !p-3 rounded-lg border border-slate-700/50 bg-slate-800/60">
                <input
                  type="text"
                  placeholder="Paste an image or GIF URL..."
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  className="flex-1 !px-3 !py-2 border rounded-lg text-sm bg-slate-700/50 text-slate-100 border-slate-600 placeholder:text-slate-400 focus:outline-none focus:border-purple-500"
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleInsertImageUrl}
                  disabled={!imageUrlInput.trim()}
                >
                  Insert
                </Button>
                {/* File upload deferred - no persistent/free storage backend wired up yet
                <input
                  ref={inlineFileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/gif,image/webp"
                  className="hidden"
                  onChange={handleInlineFileChange}
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => inlineFileInputRef.current?.click()}
                  disabled={uploadingInline}
                >
                  <Upload size={16} />
                  {uploadingInline ? "Uploading..." : "Upload file"}
                </Button>
                */}
              </div>
            )}

            <Textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              rows={20}
              className="!p-4 font-mono text-sm"
              placeholder="Write your note in Markdown..."
            />
          </div>
        ) : (
          <article className="!pb-8 max-w-2xl !mx-auto">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-100 !mb-6 leading-tight">
              {title}
            </h1>
            <div
              className="prose prose-slate dark:prose-invert lg:prose-lg max-w-none"
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
                div :global(img) {
                  border-radius: 0.75rem !important;
                  margin: 1.5rem 0 !important;
                }
              `}</style>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {bodyContent || ""}
              </ReactMarkdown>
            </div>
          </article>
        )}
      </div>
    </Card>
  );
}