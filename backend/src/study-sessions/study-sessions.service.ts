import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IStudySessionDocument, STUDY_SESSION_MODEL } from '../common/schemas/study-session.schema';

const getDayKey = (date: Date, timeZone: string) =>
  new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);

const isValidTimeZone = (tz: string) => {
  try { new Intl.DateTimeFormat('en-US', { timeZone: tz }); return true; } catch { return false; }
};

@Injectable()
export class StudySessionsService {
  constructor(@InjectModel(STUDY_SESSION_MODEL) private sessionModel: Model<IStudySessionDocument>) {}

  async create(userId: string, data: { topicId?: string; activityType: string; duration: number; score?: number }) {
    return this.sessionModel.create({ userId, topicId: data.topicId || null, activityType: data.activityType as any, duration: data.duration || 0, score: data.score });
  }

  async getHistory(userId: string, limit = 10, page = 1) {
    const query = { userId };
    const [sessions, total] = await Promise.all([
      this.sessionModel.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      this.sessionModel.countDocuments(query),
    ]);
    return { sessions, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async getStreak(userId: string, tz?: string) {
    const timeZone = tz && isValidTimeZone(tz) ? tz : 'UTC';
    const sessions = await this.sessionModel.find({ userId }).sort({ createdAt: -1 }).select('createdAt');

    if (sessions.length === 0) return { streak: 0, lastStudyDate: null };

    const uniqueDays = [...new Set(sessions.map((s) => getDayKey(s.createdAt, timeZone)))].sort((a, b) => (a > b ? -1 : 1));

    const todayKey = getDayKey(new Date(), timeZone);
    const yesterday = new Date();
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);
    const yesterdayKey = getDayKey(yesterday, timeZone);

    if (uniqueDays[0] !== todayKey && uniqueDays[0] !== yesterdayKey) return { streak: 0, lastStudyDate: uniqueDays[0] };

    let streak = 0;
    for (let i = 0; i < uniqueDays.length; i++) {
      const expected = new Date(`${uniqueDays[0]}T00:00:00Z`);
      expected.setUTCDate(expected.getUTCDate() - i);
      if (uniqueDays[i] === getDayKey(expected, timeZone)) streak++;
      else break;
    }

    return { streak, lastStudyDate: uniqueDays[0] };
  }
}
