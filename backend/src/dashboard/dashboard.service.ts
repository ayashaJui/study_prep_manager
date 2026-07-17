import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ITopicDocument, TOPIC_MODEL } from '../common/schemas/topic.schema';
import { INoteDocument, NOTE_MODEL } from '../common/schemas/note.schema';
import { IFlashcardDocument, FLASHCARD_MODEL } from '../common/schemas/flashcard.schema';
import { IQuizDocument, QUIZ_MODEL } from '../common/schemas/quiz.schema';
import { IStudySessionDocument, STUDY_SESSION_MODEL } from '../common/schemas/study-session.schema';
import { IUserDocument, USER_MODEL } from '../common/schemas/user.schema';

type WeeklyGoalMetric = 'flashcards' | 'quizzes' | 'topics' | 'notes';
const METRICS: WeeklyGoalMetric[] = ['flashcards', 'quizzes', 'topics', 'notes'];

function timeAgo(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const m = Math.floor(diffMs / 60000);
  const h = Math.floor(diffMs / 3600000);
  const d = Math.floor(diffMs / 86400000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  if (d < 7) return `${d}d ago`;
  if (d < 30) return `${Math.floor(d / 7)}w ago`;
  return `${Math.floor(d / 30)}mo ago`;
}

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(TOPIC_MODEL) private topicModel: Model<ITopicDocument>,
    @InjectModel(NOTE_MODEL) private noteModel: Model<INoteDocument>,
    @InjectModel(FLASHCARD_MODEL) private flashcardModel: Model<IFlashcardDocument>,
    @InjectModel(QUIZ_MODEL) private quizModel: Model<IQuizDocument>,
    @InjectModel(STUDY_SESSION_MODEL) private sessionModel: Model<IStudySessionDocument>,
    @InjectModel(USER_MODEL) private userModel: Model<IUserDocument>,
  ) {}

  async getStats(userId: string) {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [totalTopics, totalFlashcards, totalQuizzes, quizzes, recentSessions] = await Promise.all([
      this.topicModel.countDocuments({ userId, level: 0 }),
      this.flashcardModel.countDocuments({ userId }),
      this.quizModel.countDocuments({ userId }),
      this.quizModel.find({ userId }).select('attempts lastScore'),
      this.sessionModel.find({ userId, createdAt: { $gte: sevenDaysAgo } }).select('duration'),
    ]);

    const attemptedQuizzes = quizzes.filter((q) => q.lastScore !== null);
    const averageScore = attemptedQuizzes.length > 0
      ? Math.round(attemptedQuizzes.reduce((sum, q) => {
          const last = (q.attempts || []).slice(-1)[0];
          return sum + (last ? Math.round((last.score / (last.totalPoints || 1)) * 100) : 0);
        }, 0) / attemptedQuizzes.length)
      : 0;

    const studyMinutes = recentSessions.reduce((s, sess) => s + (sess.duration || 0), 0);

    const [flashcardsReviewed, quizzesTaken, notesCreated] = await Promise.all([
      this.flashcardModel.countDocuments({ userId, updatedAt: { $gte: sevenDaysAgo } }),
      this.quizModel.countDocuments({ userId, updatedAt: { $gte: sevenDaysAgo } }),
      this.noteModel.countDocuments({ userId, createdAt: { $gte: sevenDaysAgo } }),
    ]);

    return {
      totalTopics,
      totalFlashcards,
      totalQuizzes,
      averageScore,
      weeklyStats: {
        flashcardsReviewed,
        quizzesTaken,
        notesCreated,
        studyTime: Math.round((studyMinutes / 60) * 10) / 10,
      },
    };
  }

  async getActivity(userId: string, limit = 10) {
    const [notes, flashcards, quizzes] = await Promise.all([
      this.noteModel.find({ userId }).sort({ updatedAt: -1 }).limit(limit).populate('topicId', 'name'),
      this.flashcardModel.find({ userId }).sort({ updatedAt: -1 }).limit(limit).populate('topicId', 'name'),
      this.quizModel.find({ userId }).sort({ updatedAt: -1 }).limit(limit).populate('topicId', 'name'),
    ]);

    return [
      ...notes.map((n) => ({ id: n._id, action: 'Created notes', topic: (n.topicId as any)?.name || 'Unknown', time: timeAgo(n.updatedAt), timestamp: n.updatedAt })),
      ...flashcards.map((f) => ({ id: f._id, action: 'Added flashcards', topic: (f.topicId as any)?.name || 'Unknown', time: timeAgo(f.updatedAt), timestamp: f.updatedAt })),
      ...quizzes.map((q) => ({ id: q._id, action: q.lastScore ? 'Completed quiz' : 'Created quiz', topic: (q.topicId as any)?.name || 'Unknown', time: timeAgo(q.updatedAt), timestamp: q.updatedAt, score: q.lastScore ? `${q.lastScore}` : undefined })),
    ]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit)
      .map(({ timestamp: _ts, ...rest }) => rest);
  }

  async getProgress(userId: string) {
    const topics = await this.topicModel.find({ userId, level: 0 }).select('name status stats').lean();
    return topics.map((t) => ({
      id: t._id,
      name: t.name,
      status: t.status,
      progress: t.stats?.completionPercentage ?? 0,
    }));
  }

  async getGoals(userId: string) {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [flashcardsThisWeek, quizzesThisWeek, notesThisWeek, topicsReviewed, totalFlashcards, user] = await Promise.all([
      this.flashcardModel.countDocuments({ userId, createdAt: { $gte: sevenDaysAgo } }),
      this.quizModel.countDocuments({ userId, createdAt: { $gte: sevenDaysAgo } }),
      this.noteModel.countDocuments({ userId, createdAt: { $gte: sevenDaysAgo } }),
      this.sessionModel.distinct('topicId', { userId, topicId: { $ne: null }, createdAt: { $gte: sevenDaysAgo } }),
      this.flashcardModel.countDocuments({ userId }),
      this.userModel.findById(userId).select('weeklyGoals').lean(),
    ]);

    const defaultFlashcardTarget = Math.max(20, Math.ceil(totalFlashcards / 4));
    const defaults: Record<WeeklyGoalMetric, { label: string; target: number }> = {
      flashcards: { label: `Complete ${defaultFlashcardTarget} flashcards`, target: defaultFlashcardTarget },
      quizzes: { label: 'Take 3 practice quizzes', target: 3 },
      topics: { label: 'Review 5 topics', target: 5 },
      notes: { label: 'Create 10 new notes', target: 10 },
    };

    const overrides = new Map((user?.weeklyGoals || []).map((g: any) => [g.metric, g]));
    const current: Record<WeeklyGoalMetric, number> = {
      flashcards: flashcardsThisWeek,
      quizzes: quizzesThisWeek,
      topics: topicsReviewed.length,
      notes: notesThisWeek,
    };

    return METRICS.map((metric) => {
      const override = overrides.get(metric) as any;
      const label = override?.label ?? defaults[metric].label;
      const target = override?.target ?? defaults[metric].target;
      return { metric, goal: label, current: Math.min(target, current[metric]), total: target };
    });
  }

  async updateGoals(userId: string, goals: { metric: WeeklyGoalMetric; label: string; target: number }[]) {
    const valid = ['flashcards', 'quizzes', 'topics', 'notes'];
    const seen = new Set<string>();
    for (const g of goals) {
      if (!valid.includes(g.metric) || seen.has(g.metric)) throw new Error(`Invalid or duplicate metric: ${g.metric}`);
      if (!g.label?.trim()) throw new Error('Each goal needs a label');
      if (!Number.isInteger(g.target) || g.target < 1 || g.target > 1000) throw new Error('Target must be 1-1000');
      seen.add(g.metric);
    }
    await this.userModel.findByIdAndUpdate(userId, { weeklyGoals: goals });
    return goals;
  }
}
