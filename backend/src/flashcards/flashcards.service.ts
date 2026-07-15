import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import mongoose from 'mongoose';
import { IFlashcardDocument, FLASHCARD_MODEL } from '../common/schemas/flashcard.schema';
import { ITopicDocument, TOPIC_MODEL } from '../common/schemas/topic.schema';

@Injectable()
export class FlashcardsService {
  constructor(
    @InjectModel(FLASHCARD_MODEL) private flashcardModel: Model<IFlashcardDocument>,
    @InjectModel(TOPIC_MODEL) private topicModel: Model<ITopicDocument>,
  ) {}

  async getAll(userId: string, topicId?: string) {
    if (topicId) {
      if (!mongoose.Types.ObjectId.isValid(topicId)) throw new BadRequestException('Invalid topic ID');
      return this.flashcardModel.find({ userId, topicId }).sort({ createdAt: -1 });
    }
    return this.flashcardModel
      .find({ userId })
      .populate<{ topicId: { _id: mongoose.Types.ObjectId; name: string } | null }>('topicId', 'name')
      .sort({ nextReview: 1, createdAt: -1 });
  }

  async getById(id: string, userId: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) throw new BadRequestException('Invalid flashcard ID');
    const card = await this.flashcardModel.findOne({ _id: id, userId });
    if (!card) throw new NotFoundException('Flashcard not found');
    return card;
  }

  async create(userId: string, data: { topicId: string; front: string; back: string; tags?: string[]; difficulty?: string }) {
    if (!mongoose.Types.ObjectId.isValid(data.topicId)) throw new BadRequestException('Invalid topic ID');
    const topic = await this.topicModel.findOne({ _id: data.topicId, userId });
    if (!topic) throw new NotFoundException('Topic not found');

    const card = await this.flashcardModel.create({ ...data, userId } as any);
    await this.topicModel.findByIdAndUpdate(data.topicId, { $inc: { 'stats.flashcardsCount': 1 } });
    return card;
  }

  async update(id: string, userId: string, data: any) {
    if (!mongoose.Types.ObjectId.isValid(id)) throw new BadRequestException('Invalid flashcard ID');
    const card = await this.flashcardModel.findOneAndUpdate({ _id: id, userId }, data, { new: true, runValidators: true });
    if (!card) throw new NotFoundException('Flashcard not found');
    return card;
  }

  async delete(id: string, userId: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) throw new BadRequestException('Invalid flashcard ID');
    const card = await this.flashcardModel.findOneAndDelete({ _id: id, userId });
    if (!card) throw new NotFoundException('Flashcard not found');
    await this.topicModel.findByIdAndUpdate(card.topicId, { $inc: { 'stats.flashcardsCount': -1 } });
    return null;
  }

  async review(id: string, userId: string, quality: number) {
    if (!mongoose.Types.ObjectId.isValid(id)) throw new BadRequestException('Invalid flashcard ID');
    if (!Number.isInteger(quality) || quality < 0 || quality > 5) throw new BadRequestException('Quality must be 0-5');

    const card = await this.flashcardModel.findOne({ _id: id, userId });
    if (!card) throw new NotFoundException('Flashcard not found');

    // SM-2 spaced repetition algorithm
    const currentEase = card.easeFactor || 2.5;
    const currentInterval = card.intervalDays || 0;
    const currentReps = card.reviewCount || 0;

    let newEase = currentEase + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    newEase = Math.min(3.5, Math.max(1.3, newEase));

    let newReps = currentReps;
    let newInterval = currentInterval;

    if (quality < 3) {
      newReps = 0;
      newInterval = 1;
    } else {
      newReps = currentReps + 1;
      if (newReps === 1) newInterval = 1;
      else if (newReps === 2) newInterval = 6;
      else newInterval = Math.round(currentInterval * newEase);
    }

    const confidence = quality >= 4 ? 'easy' : quality === 3 ? 'medium' : 'hard';
    const status = quality < 3 ? 'learning' : newReps >= 5 ? 'mastered' : 'review';
    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + Math.max(1, newInterval));

    card.easeFactor = newEase;
    card.intervalDays = newInterval;
    card.reviewCount = newReps;
    card.lastReviewed = new Date();
    card.nextReview = nextReview;
    card.confidence = confidence as any;
    card.status = status as any;
    await card.save();
    return card;
  }

  async importBulk(userId: string, topicId: string, flashcards: any[]) {
    if (!mongoose.Types.ObjectId.isValid(topicId)) throw new BadRequestException('Invalid topic ID');
    const topic = await this.topicModel.findOne({ _id: topicId, userId });
    if (!topic) throw new NotFoundException('Topic not found');

    const batchId = new mongoose.Types.ObjectId().toString();
    const docs = flashcards.map((f) => ({
      ...f,
      topicId,
      userId,
      importSource: { type: 'manual', importedAt: new Date(), batchId },
    }));

    const created = await this.flashcardModel.insertMany(docs as any);
    await this.topicModel.findByIdAndUpdate(topicId, { $inc: { 'stats.flashcardsCount': created.length } });
    return created;
  }
}
