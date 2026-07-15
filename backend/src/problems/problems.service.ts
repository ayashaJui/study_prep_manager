import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import mongoose from 'mongoose';
import { IProblemDocument, PROBLEM_MODEL } from '../common/schemas/problem.schema';

const REVIEW_INTERVALS: Record<string, number> = { easy: 7, medium: 3, hard: 1, again: 0 };

@Injectable()
export class ProblemsService {
  constructor(@InjectModel(PROBLEM_MODEL) private problemModel: Model<IProblemDocument>) {}

  async getAll(userId: string, filters: { topicId?: string; status?: string; difficulty?: string; platform?: string; tag?: string; due?: boolean }) {
    const query: any = { userId: new mongoose.Types.ObjectId(userId) };
    if (filters.topicId && mongoose.Types.ObjectId.isValid(filters.topicId)) query.topicId = new mongoose.Types.ObjectId(filters.topicId);
    if (filters.status) query.status = filters.status;
    if (filters.difficulty) query.difficulty = filters.difficulty;
    if (filters.platform) query.platform = { $regex: filters.platform, $options: 'i' };
    if (filters.tag) query.tags = filters.tag;
    if (filters.due) {
      query.status = { $in: ['solved', 'attempted'] };
      query.nextReview = { $lte: new Date() };
    }
    return this.problemModel.find(query).sort({ createdAt: -1 });
  }

  async getById(id: string, userId: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) throw new BadRequestException('Invalid problem ID');
    const problem = await this.problemModel.findOne({ _id: id, userId });
    if (!problem) throw new NotFoundException('Problem not found');
    return problem;
  }

  async create(userId: string, data: any) {
    const problem = new this.problemModel({
      ...data,
      userId: new mongoose.Types.ObjectId(userId),
      topicId: data.topicId && mongoose.Types.ObjectId.isValid(data.topicId) ? new mongoose.Types.ObjectId(data.topicId) : null,
      reviewCount: 0,
    });
    await problem.save();
    return problem;
  }

  async update(id: string, userId: string, data: any) {
    if (!mongoose.Types.ObjectId.isValid(id)) throw new BadRequestException('Invalid problem ID');
    if (data.topicId === '' || data.topicId === null) data.topicId = null;
    const problem = await this.problemModel.findOneAndUpdate({ _id: id, userId }, { $set: data }, { new: true, runValidators: true });
    if (!problem) throw new NotFoundException('Problem not found');
    return problem;
  }

  async delete(id: string, userId: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) throw new BadRequestException('Invalid problem ID');
    const problem = await this.problemModel.findOneAndDelete({ _id: id, userId });
    if (!problem) throw new NotFoundException('Problem not found');
    return null;
  }

  async review(id: string, userId: string, confidence: 'easy' | 'medium' | 'hard' | 'again') {
    if (!mongoose.Types.ObjectId.isValid(id)) throw new BadRequestException('Invalid problem ID');
    const intervalDays = REVIEW_INTERVALS[confidence] ?? 3;
    const nextReview = new Date();
    if (intervalDays > 0) nextReview.setDate(nextReview.getDate() + intervalDays);

    const problem = await this.problemModel.findOneAndUpdate(
      { _id: id, userId },
      { $set: { nextReview, reviewInterval: intervalDays, lastReviewedAt: new Date() }, $inc: { reviewCount: 1 } },
      { new: true },
    );
    if (!problem) throw new NotFoundException('Problem not found');
    return problem;
  }
}
