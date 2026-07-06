import Problem from "@/models/Problem";
import mongoose from "mongoose";
import { BadRequestError, NotFoundError } from "@/lib/errorHandler";

const REVIEW_INTERVALS: Record<string, number> = {
  easy: 7,
  medium: 3,
  hard: 1,
  again: 0,
};

export const problemController = {
  async getProblems(
    userId: string,
    filters: {
      topicId?: string;
      status?: string;
      difficulty?: string;
      platform?: string;
      tag?: string;
      due?: boolean;
    } = {},
  ) {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new BadRequestError("Invalid user ID");
    }

    const query: Record<string, unknown> = {
      userId: new mongoose.Types.ObjectId(userId),
    };

    if (filters.topicId) {
      if (!mongoose.Types.ObjectId.isValid(filters.topicId)) {
        throw new BadRequestError("Invalid topic ID");
      }
      query.topicId = new mongoose.Types.ObjectId(filters.topicId);
    }

    if (filters.status) query.status = filters.status;
    if (filters.difficulty) query.difficulty = filters.difficulty;
    if (filters.platform) query.platform = { $regex: filters.platform, $options: "i" };
    if (filters.tag) query.tags = filters.tag;

    if (filters.due) {
      query.status = { $in: ["solved", "attempted"] };
      query.nextReview = { $lte: new Date() };
    }

    return Problem.find(query).sort({ createdAt: -1 });
  },

  async getProblemById(id: string, userId: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) throw new BadRequestError("Invalid problem ID");
    if (!mongoose.Types.ObjectId.isValid(userId)) throw new BadRequestError("Invalid user ID");

    const problem = await Problem.findOne({ _id: id, userId });
    if (!problem) throw new NotFoundError("Problem not found");
    return problem;
  },

  async createProblem(data: {
    userId: string;
    topicId?: string | null;
    title: string;
    platform: string;
    problemNumber?: string;
    url?: string;
    difficulty: string;
    status?: string;
    tags?: string[];
    notes?: string;
    timeComplexity?: string;
    spaceComplexity?: string;
    language?: string;
  }) {
    if (!mongoose.Types.ObjectId.isValid(data.userId)) {
      throw new BadRequestError("Invalid user ID");
    }

    const problem = new Problem({
      ...data,
      userId: new mongoose.Types.ObjectId(data.userId),
      topicId:
        data.topicId && mongoose.Types.ObjectId.isValid(data.topicId)
          ? new mongoose.Types.ObjectId(data.topicId)
          : null,
      reviewCount: 0,
    });

    await problem.save();
    return problem;
  },

  async updateProblem(id: string, userId: string, data: Record<string, unknown>) {
    if (!mongoose.Types.ObjectId.isValid(id)) throw new BadRequestError("Invalid problem ID");
    if (!mongoose.Types.ObjectId.isValid(userId)) throw new BadRequestError("Invalid user ID");

    if (data.topicId && typeof data.topicId === "string" && !mongoose.Types.ObjectId.isValid(data.topicId)) {
      throw new BadRequestError("Invalid topic ID");
    }

    if (data.topicId === "" || data.topicId === null) {
      data.topicId = null;
    }

    const problem = await Problem.findOneAndUpdate(
      { _id: id, userId },
      { $set: data },
      { new: true, runValidators: true },
    );
    if (!problem) throw new NotFoundError("Problem not found");
    return problem;
  },

  async deleteProblem(id: string, userId: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) throw new BadRequestError("Invalid problem ID");
    if (!mongoose.Types.ObjectId.isValid(userId)) throw new BadRequestError("Invalid user ID");

    const problem = await Problem.findOneAndDelete({ _id: id, userId });
    if (!problem) throw new NotFoundError("Problem not found");
    return problem;
  },

  async reviewProblem(
    id: string,
    userId: string,
    confidence: "easy" | "medium" | "hard" | "again",
  ) {
    if (!mongoose.Types.ObjectId.isValid(id)) throw new BadRequestError("Invalid problem ID");
    if (!mongoose.Types.ObjectId.isValid(userId)) throw new BadRequestError("Invalid user ID");

    const intervalDays = REVIEW_INTERVALS[confidence] ?? 3;
    const nextReview = new Date();
    if (intervalDays > 0) {
      nextReview.setDate(nextReview.getDate() + intervalDays);
    }

    const problem = await Problem.findOneAndUpdate(
      { _id: id, userId },
      {
        $set: { nextReview, reviewInterval: intervalDays, lastReviewedAt: new Date() },
        $inc: { reviewCount: 1 },
      },
      { new: true },
    );
    if (!problem) throw new NotFoundError("Problem not found");
    return problem;
  },

  async getDueCount(userId: string) {
    if (!mongoose.Types.ObjectId.isValid(userId)) return 0;
    return Problem.countDocuments({
      userId,
      status: { $in: ["solved", "attempted"] },
      nextReview: { $lte: new Date() },
    });
  },
};
