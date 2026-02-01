import mongoose, { Document, Schema, Model } from "mongoose";

// TypeScript interface
export interface INote {
  topicId: mongoose.Types.ObjectId;
  content: string;
  title?: string;
  tags: string[];
  userId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface INoteDocument extends INote, Document {}

export interface INoteModel extends Model<INoteDocument> {}

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
    title: {
      type: String,
      trim: true,
      maxlength: [300, "Title cannot exceed 300 characters"],
    },

    // Organization
    tags: [
      {
        type: String,
        trim: true,
      },
    ],

    // User reference (optional until user system is implemented)
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
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
