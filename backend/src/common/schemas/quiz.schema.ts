// eslint-disable-next-line @typescript-eslint/no-var-requires
import mongoose, { Document, Schema, Model } from 'mongoose';
/* eslint-disable @typescript-eslint/no-explicit-any */

export interface IQuizQuestion {
  id: string;
  kind?: 'multiple-choice' | 'true-false' | 'short-answer';
  question: string;
  options: string[];
  correctAnswer: number | number[] | string;
  explanation?: string;
  points: number;
  tags: string[];
}

export interface IQuizAttempt {
  attemptId: mongoose.Types.ObjectId;
  date: Date;
  score: number;
  totalPoints: number;
  timeTaken: number;
  answers: { questionId: string; selectedAnswer: number; isCorrect: boolean; pointsEarned: number }[];
}

export interface IQuiz {
  topicId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  source?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  type: 'multiple-choice' | 'true-false' | 'mixed' | 'short-answer';
  timeLimit?: number;
  tags: string[];
  questions: IQuizQuestion[];
  importSource?: { importType?: string; fileName?: string; importedAt?: Date; originalFormat?: string };
  attempts: IQuizAttempt[];
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  showAnswersImmediately: boolean;
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IQuizDocument extends IQuiz, Document {
  lastScore: string | null;
  lastAttemptDate: string | null;
  attemptsCount: number;
}

export type IQuizModel = Model<IQuizDocument>;

const questionSchema = new Schema<IQuizQuestion>(
  {
    id: { type: String, required: true },
    kind: { type: String, enum: ['multiple-choice', 'true-false', 'short-answer'] },
    question: { type: String, required: true },
    options: [{ type: String }],
    correctAnswer: { type: Schema.Types.Mixed, required: true },
    explanation: String,
    points: { type: Number, default: 1, min: 0 },
    tags: [{ type: String, trim: true }],
  },
  { _id: false },
);

const attemptSchema = new Schema<IQuizAttempt>(
  {
    attemptId: { type: Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() },
    date: { type: Date, default: Date.now },
    score: { type: Number, min: 0 },
    totalPoints: { type: Number, min: 0 },
    timeTaken: { type: Number, min: 0 },
    answers: [{ questionId: String, selectedAnswer: Number, isCorrect: Boolean, pointsEarned: { type: Number, default: 0 } }],
  },
  { _id: false },
);

const quizSchema = new Schema<IQuizDocument, IQuizModel>(
  {
    topicId: { type: Schema.Types.ObjectId, ref: 'Topic', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    source: { type: String, trim: true },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    type: { type: String, enum: ['multiple-choice', 'true-false', 'mixed', 'short-answer'], default: 'multiple-choice' },
    timeLimit: { type: Number, min: 1 },
    tags: [{ type: String, trim: true }],
    questions: { type: [questionSchema], validate: { validator: (q: any[]) => q.length > 0, message: 'Quiz must have at least one question' } },
    importSource: { type: Schema.Types.Mixed, default: undefined },
    attempts: [attemptSchema],
    shuffleQuestions: { type: Boolean, default: false },
    shuffleOptions: { type: Boolean, default: false },
    showAnswersImmediately: { type: Boolean, default: false },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

quizSchema.virtual('lastScore').get(function (this: IQuizDocument) {
  if (!this.attempts || this.attempts.length === 0) return null;
  const last = this.attempts[this.attempts.length - 1];
  if (!last.totalPoints) return '0%';
  return Math.round((last.score / last.totalPoints) * 100) + '%';
});

quizSchema.virtual('lastAttemptDate').get(function (this: IQuizDocument) {
  if (!this.attempts || this.attempts.length === 0) return null;
  return this.attempts[this.attempts.length - 1].date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
});

quizSchema.virtual('attemptsCount').get(function (this: IQuizDocument) {
  return this.attempts ? this.attempts.length : 0;
});

quizSchema.index({ userId: 1, topicId: 1 });
quizSchema.index({ userId: 1, createdAt: -1 });

export const QuizSchema: Schema = quizSchema;
export const QUIZ_MODEL = 'Quiz';
