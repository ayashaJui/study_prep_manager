import Topic from "@/models/Topic";
import mongoose from "mongoose";
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from "@/lib/errorHandler";

export const topicController = {
  // Get all topics or filter by parentId
  async getAllTopics(parentId?: string | null, userId?: string, favorite?: boolean) {
    const query: {
      userId?: mongoose.Types.ObjectId;
      parentId?: string | null;
      favorite?: boolean;
    } = {};

    // Always filter by userId
    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      query.userId = new mongoose.Types.ObjectId(userId);
    }

    if (parentId) {
      if (parentId === "null" || parentId === "root") {
        query.parentId = null;
      } else if (mongoose.Types.ObjectId.isValid(parentId)) {
        query.parentId = parentId;
      } else {
        // parentId is a slug — resolve it to an ObjectId first
        const parent = await Topic.findOne({ slug: parentId, userId: query.userId }).select("_id").lean();
        if (!parent) return [];
        query.parentId = parent._id.toString();
      }
    }

    if (favorite === true) {
      query.favorite = true;
    }

    const topics = await Topic.find(query).sort({ createdAt: -1 });
    return topics;
  },

  // Get a single topic by ID or slug
  async getTopicById(id: string, userId: string) {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new BadRequestError("Invalid user ID");
    }

    const userObjId = new mongoose.Types.ObjectId(userId);

    let topic;
    if (mongoose.Types.ObjectId.isValid(id)) {
      topic = await Topic.findOne({ _id: id, userId: userObjId });
    } else {
      // Treat as slug
      topic = await Topic.findOne({ slug: id, userId: userObjId });
    }

    if (!topic) {
      throw new NotFoundError("Topic not found");
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
      throw new BadRequestError("Slug is required");
    }

    const query: {
      slug: string;
      userId?: mongoose.Types.ObjectId;
      parentId?: string | null;
    } = { slug: slug.trim().toLowerCase() };

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
          throw new BadRequestError("Invalid parent topic ID");
        }
        query.parentId = parentId;
      }
    }

    const topic = await Topic.findOne(query);
    if (!topic) {
      throw new NotFoundError("Topic not found");
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
      throw new BadRequestError("Topic name is required");
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new BadRequestError("Invalid user ID");
    }

    // Validate parentId if provided
    if (parentId) {
      if (!mongoose.Types.ObjectId.isValid(parentId)) {
        throw new BadRequestError("Invalid parent topic ID");
      }

      const parentTopic = await Topic.findOne({ _id: parentId, userId });
      if (!parentTopic) {
        throw new NotFoundError("Parent topic not found");
      }
    }

    // Create topic. The slug pre-save hook's uniqueness check is only a
    // best-effort first guess (racy under concurrent requests); the unique
    // index on {userId, parentId, slug} is the real guard, so retry with a
    // freshly regenerated slug if it reports a collision.
    const topic = new Topic({
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

    const MAX_ATTEMPTS = 5;
    for (let attempt = 1; ; attempt++) {
      try {
        await topic.save();
        break;
      } catch (err) {
        const isDuplicateSlug =
          (err as { code?: number; keyPattern?: Record<string, unknown> })
            .code === 11000 &&
          "slug" in
            ((err as { keyPattern?: Record<string, unknown> }).keyPattern ||
              {});
        if (!isDuplicateSlug || attempt >= MAX_ATTEMPTS) {
          throw err;
        }
        topic.slug = undefined;
        topic.markModified("slug");
      }
    }

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
      throw new BadRequestError("Topic ID is required");
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestError("Invalid topic ID");
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new BadRequestError("Invalid user ID");
    }

    const topic = await Topic.findOneAndUpdate(
      { _id: id, userId },
      { $set: data },
      { new: true, runValidators: true },
    );

    if (!topic) {
      throw new NotFoundError("Topic not found");
    }

    return topic;
  },

  // Delete a topic
  async deleteTopic(id: string, userId: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestError("Invalid topic ID");
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new BadRequestError("Invalid user ID");
    }

    // Check if topic has children
    const hasChildren = await Topic.findOne({ parentId: id, userId });
    if (hasChildren) {
      throw new ConflictError(
        "Cannot delete topic with subtopics. Delete subtopics first.",
      );
    }

    const topic = await Topic.findOneAndDelete({ _id: id, userId });
    if (!topic) {
      throw new NotFoundError("Topic not found");
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
      throw new BadRequestError("Invalid topic ID");
    }

    const topic = await Topic.findByIdAndUpdate(
      topicId,
      { $set: { stats } },
      { new: true },
    );

    if (!topic) {
      throw new NotFoundError("Topic not found");
    }

    return topic;
  },
};
