import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ITopicDocument, TOPIC_MODEL } from '../common/schemas/topic.schema';
import { INoteDocument, NOTE_MODEL } from '../common/schemas/note.schema';
import { IFlashcardDocument, FLASHCARD_MODEL } from '../common/schemas/flashcard.schema';
import { IQuizDocument, QUIZ_MODEL } from '../common/schemas/quiz.schema';

function escapeRegExp(s: string) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

@Injectable()
export class SearchService {
  constructor(
    @InjectModel(TOPIC_MODEL) private topicModel: Model<ITopicDocument>,
    @InjectModel(NOTE_MODEL) private noteModel: Model<INoteDocument>,
    @InjectModel(FLASHCARD_MODEL) private flashcardModel: Model<IFlashcardDocument>,
    @InjectModel(QUIZ_MODEL) private quizModel: Model<IQuizDocument>,
  ) {}

  async search(userId: string, query: string, limit = 10) {
    if (query.length < 2) return { topics: [], notes: [], flashcards: [], quizzes: [], topicMap: {} };

    const regex = new RegExp(escapeRegExp(query), 'i');
    const cap = Math.min(limit, 25);

    const [topics, notes, flashcards, quizzes] = await Promise.all([
      this.topicModel.find({ userId, $or: [{ name: regex }, { description: regex }, { slug: regex }, { tags: regex }] }).select('name slug description status stats').sort({ createdAt: -1 }).limit(cap).lean(),
      this.noteModel.find({ userId, $or: [{ content: regex }, { tags: regex }] }).select('content topicId').sort({ createdAt: -1 }).limit(cap).lean(),
      this.flashcardModel.find({ userId, $or: [{ front: regex }, { back: regex }, { tags: regex }] }).select('front back topicId').sort({ createdAt: -1 }).limit(cap).lean(),
      this.quizModel.find({ userId, $or: [{ title: regex }, { description: regex }, { tags: regex }, { 'questions.question': regex }] }).select('title description topicId').sort({ createdAt: -1 }).limit(cap).lean(),
    ]);

    const ids = new Set<string>();
    topics.forEach((t: any) => ids.add(String(t._id)));
    notes.forEach((n: any) => n.topicId && ids.add(String(n.topicId)));
    flashcards.forEach((f: any) => f.topicId && ids.add(String(f.topicId)));
    quizzes.forEach((q: any) => q.topicId && ids.add(String(q.topicId)));

    const topicMap: Record<string, { path: string[]; level: number }> = {};
    if (ids.size > 0) {
      const docs = await this.topicModel.find({ _id: { $in: Array.from(ids) } }).select('_id path level').lean();
      docs.forEach((t: any) => { topicMap[String(t._id)] = { path: (t.path || []).map(String), level: t.level ?? 0 }; });
    }

    return { topics, notes, flashcards, quizzes, topicMap };
  }
}
