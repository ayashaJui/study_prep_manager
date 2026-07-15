import mongoose, { Document, Schema, Model } from 'mongoose';

export interface INote {
  topicId: mongoose.Types.ObjectId;
  content: string;
  tags: string[];
  pinned: boolean;
  userId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface INoteDocument extends INote, Document {}
export type INoteModel = Model<INoteDocument>;

const noteSchema = new Schema<INoteDocument, INoteModel>(
  {
    topicId: { type: Schema.Types.ObjectId, ref: 'Topic', required: true },
    content: { type: String, required: true, minlength: 1 },
    tags: [{ type: String, trim: true }],
    pinned: { type: Boolean, default: false },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  },
  { timestamps: true },
);

noteSchema.index({ userId: 1, topicId: 1 });
noteSchema.index({ userId: 1, createdAt: -1 });
noteSchema.index({ userId: 1, topicId: 1, pinned: -1, createdAt: -1 });

export const NoteSchema = noteSchema;
export const NOTE_MODEL = 'Note';
