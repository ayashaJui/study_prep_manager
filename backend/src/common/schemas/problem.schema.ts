import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IProblem {
  userId: mongoose.Types.ObjectId;
  topicId?: mongoose.Types.ObjectId | null;
  title: string;
  platform: string;
  problemNumber?: string;
  url?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  status: 'unsolved' | 'attempted' | 'solved';
  tags: string[];
  notes?: string;
  timeComplexity?: string;
  spaceComplexity?: string;
  language?: string;
  nextReview?: Date;
  reviewInterval?: number;
  reviewCount: number;
  lastReviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IProblemDocument extends IProblem, Document {}
export type IProblemModel = Model<IProblemDocument>;

const problemSchema = new Schema<IProblemDocument, IProblemModel>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    topicId: { type: Schema.Types.ObjectId, ref: 'Topic', default: null },
    title: { type: String, required: true, trim: true },
    platform: { type: String, required: true, trim: true },
    problemNumber: { type: String, trim: true },
    url: { type: String, trim: true },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
    status: { type: String, enum: ['unsolved', 'attempted', 'solved'], default: 'unsolved' },
    tags: [{ type: String, trim: true }],
    notes: { type: String },
    timeComplexity: { type: String, trim: true },
    spaceComplexity: { type: String, trim: true },
    language: { type: String, trim: true },
    nextReview: { type: Date },
    reviewInterval: { type: Number, min: 0 },
    reviewCount: { type: Number, default: 0 },
    lastReviewedAt: { type: Date },
  },
  { timestamps: true },
);

problemSchema.index({ userId: 1, topicId: 1 });
problemSchema.index({ userId: 1, status: 1 });
problemSchema.index({ userId: 1, nextReview: 1 });

export const ProblemSchema = problemSchema;
export const PROBLEM_MODEL = 'Problem';
