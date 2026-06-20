import Note from "@/models/Note";
import Topic from "@/models/Topic";
import mongoose from "mongoose";
import { BadRequestError, NotFoundError } from "@/lib/errorHandler";

export const noteController = {
  // Get all notes for a topic
  async getNotesByTopic(topicId: string, userId: string) {
    if (!mongoose.Types.ObjectId.isValid(topicId)) {
      throw new BadRequestError("Invalid topic ID");
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new BadRequestError("Invalid user ID");
    }

    const notes = await Note.find({ topicId, userId }).sort({
      pinned: -1,
      createdAt: -1,
    });
    return notes;
  },

  // Get a single note by ID
  async getNoteById(id: string, userId: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestError("Invalid note ID");
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new BadRequestError("Invalid user ID");
    }

    const note = await Note.findOne({ _id: id, userId });
    if (!note) {
      throw new NotFoundError("Note not found");
    }

    return note;
  },

  // Create a new note
  async createNote(data: {
    topicId: string;
    content: string;
    tags?: string[];
    userId?: string;
  }) {
    const { topicId, content, tags, userId } = data;

    // Validation
    if (!content || content.trim().length === 0) {
      throw new BadRequestError("Note content is required");
    }

    if (!topicId || !mongoose.Types.ObjectId.isValid(topicId)) {
      throw new BadRequestError("Invalid topic ID");
    }

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      throw new BadRequestError("Invalid user ID");
    }

    // Verify topic exists and belongs to this user
    const topic = await Topic.findOne({ _id: topicId, userId });
    if (!topic) {
      throw new NotFoundError("Topic not found");
    }

    // Create note
    const note = await Note.create({
      topicId,
      content: content.trim(),
      tags: tags || [],
      userId,
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
      tags?: string[];
      pinned?: boolean;
    },
    userId: string,
  ) {
    if (!id) {
      throw new BadRequestError("Note ID is required");
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestError("Invalid note ID");
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new BadRequestError("Invalid user ID");
    }

    const note = await Note.findOneAndUpdate(
      { _id: id, userId },
      { $set: data },
      { new: true, runValidators: true },
    );

    if (!note) {
      throw new NotFoundError("Note not found");
    }

    return note;
  },

  // Delete a note
  async deleteNote(id: string, userId: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestError("Invalid note ID");
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new BadRequestError("Invalid user ID");
    }

    const note = await Note.findOneAndDelete({ _id: id, userId });
    if (!note) {
      throw new NotFoundError("Note not found");
    }

    // Update topic stats
    await Topic.findByIdAndUpdate(note.topicId, {
      $inc: { "stats.notesCount": -1 },
    });

    return note;
  },
};
