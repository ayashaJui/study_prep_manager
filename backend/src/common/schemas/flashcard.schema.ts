import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IFlashcard {
  topicId: mongoose.Types.ObjectId;
  front: string;
  back: string;
  tags: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  status: 'new' | 'learning' | 'review' | 'mastered';
  confidence: 'easy' | 'medium' | 'hard';
  lastReviewed?: Date;
  nextReview?: Date;
  easeFactor?: number;
  intervalDays?: number;
  reviewCount: number;
  importSource?: { type?: string; fileName?: string; importedAt?: Date; batchId?: string };
  userId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IFlashcardDocument extends IFlashcard, Document {}
export type IFlashcardModel = Model<IFlashcardDocument>;

const flashcardSchema = new Schema<IFlashcardDocument, IFlashcardModel>(
  {
    topicId: { type: Schema.Types.ObjectId, ref: 'Topic', required: true },
    front: { type: String, required: true, minlength: 1 },
    back: { type: String, required: true, minlength: 1 },
    tags: [{ type: String, trim: true }],
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    status: { type: String, enum: ['new', 'learning', 'review', 'mastered'], default: 'new' },
    confidence: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    lastReviewed: Date,
    nextReview: Date,
    easeFactor: { type: Number, default: 2.5, min: 1.3, max: 3.5 },
    intervalDays: { type: Number, default: 0, min: 0 },
    reviewCount: { type: Number, default: 0, min: 0 },
    importSource: {
      type: { type: String, enum: ['manual', 'csv', 'json', 'anki', 'quizlet', 'generated'] },
      fileName: String,
      importedAt: Date,
      batchId: String,
    },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  },
  { timestamps: true },
);

flashcardSchema.index({ userId: 1, topicId: 1 });
flashcardSchema.index({ userId: 1, nextReview: 1 });
flashcardSchema.index({ userId: 1, status: 1 });

export const FlashcardSchema = flashcardSchema;
export const FLASHCARD_MODEL = 'Flashcard';
