import mongoose, { Document, Schema, Model } from "mongoose";

// TypeScript interfaces
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
  status: "not-started" | "in-progress" | "review" | "mastered";
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
  progress: number; // virtual
  subtopics: ITopicDocument[]; // virtual
}

export type ITopicModel = Model<ITopicDocument>;

const topicSchema = new Schema<ITopicDocument, ITopicModel>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: [1, "Name cannot be empty"],
      maxlength: [200, "Name cannot exceed 200 characters"],
    },
    slug: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: [250, "Slug cannot exceed 250 characters"],
    },
    description: {
      type: String,
      trim: true,
    },

    // Hierarchy
    parentId: {
      type: Schema.Types.ObjectId,
      ref: "Topic",
      default: null,
    },
    level: {
      type: Number,
      default: 0,
      min: 0,
    },
    path: [
      {
        type: Schema.Types.ObjectId,
        ref: "Topic",
      },
    ],

    // Metadata
    status: {
      type: String,
      enum: ["not-started", "in-progress", "review", "mastered"],
      default: "not-started",
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    favorite: {
      type: Boolean,
      default: false,
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    shareId: {
      type: String,
    },
    lastReviewed: Date,

    // Cached stats
    stats: {
      notesCount: { type: Number, default: 0 },
      flashcardsCount: { type: Number, default: 0 },
      quizzesCount: { type: Number, default: 0 },
      completionPercentage: { type: Number, default: 0, min: 0, max: 100 },
    },

    // User reference (required for data isolation)
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Topic must belong to a user"],
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Indexes for efficient queries
topicSchema.index({ userId: 1, parentId: 1 });
topicSchema.index({ userId: 1, level: 1 });
topicSchema.index({ userId: 1, createdAt: -1 });
topicSchema.index({ userId: 1, slug: 1 });

// Virtual for UI compatibility
topicSchema.virtual("progress").get(function (this: ITopicDocument) {
  return this.stats.completionPercentage;
});

// Virtual to get direct children (subtopics)
topicSchema.virtual("subtopics", {
  ref: "Topic",
  localField: "_id",
  foreignField: "parentId",
});

// Validation to prevent circular references
topicSchema.pre("save", async function () {
  if (!this.isModified("parentId") || !this.parentId) return;

  // Prevent self-reference
  if (this.parentId.equals(this._id)) {
    throw new Error("A topic cannot be its own parent");
  }

  // Prevent circular references: the new parent's ancestor chain must not
  // include this topic (which would mean this topic is one of its own
  // ancestors after the move).
  const Model = this.constructor as ITopicModel;
  const parent = await Model.findById(this.parentId).select("path");
  if (parent) {
    const ancestorIds = [...parent.path, parent._id];
    if (ancestorIds.some((id) => id.equals(this._id as mongoose.Types.ObjectId))) {
      throw new Error("Circular reference detected in topic hierarchy");
    }
  }
});

// Pre-save hook to auto-generate slug from name
topicSchema.pre("save", async function () {
  if (this.isModified("name") || !this.slug) {
    // Generate base slug from name
    const baseSlug = this.name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "") // Remove special chars
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/-+/g, "-"); // Replace multiple hyphens with single

    // Ensure uniqueness by checking existing slugs at same level
    let slug = baseSlug;
    let counter = 1;

    const query: {
      slug: string;
      parentId?: mongoose.Types.ObjectId;
      _id: { $ne: mongoose.Types.ObjectId };
      userId?: mongoose.Types.ObjectId;
    } = {
      slug: slug,
      parentId: this.parentId,
      _id: { $ne: this._id },
    };
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

// Indexes
topicSchema.index({ slug: 1, parentId: 1 });
// Enforces slug uniqueness atomically (the pre-save hook's check-then-act
// loop above is only a best-effort first guess; this index is the real
// guard, paired with retry-on-conflict in topicController.createTopic).
topicSchema.index({ userId: 1, parentId: 1, slug: 1 }, { unique: true });
topicSchema.index({ userId: 1, path: 1 });
topicSchema.index({ userId: 1, tags: 1 });
topicSchema.index({ createdAt: -1 });
topicSchema.index({ shareId: 1 }, { unique: true, sparse: true });
topicSchema.index({ isPublic: 1, createdAt: -1 });

export default mongoose.models.Topic ||
  mongoose.model<ITopicDocument, ITopicModel>("Topic", topicSchema);
