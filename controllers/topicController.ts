import Topic from "@/models/Topic";
import mongoose from "mongoose";

export const topicController = {
  // Get all topics or filter by parentId
  async getAllTopics(parentId?: string | null) {
    const query: any = {};

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
  async getTopicById(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid topic ID");
    }

    const topic = await Topic.findById(id);
    if (!topic) {
      throw new Error("Topic not found");
    }

    return topic;
  },

  // Get a single topic by slug
  async getTopicBySlug(slug: string, parentId?: string | null) {
    if (!slug || slug.trim().length === 0) {
      throw new Error("Slug is required");
    }

    const query: any = { slug: slug.trim().toLowerCase() };
    
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
  }) {
    const { name, description, parentId, level, path, status, tags, favorite } =
      data;

    // Validation
    if (!name || name.trim().length === 0) {
      throw new Error("Topic name is required");
    }

    // Validate parentId if provided
    if (parentId) {
      if (!mongoose.Types.ObjectId.isValid(parentId)) {
        throw new Error("Invalid parent topic ID");
      }

      const parentTopic = await Topic.findById(parentId);
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
  ) {
    if (!id) {
      throw new Error("Topic ID is required");
    }
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid topic ID");
    }

    const topic = await Topic.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true },
    );

    if (!topic) {
      throw new Error("Topic not found");
    }

    return topic;
  },

  // Delete a topic
  async deleteTopic(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid topic ID");
    }

    // Check if topic has children
    const hasChildren = await Topic.findOne({ parentId: id });
    if (hasChildren) {
      throw new Error(
        "Cannot delete topic with subtopics. Delete subtopics first.",
      );
    }

    const topic = await Topic.findByIdAndDelete(id);
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
