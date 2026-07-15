import mongoose, { Document, Schema, Model } from 'mongoose';

export interface ITopicStats {
  notesCount: number;
  flashcardsCount: number;
  quizzesCount: number;
  completionPercentage: number;
}

export interface ITopic {
  name: string;
  slug: string;
  description?: string;
  parentId?: mongoose.Types.ObjectId;
  level: number;
  path: mongoose.Types.ObjectId[];
  status: 'not-started' | 'in-progress' | 'review' | 'mastered';
  tags: string[];
  favorite: boolean;
  isPublic?: boolean;
  shareId?: string | null;
  lastReviewed?: Date;
  stats: ITopicStats;
  userId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITopicDocument extends ITopic, Document {
  progress: number;
}

export type ITopicModel = Model<ITopicDocument>;

const topicSchema = new Schema<ITopicDocument, ITopicModel>(
  {
    name: { type: String, required: true, trim: true, minlength: 1, maxlength: 200 },
    slug: { type: String, trim: true, lowercase: true, maxlength: 250 },
    description: { type: String, trim: true },
    parentId: { type: Schema.Types.ObjectId, ref: 'Topic', default: null },
    level: { type: Number, default: 0, min: 0 },
    path: [{ type: Schema.Types.ObjectId, ref: 'Topic' }],
    status: { type: String, enum: ['not-started', 'in-progress', 'review', 'mastered'], default: 'not-started' },
    tags: [{ type: String, trim: true }],
    favorite: { type: Boolean, default: false },
    isPublic: { type: Boolean, default: false },
    shareId: { type: String },
    lastReviewed: Date,
    stats: {
      notesCount: { type: Number, default: 0 },
      flashcardsCount: { type: Number, default: 0 },
      quizzesCount: { type: Number, default: 0 },
      completionPercentage: { type: Number, default: 0, min: 0, max: 100 },
    },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

topicSchema.virtual('progress').get(function () {
  return this.stats.completionPercentage;
});

topicSchema.pre('save', async function () {
  if (!this.isModified('parentId') || !this.parentId) return;
  if (this.parentId.equals(this._id)) throw new Error('A topic cannot be its own parent');
  const parent = await (this.constructor as ITopicModel).findById(this.parentId).select('path');
  if (parent) {
    const ancestorIds = [...parent.path, parent._id];
    if (ancestorIds.some((id) => id.equals(this._id as mongoose.Types.ObjectId))) {
      throw new Error('Circular reference detected in topic hierarchy');
    }
  }
});

topicSchema.pre('save', async function () {
  if (this.isModified('name') || !this.slug) {
    const baseSlug = this.name.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');
    let slug = baseSlug;
    let counter = 1;
    const query: any = { slug, parentId: this.parentId, _id: { $ne: this._id } };
    if (this.userId) query.userId = this.userId;
    const Model = this.constructor as ITopicModel;
    while (await Model.findOne(query)) {
      slug = `${baseSlug}-${counter}`;
      query.slug = slug;
      counter++;
    }
    this.slug = slug;
  }
});

topicSchema.index({ userId: 1, parentId: 1 });
topicSchema.index({ userId: 1, slug: 1 });
topicSchema.index({ userId: 1, parentId: 1, slug: 1 }, { unique: true });
topicSchema.index({ userId: 1, path: 1 });
topicSchema.index({ shareId: 1 }, { unique: true, sparse: true });
topicSchema.index({ isPublic: 1, createdAt: -1 });
topicSchema.index({ createdAt: -1 });

export const TopicSchema = topicSchema;
export const TOPIC_MODEL = 'Topic';
