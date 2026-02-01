"use client";

import { useState, useEffect } from "react";
import { Save } from "lucide-react";
import Button from "@/components/ui/Button";
import { Card, CardTitle, CardSection } from "@/components/ui/Card";
import { Textarea } from "@/components/ui/Input";
import NoteList from "@/components/features/NoteList";
import NoteArticle from "@/components/views/NoteArticle";
import Modal from "@/components/ui/Modal";
import { notesAPI } from "@/lib/api";
import { useToast } from "@/contexts/ToastContext";

interface Note {
  _id: string;
  content: string;
  title?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

interface TopicNotesProps {
  topicId: string;
  topicName: string;
}

export default function TopicNotes({ topicId, topicName }: TopicNotesProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNoteContent, setNewNoteContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{
    isOpen: boolean;
    noteId: string | null;
  }>({ isOpen: false, noteId: null });
  const { showSuccess, showError } = useToast();

  const selectedNote = Array.isArray(notes)
    ? notes.find((n) => n._id === selectedNoteId)
    : undefined;

  // Fetch notes on mount
  useEffect(() => {
    if (topicId) {
      fetchNotes();
    }
  }, [topicId]);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const data = await notesAPI.getAll(topicId);
      setNotes(Array.isArray(data) ? data : []);
    } catch (error: any) {
      showError(error.message || "Failed to load notes");
      setNotes([]);
    } finally {
      setLoading(false);
    }
  };

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
      });
      setNotes([newNote, ...notes]);
      setNewNoteContent("");
      showSuccess("Note added successfully");
    } catch (error: any) {
      showError(error.message || "Failed to add note");
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
    } catch (error: any) {
      showError(error.message || "Failed to delete note");
      setDeleteConfirmModal({ isOpen: false, noteId: null });
    }
  };

  const handleUpdateNote = async (id: string, content: string) => {
    try {
      const updatedNote = await notesAPI.update(id, { content });
      setNotes(notes.map((n) => (n._id === id ? updatedNote : n)));
      showSuccess("Note updated successfully");
    } catch (error: any) {
      showError(error.message || "Failed to update note");
      throw error;
    }
  };

  // If a note is selected, show only the article view
  if (selectedNote) {
    return (
      <NoteArticle
        note={{
          id: selectedNote._id,
          content: selectedNote.content,
          date: new Date(selectedNote.createdAt).toLocaleDateString(),
        }}
        onClose={() => setSelectedNoteId(null)}
        onSave={handleUpdateNote}
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
          placeholder="Write your note here... (Supports Markdown)"
          className="!p-2"
          value={newNoteContent}
          onChange={(e) => setNewNoteContent(e.target.value)}
          disabled={saving}
        />
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

      <CardSection title={`All Notes (${notes.length})`}>
        <NoteList
          notes={notes.map((note) => ({
            id: note._id || "",
            content: note.content || "",
            date: note.createdAt
              ? new Date(note.createdAt).toLocaleDateString()
              : new Date().toLocaleDateString(),
          }))}
          onDelete={handleDeleteNote}
          onReadMore={(id) => {
            setSelectedNoteId(id);
          }}
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
