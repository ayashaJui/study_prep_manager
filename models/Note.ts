import mongoose, { Document, Schema, Model } from "mongoose";

// TypeScript interface
export interface INote {
  topicId: mongoose.Types.ObjectId;
  content: string;
  tags: string[];
  userId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface INoteDocument extends INote, Document {}

export type INoteModel = Model<INoteDocument>;

const noteSchema = new Schema<INoteDocument, INoteModel>(
  {
    topicId: {
      type: Schema.Types.ObjectId,
      ref: "Topic",
      required: true,
    },

    // Content
    content: {
      type: String,
      required: true,
      minlength: [1, "Content cannot be empty"],
    },
    // Organization
    tags: [
      {
        type: String,
        trim: true,
      },
    ],

    // User reference (required for data isolation)
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Note must belong to a user"],
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes
noteSchema.index({ userId: 1, topicId: 1 });
noteSchema.index({ userId: 1, createdAt: -1 });
noteSchema.index({ userId: 1, tags: 1 });

export default mongoose.models.Note ||
  mongoose.model<INoteDocument, INoteModel>("Note", noteSchema);
