import {
  Injectable, BadRequestException, NotFoundException, ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import mongoose from 'mongoose';
import * as crypto from 'crypto';
import { ITopicDocument, TOPIC_MODEL } from '../common/schemas/topic.schema';
import { INoteDocument, NOTE_MODEL } from '../common/schemas/note.schema';
import { IFlashcardDocument, FLASHCARD_MODEL } from '../common/schemas/flashcard.schema';
import { IQuizDocument, QUIZ_MODEL } from '../common/schemas/quiz.schema';

@Injectable()
export class TopicsService {
  constructor(
    @InjectModel(TOPIC_MODEL) private topicModel: Model<ITopicDocument>,
    @InjectModel(NOTE_MODEL) private noteModel: Model<INoteDocument>,
    @InjectModel(FLASHCARD_MODEL) private flashcardModel: Model<IFlashcardDocument>,
    @InjectModel(QUIZ_MODEL) private quizModel: Model<IQuizDocument>,
  ) {}

  async getAll(userId: string, parentId?: string, favorite?: boolean) {
    const query: any = {};
    if (mongoose.Types.ObjectId.isValid(userId)) query.userId = new mongoose.Types.ObjectId(userId);

    if (parentId) {
      if (parentId === 'null' || parentId === 'root') {
        query.parentId = null;
      } else if (mongoose.Types.ObjectId.isValid(parentId)) {
        query.parentId = parentId;
      } else {
        const parent = await this.topicModel.findOne({ slug: parentId, userId: query.userId }).select('_id').lean();
        if (!parent) return [];
        query.parentId = parent._id.toString();
      }
    }

    if (favorite === true) query.favorite = true;
    return this.topicModel.find(query).sort({ createdAt: -1 });
  }

  async getById(id: string, userId: string) {
    const userObjId = new mongoose.Types.ObjectId(userId);
    let topic: ITopicDocument | null;

    if (mongoose.Types.ObjectId.isValid(id)) {
      topic = await this.topicModel.findOne({ _id: id, userId: userObjId });
    } else {
      topic = await this.topicModel.findOne({ slug: id, userId: userObjId });
    }

    if (!topic) throw new NotFoundException('Topic not found');
    return topic;
  }

  async getBySlug(slug: string, userId: string, parentId?: string) {
    if (!slug?.trim()) throw new BadRequestException('Slug is required');
    const query: any = { slug: slug.trim().toLowerCase(), userId: new mongoose.Types.ObjectId(userId) };
    if (parentId) {
      query.parentId = (parentId === 'null' || parentId === 'root') ? null : parentId;
    }
    const topic = await this.topicModel.findOne(query);
    if (!topic) throw new NotFoundException('Topic not found');
    return topic;
  }

  async create(data: {
    name: string; description?: string; parentId?: string;
    level?: number; path?: string[]; status?: string;
    tags?: string[]; favorite?: boolean; userId: string;
  }) {
    if (!data.name?.trim()) throw new BadRequestException('Topic name is required');

    if (data.parentId) {
      if (!mongoose.Types.ObjectId.isValid(data.parentId)) throw new BadRequestException('Invalid parent topic ID');
      const parent = await this.topicModel.findOne({ _id: data.parentId, userId: data.userId });
      if (!parent) throw new NotFoundException('Parent topic not found');
    }

    const topic = new this.topicModel({
      name: data.name.trim(),
      description: data.description?.trim(),
      parentId: data.parentId || null,
      level: data.level ?? 0,
      path: data.path || [],
      status: data.status || 'not-started',
      tags: data.tags || [],
      favorite: data.favorite ?? false,
      userId: data.userId,
      stats: { notesCount: 0, flashcardsCount: 0, quizzesCount: 0, completionPercentage: 0 },
    });

    for (let attempt = 1; ; attempt++) {
      try {
        await topic.save();
        break;
      } catch (err: any) {
        if (err.code === 11000 && err.keyPattern?.slug && attempt < 5) {
          topic.slug = undefined;
          topic.markModified('slug');
        } else throw err;
      }
    }
    return topic;
  }

  async update(id: string, userId: string, data: {
    name?: string; description?: string; status?: string;
    tags?: string[]; favorite?: boolean;
  }) {
    if (!mongoose.Types.ObjectId.isValid(id)) throw new BadRequestException('Invalid topic ID');

    const topic = await this.topicModel.findOneAndUpdate(
      { _id: id, userId },
      { $set: data },
      { new: true, runValidators: true },
    );
    if (!topic) throw new NotFoundException('Topic not found');

    if (data.status && topic.parentId) {
      const siblings = await this.topicModel.find({ parentId: topic.parentId, userId }).select('status').lean();
      const mastered = siblings.filter((s) => s.status === 'mastered').length;
      const pct = siblings.length > 0 ? Math.round((mastered / siblings.length) * 100) : 0;
      await this.topicModel.findByIdAndUpdate(topic.parentId, { 'stats.completionPercentage': pct });
    }
    return topic;
  }

  async delete(id: string, userId: string, recursive?: boolean) {
    if (!mongoose.Types.ObjectId.isValid(id)) throw new BadRequestException('Invalid topic ID');

    if (recursive) {
      const topicObjId = new mongoose.Types.ObjectId(id);
      const userObjId = new mongoose.Types.ObjectId(userId);
      const topic = await this.topicModel.findOne({ _id: topicObjId, userId: userObjId });
      if (!topic) throw new NotFoundException('Topic not found');

      const descendants = await this.topicModel.find({ path: topicObjId, userId: userObjId }).select('_id').lean();
      const allIds = [topicObjId, ...descendants.map((d) => d._id)];
      await this.noteModel.deleteMany({ topicId: { $in: allIds } });
      await this.flashcardModel.deleteMany({ topicId: { $in: allIds } });
      await this.quizModel.deleteMany({ topicId: { $in: allIds } });
      await this.topicModel.deleteMany({ path: topicObjId, userId: userObjId });
      await this.topicModel.findOneAndDelete({ _id: topicObjId, userId: userObjId });
      return topic;
    }

    const hasChildren = await this.topicModel.findOne({ parentId: id, userId });
    if (hasChildren) throw new ConflictException('Cannot delete topic with subtopics. Delete subtopics first or use recursive delete.');

    const topic = await this.topicModel.findOneAndDelete({ _id: id, userId });
    if (!topic) throw new NotFoundException('Topic not found');
    return topic;
  }

  async publish(id: string, userId: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) throw new BadRequestException('Invalid topic ID');
    const shareId = crypto.randomBytes(8).toString('hex');
    const topic = await this.topicModel.findOneAndUpdate(
      { _id: id, userId },
      { $set: { isPublic: true, shareId } },
      { new: true },
    );
    if (!topic) throw new NotFoundException('Topic not found');
    const appUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    return { shareId: topic.shareId, publicUrl: `${appUrl}/public/${topic.shareId}` };
  }

  async unpublish(id: string, userId: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) throw new BadRequestException('Invalid topic ID');
    const topic = await this.topicModel.findOneAndUpdate(
      { _id: id, userId },
      { $set: { isPublic: false, shareId: null } },
      { new: true },
    );
    if (!topic) throw new NotFoundException('Topic not found');
    return null;
  }
}
