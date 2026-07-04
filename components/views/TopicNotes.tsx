"use client";

import { useState, useEffect, useCallback } from "react";
import { Save } from "lucide-react";
import Button from "@/components/ui/Button";
import { Card, CardTitle, CardSection } from "@/components/ui/Card";
import { Textarea } from "@/components/ui/Input";
import NoteList from "@/components/features/NoteList";
import NoteArticle from "@/components/views/NoteArticle";
import Modal from "@/components/ui/Modal";
import Badge from "@/components/ui/Badge";
import { notesAPI } from "@/lib/api";
import { useToast } from "@/contexts/ToastContext";
import TagInput from "@/components/ui/TagInput";

interface Note {
  _id: string;
  content: string;
  tags: string[];
  pinned?: boolean;
  createdAt: string;
  updatedAt: string;
}

interface TopicNotesProps {
  topicId: string;
  topicName: string;
  initialNoteId?: string;
}

export default function TopicNotes({
  topicId,
  topicName,
  initialNoteId,
}: TopicNotesProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNoteContent, setNewNoteContent] = useState("");
  const [newNoteTags, setNewNoteTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{
    isOpen: boolean;
    noteId: string | null;
  }>({ isOpen: false, noteId: null });
  const { showSuccess, showError } = useToast();

  const selectedNote = Array.isArray(notes)
    ? notes.find((n) => n._id === selectedNoteId)
    : undefined;

  const allTags = Array.from(new Set(notes.flatMap((n) => n.tags || [])));

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const filteredNotes = notes
    .filter(
      (n) =>
        selectedTags.length === 0 ||
        selectedTags.every((t) => (n.tags || []).includes(t)),
    )
    .sort((a, b) => {
      if (Boolean(a.pinned) !== Boolean(b.pinned)) {
        return a.pinned ? -1 : 1;
      }
      return (
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    });

  const fetchNotes = useCallback(async () => {
    try {
      setLoading(true);
      const data = await notesAPI.getAll(topicId);
      setNotes(Array.isArray(data) ? data : []);
    } catch (error) {
      showError(error instanceof Error ? error.message : "Failed to load notes");
      setNotes([]);
    } finally {
      setLoading(false);
    }
  }, [topicId, showError]);

  useEffect(() => {
    if (topicId) {
      fetchNotes();
    }
  }, [topicId, fetchNotes]);

  useEffect(() => {
    if (initialNoteId) {
      setSelectedNoteId(initialNoteId);
    }
  }, [initialNoteId]);

  const handleAddNote = async () => {
    if (!newNoteContent.trim()) {
      showError("Note content cannot be empty");
      return;
    }

    try {
      setSaving(true);
      const newNote = await notesAPI.create({
        topicId,
        content: newNoteContent,
        tags: newNoteTags,
      });
      setNotes([newNote, ...notes]);
      setNewNoteContent("");
      setNewNoteTags([]);
      showSuccess("Note added successfully");
    } catch (error) {
      showError(error instanceof Error ? error.message : "Failed to add note");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteNote = (id: string) => {
    setDeleteConfirmModal({ isOpen: true, noteId: id });
  };

  const confirmDelete = async () => {
    if (!deleteConfirmModal.noteId) return;

    try {
      await notesAPI.delete(deleteConfirmModal.noteId);
      setNotes(notes.filter((n) => n._id !== deleteConfirmModal.noteId));
      showSuccess("Note deleted successfully");
      setDeleteConfirmModal({ isOpen: false, noteId: null });
    } catch (error) {
      showError(error instanceof Error ? error.message : "Failed to delete note");
      setDeleteConfirmModal({ isOpen: false, noteId: null });
    }
  };

  const handleUpdateNote = async (id: string, content: string) => {
    try {
      const updatedNote = await notesAPI.update(id, { content });
      setNotes(notes.map((n) => (n._id === id ? updatedNote : n)));
      showSuccess("Note updated successfully");
    } catch (error) {
      showError(error instanceof Error ? error.message : "Failed to update note");
      throw error;
    }
  };

  const handleTogglePin = async (id: string, pinned: boolean) => {
    try {
      const updatedNote = await notesAPI.update(id, { pinned });
      setNotes(notes.map((n) => (n._id === id ? updatedNote : n)));
    } catch (error) {
      showError(
        error instanceof Error ? error.message : "Failed to update note",
      );
    }
  };

  // If a note is selected, show only the article view
  if (selectedNote) {
    const wasEdited =
      new Date(selectedNote.updatedAt).getTime() >
      new Date(selectedNote.createdAt).getTime() + 60_000;

    return (
      <NoteArticle
        note={{
          id: selectedNote._id,
          content: selectedNote.content,
          date: new Date(selectedNote.createdAt).toLocaleDateString(),
          editedDate: wasEdited
            ? new Date(selectedNote.updatedAt).toLocaleDateString()
            : undefined,
          pinned: selectedNote.pinned,
        }}
        onClose={() => setSelectedNoteId(null)}
        onSave={handleUpdateNote}
        onTogglePin={handleTogglePin}
      />
    );
  }

  if (loading) {
    return (
      <Card>
        <CardTitle>General Notes - {topicName}</CardTitle>
        <div className="text-center py-8 text-slate-400">Loading notes...</div>
      </Card>
    );
  }

  return (
    <Card>
      <CardTitle>General Notes - {topicName}</CardTitle>

      <div className="!mb-6">
        <label className="block font-medium !mb-2 text-sm text-slate-300">
          Add a new note
        </label>
        <Textarea
          rows={5}
          placeholder="Write your note here... (Supports Markdown — start with a heading to give it a title)"
          className="!p-2"
          value={newNoteContent}
          onChange={(e) => setNewNoteContent(e.target.value)}
          disabled={saving}
        />
        <div className="!mt-3">
          <label className="block text-sm font-medium text-slate-300 !mb-2">
            Tags
          </label>
          <TagInput
            tags={newNoteTags}
            onChange={setNewNoteTags}
            suggestions={allTags}
            placeholder="Add tags (Enter or , to confirm)..."
          />
        </div>
        <div className="flex gap-4 !mt-4">
          <Button
            onClick={handleAddNote}
            disabled={saving || !newNoteContent.trim()}
          >
            <Save size={16} />
            {saving ? "Saving..." : "Add Note"}
          </Button>
        </div>
      </div>

      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2 !mb-6">
          {allTags.map((tag) => (
            <Badge
              key={tag}
              variant={selectedTags.includes(tag) ? "default" : undefined}
              className={
                selectedTags.includes(tag) ? "" : "!bg-slate-700/60"
              }
              onClick={() => toggleTag(tag)}
            >
              {tag}
            </Badge>
          ))}
        </div>
      )}

      <CardSection title={`All Notes (${filteredNotes.length})`}>
        <NoteList
          notes={filteredNotes.map((note) => {
            const wasEdited =
              new Date(note.updatedAt).getTime() >
              new Date(note.createdAt).getTime() + 60_000;
            return {
              id: note._id || "",
              content: note.content || "",
              date: note.createdAt
                ? new Date(note.createdAt).toLocaleDateString()
                : new Date().toLocaleDateString(),
              editedDate: wasEdited
                ? new Date(note.updatedAt).toLocaleDateString()
                : undefined,
              tags: note.tags,
              pinned: note.pinned,
            };
          })}
          onDelete={handleDeleteNote}
          onReadMore={(id) => {
            setSelectedNoteId(id);
          }}
          onTogglePin={handleTogglePin}
        />
      </CardSection>

      <Modal
        isOpen={deleteConfirmModal.isOpen}
        onClose={() => setDeleteConfirmModal({ isOpen: false, noteId: null })}
        title="Delete Note"
      >
        <div className="!p-6">
          <p className="text-slate-300 !mb-6">
            Are you sure you want to delete this note? This action cannot be
            undone.
          </p>
          <div className="flex gap-3 justify-end">
            <Button
              variant="secondary"
              onClick={() =>
                setDeleteConfirmModal({ isOpen: false, noteId: null })
              }
            >
              Cancel
            </Button>
            <Button
              onClick={confirmDelete}
              className="!bg-red-600 hover:!bg-red-700"
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </Card>
  );
}