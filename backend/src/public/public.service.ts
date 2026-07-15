import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ITopicDocument, TOPIC_MODEL } from '../common/schemas/topic.schema';
import { IUserDocument, USER_MODEL } from '../common/schemas/user.schema';

@Injectable()
export class PublicService {
  constructor(
    @InjectModel(TOPIC_MODEL) private topicModel: Model<ITopicDocument>,
    @InjectModel(USER_MODEL) private userModel: Model<IUserDocument>,
  ) {}

  async getPublicTopics(page = 1, limit = 20) {
    const cap = Math.min(50, Math.max(1, limit));
    const skip = (page - 1) * cap;
    const filter = { isPublic: true, shareId: { $exists: true, $ne: null } };

    const [topics, total] = await Promise.all([
      this.topicModel.find(filter).select('name description shareId stats tags createdAt userId').sort({ createdAt: -1 }).skip(skip).limit(cap).lean(),
      this.topicModel.countDocuments(filter),
    ]);

    const userIds = [...new Set(topics.map((t: any) => t.userId?.toString()).filter(Boolean))];
    const users = await this.userModel.find({ _id: { $in: userIds } }).select('name').lean();
    const userMap = Object.fromEntries(users.map((u: any) => [u._id.toString(), u.name]));

    const data = topics.map((t: any) => ({
      shareId: t.shareId,
      name: t.name,
      description: t.description || null,
      tags: t.tags || [],
      stats: { notesCount: t.stats?.notesCount || 0, flashcardsCount: t.stats?.flashcardsCount || 0, quizzesCount: t.stats?.quizzesCount || 0 },
      authorName: t.userId ? (userMap[t.userId.toString()] ?? null) : null,
      createdAt: t.createdAt,
    }));

    return { data, pagination: { page, limit: cap, total, pages: Math.ceil(total / cap) } };
  }

  async getPublicTopicByShareId(shareId: string) {
    const topic = await this.topicModel.findOne({ shareId, isPublic: true });
    if (!topic) throw new NotFoundException('Public topic not found');
    return topic;
  }
}
