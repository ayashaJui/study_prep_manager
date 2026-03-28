import Topic from "@/models/Topic";
import mongoose from "mongoose";

export const topicController = {
  // Get all topics or filter by parentId
  async getAllTopics(parentId?: string | null, userId?: string) {
    const query: any = {};

    // Always filter by userId
    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      query.userId = new mongoose.Types.ObjectId(userId);
    }

    if (parentId) {
      if (parentId === "null" || parentId === "root") {
        query.parentId = null;
      } else {
        query.parentId = parentId;
      }
    }

    const topics = await Topic.find(query).sort({ createdAt: -1 });
    return topics;
  },

  // Get a single topic by ID
  async getTopicById(id: string, userId: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid topic ID");
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error("Invalid user ID");
    }

    const topic = await Topic.findOne({ _id: id, userId });
    if (!topic) {
      throw new Error("Topic not found");
    }

    return topic;
  },

  // Get a single topic by slug
  async getTopicBySlug(
    slug: string,
    parentId?: string | null,
    userId?: string,
  ) {
    if (!slug || slug.trim().length === 0) {
      throw new Error("Slug is required");
    }

    const query: any = { slug: slug.trim().toLowerCase() };

    // Always filter by userId if provided
    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      query.userId = new mongoose.Types.ObjectId(userId);
    }

    // If parentId provided, scope search to that parent
    if (parentId) {
      if (parentId === "null" || parentId === "root") {
        query.parentId = null;
      } else {
        if (!mongoose.Types.ObjectId.isValid(parentId)) {
          throw new Error("Invalid parent topic ID");
        }
        query.parentId = parentId;
      }
    }

    const topic = await Topic.findOne(query);
    if (!topic) {
      throw new Error("Topic not found");
    }

    return topic;
  },

  // Create a new topic
  async createTopic(data: {
    name: string;
    description?: string;
    parentId?: string;
    level?: number;
    path?: string[];
    status?: string;
    tags?: string[];
    favorite?: boolean;
    userId: string;
  }) {
    const {
      name,
      description,
      parentId,
      level,
      path,
      status,
      tags,
      favorite,
      userId,
    } = data;

    // Validation
    if (!name || name.trim().length === 0) {
      throw new Error("Topic name is required");
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error("Invalid user ID");
    }

    // Validate parentId if provided
    if (parentId) {
      if (!mongoose.Types.ObjectId.isValid(parentId)) {
        throw new Error("Invalid parent topic ID");
      }

      const parentTopic = await Topic.findOne({ _id: parentId, userId });
      if (!parentTopic) {
        throw new Error("Parent topic not found");
      }
    }

    // Create topic
    const topic = await Topic.create({
      name: name.trim(),
      description: description?.trim(),
      parentId: parentId || null,
      level: level ?? 0,
      path: path || [],
      status: status || "not-started",
      tags: tags || [],
      favorite: favorite ?? false,
      userId,
      stats: {
        notesCount: 0,
        flashcardsCount: 0,
        quizzesCount: 0,
        completionPercentage: 0,
      },
    });

    return topic;
  },

  // Update a topic
  async updateTopic(
    id: string,
    data: {
      name?: string;
      description?: string;
      status?: string;
      tags?: string[];
      favorite?: boolean;
    },
    userId: string,
  ) {
    if (!id) {
      throw new Error("Topic ID is required");
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid topic ID");
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error("Invalid user ID");
    }

    const topic = await Topic.findOneAndUpdate(
      { _id: id, userId },
      { $set: data },
      { new: true, runValidators: true },
    );

    if (!topic) {
      throw new Error("Topic not found");
    }

    return topic;
  },

  // Delete a topic
  async deleteTopic(id: string, userId: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid topic ID");
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error("Invalid user ID");
    }

    // Check if topic has children
    const hasChildren = await Topic.findOne({ parentId: id, userId });
    if (hasChildren) {
      throw new Error(
        "Cannot delete topic with subtopics. Delete subtopics first.",
      );
    }

    const topic = await Topic.findOneAndDelete({ _id: id, userId });
    if (!topic) {
      throw new Error("Topic not found");
    }

    return topic;
  },

  // Update topic stats
  async updateTopicStats(
    topicId: string,
    stats: {
      notesCount?: number;
      flashcardsCount?: number;
      quizzesCount?: number;
      completionPercentage?: number;
    },
  ) {
    if (!mongoose.Types.ObjectId.isValid(topicId)) {
      throw new Error("Invalid topic ID");
    }

    const topic = await Topic.findByIdAndUpdate(
      topicId,
      { $set: { stats } },
      { new: true },
    );

    if (!topic) {
      throw new Error("Topic not found");
    }

    return topic;
  },
};
