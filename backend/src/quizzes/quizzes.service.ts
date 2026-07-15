import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import mongoose from 'mongoose';
import { IQuizDocument, QUIZ_MODEL } from '../common/schemas/quiz.schema';
import { ITopicDocument, TOPIC_MODEL } from '../common/schemas/topic.schema';
import { IStudySessionDocument, STUDY_SESSION_MODEL } from '../common/schemas/study-session.schema';

@Injectable()
export class QuizzesService {
  constructor(
    @InjectModel(QUIZ_MODEL) private quizModel: Model<IQuizDocument>,
    @InjectModel(TOPIC_MODEL) private topicModel: Model<ITopicDocument>,
    @InjectModel(STUDY_SESSION_MODEL) private sessionModel: Model<IStudySessionDocument>,
  ) {}

  async getAll(userId: string, topicId: string) {
    if (!mongoose.Types.ObjectId.isValid(topicId)) throw new BadRequestException('Invalid topic ID');
    return this.quizModel.find({ topicId, userId }).sort({ createdAt: -1 });
  }

  async getById(id: string, userId: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) throw new BadRequestException('Invalid quiz ID');
    const quiz = await this.quizModel.findOne({ _id: id, userId });
    if (!quiz) throw new NotFoundException('Quiz not found');
    return quiz;
  }

  async create(userId: string, data: any) {
    if (!mongoose.Types.ObjectId.isValid(data.topicId)) throw new BadRequestException('Invalid topic ID');
    const topic = await this.topicModel.findOne({ _id: data.topicId, userId });
    if (!topic) throw new NotFoundException('Topic not found');

    const quiz = await this.quizModel.create({ ...data, userId } as any);
    await this.topicModel.findByIdAndUpdate(data.topicId, { $inc: { 'stats.quizzesCount': 1 } });
    return quiz;
  }

  async update(id: string, userId: string, data: any) {
    if (!mongoose.Types.ObjectId.isValid(id)) throw new BadRequestException('Invalid quiz ID');
    const quiz = await this.quizModel.findOneAndUpdate({ _id: id, userId }, data, { new: true, runValidators: true });
    if (!quiz) throw new NotFoundException('Quiz not found');
    return quiz;
  }

  async delete(id: string, userId: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) throw new BadRequestException('Invalid quiz ID');
    const quiz = await this.quizModel.findOneAndDelete({ _id: id, userId });
    if (!quiz) throw new NotFoundException('Quiz not found');
    await this.topicModel.findByIdAndUpdate(quiz.topicId, { $inc: { 'stats.quizzesCount': -1 } });
    return null;
  }

  async submit(id: string, userId: string, answers: { questionId: string; selectedAnswer: number | number[] | null }[], timeTaken: number) {
    if (!mongoose.Types.ObjectId.isValid(id)) throw new BadRequestException('Invalid quiz ID');
    const quiz = await this.quizModel.findOne({ _id: id, userId });
    if (!quiz) throw new NotFoundException('Quiz not found');

    let score = 0;
    let totalPoints = 0;
    for (const q of quiz.questions) {
      totalPoints += q.points || 1;
      const submitted = answers.find((a) => a.questionId === q.id);
      if (!submitted || submitted.selectedAnswer === null) continue;

      const correct = Array.isArray(q.correctAnswer) ? q.correctAnswer : [q.correctAnswer];
      const selected = Array.isArray(submitted.selectedAnswer) ? submitted.selectedAnswer : [submitted.selectedAnswer];
      const sorted = (arr: number[]) => [...arr].sort((a, b) => a - b);
      if (JSON.stringify(sorted(selected as number[])) === JSON.stringify(sorted(correct as number[]))) {
        score += q.points || 1;
      }
    }

    await this.quizModel.findOneAndUpdate(
      { _id: id, userId },
      { $push: { attempts: { attemptId: new mongoose.Types.ObjectId(), date: new Date(), score, totalPoints, timeTaken, answers: [] } } },
    );

    const scorePct = totalPoints > 0 ? Math.round((score / totalPoints) * 100) : 0;
    await this.sessionModel.create({ userId, topicId: quiz.topicId, activityType: 'quiz' as any, duration: Math.ceil(timeTaken / 60), score: scorePct });

    return { score, totalPoints };
  }

  async getAnalytics(userId: string, topicId: string) {
    const quizzes = await this.quizModel.find({ userId, topicId }).lean();
    const summary = { totalQuizzes: quizzes.length, quizzesAttempted: 0, totalAttempts: 0, avgScore: 0, bestScore: 0 };
    const analyticsQuizzes: any[] = [];
    let totalScorePct = 0;

    for (const quiz of quizzes) {
      const attempts = (quiz.attempts || []).map((a: any) => ({
        date: a.date,
        scorePct: a.totalPoints > 0 ? Math.round((a.score / a.totalPoints) * 100) : 0,
        timeTaken: a.timeTaken,
      }));
      if (attempts.length > 0) {
        summary.quizzesAttempted++;
        summary.totalAttempts += attempts.length;
        const avg = attempts.reduce((s: number, a: any) => s + a.scorePct, 0) / attempts.length;
        totalScorePct += avg;
        summary.bestScore = Math.max(summary.bestScore, ...attempts.map((a: any) => a.scorePct));
      }
      analyticsQuizzes.push({ quizId: quiz._id, title: quiz.title, difficulty: quiz.difficulty, attempts });
    }

    if (summary.quizzesAttempted > 0) summary.avgScore = Math.round(totalScorePct / summary.quizzesAttempted);
    return { summary, quizzes: analyticsQuizzes };
  }

  async importBulk(userId: string, topicId: string, quizzes: any[]) {
    if (!mongoose.Types.ObjectId.isValid(topicId)) throw new BadRequestException('Invalid topic ID');
    const topic = await this.topicModel.findOne({ _id: topicId, userId });
    if (!topic) throw new NotFoundException('Topic not found');

    const docs = quizzes.map((q) => ({ ...q, topicId, userId, attempts: [] }));
    const created = await this.quizModel.insertMany(docs as any);
    await this.topicModel.findByIdAndUpdate(topicId, { $inc: { 'stats.quizzesCount': created.length } });
    return created;
  }
}
