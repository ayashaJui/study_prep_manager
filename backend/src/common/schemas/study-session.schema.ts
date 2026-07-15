import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IStudySession {
  userId: mongoose.Types.ObjectId;
  topicId?: mongoose.Types.ObjectId | null;
  activityType: 'flashcard' | 'quiz' | 'note' | 'review';
  duration: number;
  score?: number;
  createdAt: Date;
}

export interface IStudySessionDocument extends IStudySession, Document {}
export type IStudySessionModel = Model<IStudySessionDocument>;

const studySessionSchema = new Schema<IStudySessionDocument, IStudySessionModel>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    topicId: { type: Schema.Types.ObjectId, ref: 'Topic', default: null },
    activityType: { type: String, enum: ['flashcard', 'quiz', 'note', 'review'], required: true },
    duration: { type: Number, default: 0, min: 0 },
    score: { type: Number, min: 0, max: 100 },
    createdAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: false },
);

studySessionSchema.index({ userId: 1, createdAt: -1 });

export const StudySessionSchema = studySessionSchema;
export const STUDY_SESSION_MODEL = 'StudySession';
