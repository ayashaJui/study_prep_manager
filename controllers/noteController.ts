import Note from "@/models/Note";
import Topic from "@/models/Topic";
import mongoose from "mongoose";

export const noteController = {
  // Get all notes for a topic
  async getNotesByTopic(topicId: string, userId: string) {
    if (!mongoose.Types.ObjectId.isValid(topicId)) {
      throw new Error("Invalid topic ID");
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error("Invalid user ID");
    }

    const notes = await Note.find({ topicId, userId }).sort({ createdAt: -1 });
    return notes;
  },

  // Get a single note by ID
  async getNoteById(id: string, userId: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid note ID");
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error("Invalid user ID");
    }

    const note = await Note.findOne({ _id: id, userId });
    if (!note) {
      throw new Error("Note not found");
    }

    return note;
  },

  // Create a new note
  async createNote(data: {
    topicId: string;
    content: string;
    title?: string;
    tags?: string[];
  }) {
    const { topicId, content, title, tags } = data;

    // Validation
    if (!content || content.trim().length === 0) {
      throw new Error("Note content is required");
    }

    if (!topicId || !mongoose.Types.ObjectId.isValid(topicId)) {
      throw new Error("Invalid topic ID");
    }

    // Verify topic exists
    const topic = await Topic.findById(topicId);
    if (!topic) {
      throw new Error("Topic not found");
    }

    // Create note
    const note = await Note.create({
      topicId,
      content: content.trim(),
      title: title?.trim(),
      tags: tags || [],
    });

    // Update topic stats
    await Topic.findByIdAndUpdate(topicId, {
      $inc: { "stats.notesCount": 1 },
    });

    return note;
  },

  // Update a note
  async updateNote(
    id: string,
    data: {
      content?: string;
      title?: string;
      tags?: string[];
    },
    userId: string,
  ) {
    if (!id) {
      throw new Error("Note ID is required");
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid note ID");
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error("Invalid user ID");
    }

    const note = await Note.findOneAndUpdate(
      { _id: id, userId },
      { $set: data },
      { new: true, runValidators: true },
    );

    if (!note) {
      throw new Error("Note not found");
    }

    return note;
  },

  // Delete a note
  async deleteNote(id: string, userId: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid note ID");
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error("Invalid user ID");
    }

    const note = await Note.findOneAndDelete({ _id: id, userId });
    if (!note) {
      throw new Error("Note not found");
    }

    // Update topic stats
    await Topic.findByIdAndUpdate(note.topicId, {
      $inc: { "stats.notesCount": -1 },
    });

    return note;
  },
};
