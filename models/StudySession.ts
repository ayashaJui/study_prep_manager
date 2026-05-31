import mongoose, { Document, Model, Schema } from "mongoose";

export interface IStudySession {
  userId: mongoose.Types.ObjectId;
  topicId?: mongoose.Types.ObjectId | null;
  activityType: "flashcard" | "quiz" | "note" | "review";
  duration: number; // minutes
  score?: number;
  createdAt: Date;
}

export interface IStudySessionDocument extends IStudySession, Document {}

export interface IStudySessionModel extends Model<IStudySessionDocument> {}

const studySessionSchema = new Schema<
  IStudySessionDocument,
  IStudySessionModel
>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Study session must belong to a user"],
      index: true,
    },
    topicId: {
      type: Schema.Types.ObjectId,
      ref: "Topic",
      default: null,
    },
    activityType: {
      type: String,
      enum: ["flashcard", "quiz", "note", "review"],
      required: true,
    },
    duration: {
      type: Number,
      default: 0,
      min: 0,
    },
    score: {
      type: Number,
      min: 0,
      max: 100,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: false,
  },
);

studySessionSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.models.StudySession ||
  mongoose.model<IStudySessionDocument, IStudySessionModel>(
    "StudySession",
    studySessionSchema,
  );
